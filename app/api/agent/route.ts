import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

// Initialize OpenAI
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// AG UI Event Types (matching the protocol)
enum EventType {
  RUN_STARTED = "RUN_STARTED",
  RUN_FINISHED = "RUN_FINISHED",
  RUN_ERROR = "RUN_ERROR",
  TEXT_MESSAGE_START = "TEXT_MESSAGE_START",
  TEXT_MESSAGE_CONTENT = "TEXT_MESSAGE_CONTENT",
  TEXT_MESSAGE_END = "TEXT_MESSAGE_END",
  TOOL_CALL_START = "TOOL_CALL_START",
  TOOL_CALL_ARGS = "TOOL_CALL_ARGS",
  TOOL_CALL_END = "TOOL_CALL_END",
  STATE_DELTA = "STATE_DELTA",
}

// Helper to format SSE messages in AG UI format
function formatSSE(event: any): string {
  // Convert snake_case to camelCase for JavaScript compatibility
  const convertKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(convertKeys);
    } else if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).reduce((acc, key) => {
        const camelKey = key.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
        acc[camelKey] = convertKeys(obj[key]);
        return acc;
      }, {} as any);
    }
    return obj;
  };

  const convertedEvent = convertKeys(event);
  return `data: ${JSON.stringify(convertedEvent)}\n\n`;
}

// Generate unique IDs
function generateId(prefix: string): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
}

// Get description for generated component
function getComponentDescription(componentType: string, props: any): string {
  switch (componentType) {
    case "generateVisualization":
      return `I've created a ${props.type} chart titled "${props.title}" to visualize your data.`;
    case "generateDashboard":
      return `I've generated a dashboard titled "${props.title}" with ${props.components?.length || 0} components.`;
    case "generateForm":
      return `I've created a form titled "${props.title}" with ${props.fields?.length || 0} fields.`;
    case "generateTable":
      return `I've generated a table titled "${props.title}" with ${props.data?.length || 0} rows of data.`;
    default:
      return `I've created a new UI component for you.`;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messages, threadId = generateId("thread"), runId = generateId("run") } = body;

    // Create a TransformStream for SSE
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();
    const encoder = new TextEncoder();

    // Process messages in background
    (async () => {
      try {
        // Send RUN_STARTED event
        await writer.write(encoder.encode(formatSSE({
          type: EventType.RUN_STARTED,
          thread_id: threadId,
          run_id: runId,
        })));

        const messageId = generateId("msg");
        
        // Send TEXT_MESSAGE_START event
        await writer.write(encoder.encode(formatSSE({
          type: EventType.TEXT_MESSAGE_START,
          message_id: messageId,
          role: "assistant"
        })));

        // Call OpenAI with tool definitions for UI generation
        const completion = await openai.chat.completions.create({
          model: "gpt-4",
          messages: [
            {
              role: "system",
              content: `You are an AG UI agent that dynamically generates UI components based on conversation. 
                       You can create various visualizations, dashboards, and interactive components.
                       Always think about what UI would best serve the user's request.
                       Use the available tools to generate appropriate UI components.`
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
                      enum: ["line", "bar", "pie", "scatter", "area", "radar", "heatmap", "gauge", "treemap", "sankey"],
                      description: "Type of visualization" 
                    },
                    title: { type: "string", description: "Title of the visualization" },
                    data: { 
                      type: "array", 
                      description: "Data points for the visualization",
                      items: {
                        type: "object",
                        properties: {
                          label: { type: "string", description: "Label for the data point" },
                          value: { type: "number", description: "Numeric value" }
                        },
                        required: ["label", "value"]
                      }
                    },
                    config: { 
                      type: "object", 
                      description: "Additional configuration options",
                      properties: {},
                      additionalProperties: true
                    }
                  },
                  required: ["type", "title", "data"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateDashboard",
                description: "Generate a multi-component dashboard",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Dashboard title" },
                    layout: { type: "string", enum: ["grid", "list", "masonry"], description: "Layout type" },
                    components: { 
                      type: "array", 
                      description: "Array of components to display",
                      items: {
                        type: "object",
                        properties: {},
                        additionalProperties: true
                      }
                    }
                  },
                  required: ["title", "components"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateForm",
                description: "Generate an interactive form",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Form title" },
                    fields: { 
                      type: "array", 
                      description: "Form fields configuration",
                      items: {
                        type: "object",
                        properties: {
                          name: { type: "string", description: "Field name" },
                          label: { type: "string", description: "Field label" },
                          type: { type: "string", description: "Input type" },
                          placeholder: { type: "string", description: "Placeholder text" },
                          options: { type: "array", items: { type: "string" }, description: "Options for select fields" }
                        },
                        required: ["name", "label"]
                      }
                    },
                    submitAction: { type: "string", description: "Action to perform on submit" }
                  },
                  required: ["title", "fields"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateTable",
                description: "Generate a data table",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Table title" },
                    columns: { 
                      type: "array", 
                      description: "Column definitions",
                      items: {
                        type: "object",
                        properties: {
                          field: { type: "string", description: "Field key in data" },
                          label: { type: "string", description: "Column header label" }
                        },
                        required: ["field", "label"]
                      }
                    },
                    data: { 
                      type: "array", 
                      description: "Row data",
                      items: {
                        type: "object",
                        properties: {},
                        additionalProperties: true
                      }
                    },
                    features: { 
                      type: "object", 
                      description: "Table features (sorting, filtering, etc)",
                      properties: {
                        sorting: { type: "boolean" },
                        filtering: { type: "boolean" },
                        pagination: { type: "boolean" }
                      },
                      additionalProperties: false
                    }
                  },
                  required: ["title", "columns", "data"]
                }
              }
            }
          ],
          stream: true,
        });

        let toolCall: any = null;
        let textContent = "";

        // Process the stream
        for await (const chunk of completion) {
          const delta = chunk.choices[0]?.delta;

          // Handle text content
          if (delta?.content) {
            textContent += delta.content;
            await writer.write(encoder.encode(formatSSE({
              type: EventType.TEXT_MESSAGE_CONTENT,
              message_id: messageId,
              delta: delta.content
            })));
          }

          // Handle tool calls (new format)
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

          // Process tool calls as we receive them
          if (toolCall && chunk.choices[0]?.finish_reason) {
            const toolId = generateId("tool");
            
            // Send TOOL_CALL_START
            await writer.write(encoder.encode(formatSSE({
              type: EventType.TOOL_CALL_START,
              tool_call_id: toolId,
              tool_call_name: toolCall.name,
              parent_message_id: messageId
            })));

            // Parse and validate tool arguments
            try {
              const parsedArgs = JSON.parse(toolCall.arguments);
              
              // Send TOOL_CALL_ARGS
              await writer.write(encoder.encode(formatSSE({
                type: EventType.TOOL_CALL_ARGS,
                tool_call_id: toolId,
                delta: toolCall.arguments
              })));

              // Send STATE_DELTA with the UI component data
              await writer.write(encoder.encode(formatSSE({
                type: EventType.STATE_DELTA,
                delta: [{
                  op: "add",
                  path: "/components/-",
                  value: {
                    component: {
                      id: generateId("comp"),
                      type: toolCall.name,
                      props: parsedArgs,
                      timestamp: new Date().toISOString()
                    }
                  }
                }]
              })));
              
              // Add assistant message about what was created
              const componentDescription = getComponentDescription(toolCall.name, parsedArgs);
              textContent = componentDescription;
              await writer.write(encoder.encode(formatSSE({
                type: EventType.TEXT_MESSAGE_CONTENT,
                message_id: messageId,
                delta: componentDescription
              })));

            } catch (error) {
              console.error("Failed to parse tool arguments:", error);
            }

            // Send TOOL_CALL_END
            await writer.write(encoder.encode(formatSSE({
              type: EventType.TOOL_CALL_END,
              tool_call_id: toolId
            })));
            
            // Reset tool call for next one
            toolCall = null;
          }
        }

        // Send TEXT_MESSAGE_END
        await writer.write(encoder.encode(formatSSE({
          type: EventType.TEXT_MESSAGE_END,
          message_id: messageId
        })));

        // Send RUN_FINISHED
        await writer.write(encoder.encode(formatSSE({
          type: EventType.RUN_FINISHED,
          thread_id: threadId,
          run_id: runId
        })));

      } catch (error: any) {
        console.error("Agent processing error:", error);
        
        // Send RUN_ERROR event
        await writer.write(encoder.encode(formatSSE({
          type: EventType.RUN_ERROR,
          message: error.message || "An error occurred",
          code: error.code
        })));
      } finally {
        await writer.close();
      }
    })();

    // Return SSE response
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
    console.error("Agent API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
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