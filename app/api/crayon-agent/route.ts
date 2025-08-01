import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages } = body;

    console.log("Crayon route: Processing messages:", messages);

    // For now, let's use a simple streaming approach similar to our working route
    // Call OpenAI with basic function calling
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `You are an AG UI agent that dynamically generates UI components based on conversation. 
                   Create a bar chart with sample sales data when the user asks for charts.`
        },
        ...messages
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "generateVisualization",
            description: "Generate a data visualization (chart, graph, etc)",
            parameters: {
              type: "object",
              properties: {
                type: { 
                  type: "string", 
                  enum: ["line", "bar", "pie"],
                  description: "Type of visualization" 
                },
                title: { type: "string", description: "Title of the visualization" },
                data: { 
                  type: "array", 
                  description: "Data points for the visualization",
                  items: {
                    type: "object",
                    properties: {
                      label: { type: "string" },
                      value: { type: "number" }
                    },
                    required: ["label", "value"]
                  }
                }
              },
              required: ["type", "title", "data"]
            }
          }
        }
      ],
      stream: true,
    });

    // Create a simple SSE response
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process in background
    (async () => {
      try {
        let toolCall: any = null;
        let textContent = "";

        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta;

          // Handle text content
          if (delta?.content) {
            textContent += delta.content;
            await writer.write(encoder.encode(`data: ${JSON.stringify({
              type: "text",
              content: delta.content
            })}\n\n`));
          }

          // Handle tool calls
          if (delta?.tool_calls && delta.tool_calls[0]) {
            const tc = delta.tool_calls[0];
            if (tc.function?.name) {
              toolCall = {
                id: tc.id,
                name: tc.function.name,
                arguments: ""
              };
            }
            if (tc.function?.arguments) {
              toolCall.arguments += tc.function.arguments;
            }
          }

          // Process completed tool calls
          if (toolCall && chunk.choices[0]?.finish_reason) {
            try {
              const parsedArgs = JSON.parse(toolCall.arguments);
              
              // Send template event
              await writer.write(encoder.encode(`data: ${JSON.stringify({
                type: "tpl",
                template_name: toolCall.name,
                template_props: parsedArgs
              })}\n\n`));
              
              toolCall = null;
            } catch (error) {
              console.error("Failed to parse tool arguments:", error);
            }
          }
        }

        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: "done"
        })}\n\n`));

      } catch (error) {
        console.error("Streaming error:", error);
        await writer.write(encoder.encode(`data: ${JSON.stringify({
          type: "error",
          message: error instanceof Error ? error.message : "Unknown error"
        })}\n\n`));
      } finally {
        await writer.close();
      }
    })();

    return new NextResponse(readable, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "Access-Control-Allow-Origin": "*",
        "X-Content-Type-Options": "nosniff",
      },
    });

  } catch (error) {
    console.error("Crayon Agent API error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    },
  });
}