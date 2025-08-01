import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// Enhanced CopilotRuntime with AG UI Protocol Integration
class AGUICopilotRuntime extends CopilotRuntime {
  constructor() {
    super();
  }

  // Override message processing to emit AG UI events
  async processMessage(message: any, stream: any) {
    try {
      const messageId = this.generateMessageId();
      
      // Emit TEXT_MESSAGE_START event
      const startEventData = {
        messageId,
        timestamp: new Date().toISOString(),
        metadata: { source: "copilotkit", type: "agent_response" }
      };
      this.emitAGUIEvent(stream, 'TEXT_MESSAGE_START', startEventData);

      // Process the message with original CopilotKit logic
      const response = await super.processMessage?.(message, stream);

      // Emit content events during streaming
      if (response && typeof response === 'string') {
        const contentEventData = {
          messageId,
          content: response,
          timestamp: new Date().toISOString()
        };
        this.emitAGUIEvent(stream, 'TEXT_MESSAGE_CONTENT', contentEventData);
      }

      // Emit TEXT_MESSAGE_END event
      const endEventData = {
        messageId,
        timestamp: new Date().toISOString(),
        finalContent: response || "",
        metadata: { processingTime: Date.now() - new Date(startEventData.timestamp).getTime() }
      };
      this.emitAGUIEvent(stream, 'TEXT_MESSAGE_END', endEventData);

      return response;
    } catch (error) {
      console.error("AG UI Protocol Error:", error);
      // Fallback to standard CopilotKit behavior
      return super.processMessage?.(message, stream);
    }
  }

  // Emit AG UI protocol events
  private emitAGUIEvent(stream: any, eventType: string, eventData: any) {
    try {
      // Create AG UI compatible event structure
      const agUIEvent = {
        type: eventType,
        data: eventData,
        timestamp: new Date().toISOString(),
        id: `event_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`
      };

      // Emit as server-sent event for AG UI protocol
      if (stream && typeof stream.write === 'function') {
        stream.write(`data: ${JSON.stringify({
          type: 'ag-ui-protocol',
          event: agUIEvent
        })}\n\n`);
      }

      // Also log for debugging
      console.log(`🎯 AG UI Event Emitted: ${eventType}`, agUIEvent);
    } catch (error) {
      console.error("Failed to emit AG UI event:", error);
    }
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Override tool execution to emit tool events
  async executeTools(tools: any[], stream: any) {
    for (const tool of tools) {
      try {
        // Emit TOOL_CALL_START event
        const toolStartEvent = {
          toolId: tool.name || 'unknown',
          toolName: tool.name || 'generateVisualization',
          timestamp: new Date().toISOString(),
          parameters: tool.parameters || {}
        };
        this.emitAGUIEvent(stream, 'TOOL_CALL_START', toolStartEvent);

        // Execute the tool
        const result = await super.executeTools?.([tool], stream);

        // Emit TOOL_CALL_END event
        const toolEndEvent = {
          toolId: tool.name || 'unknown',
          timestamp: new Date().toISOString(),
          result: result,
          success: true
        };
        this.emitAGUIEvent(stream, 'TOOL_CALL_END', toolEndEvent);

        // Emit state update for UI changes
        if (tool.name === 'generateVisualization' || tool.name === 'generateDashboard') {
          const stateEvent = {
            type: 'ui_update',
            component: tool.name,
            data: tool.parameters,
            timestamp: new Date().toISOString()
          };
          this.emitAGUIEvent(stream, 'STATE_DELTA', stateEvent);
        }

      } catch (error) {
        console.error("Tool execution error:", error);
        
        // Emit error event
        const errorEvent = {
          toolId: tool.name || 'unknown',
          timestamp: new Date().toISOString(),
          error: error.message,
          success: false
        };
        this.emitAGUIEvent(stream, 'TOOL_CALL_END', errorEvent);
      }
    }
  }
}

// Enhanced OpenAI Adapter with AG UI streaming
class AGUIOpenAIAdapter extends OpenAIAdapter {
  constructor(options: any) {
    super(options);
  }

  // Override streaming to include AG UI events
  async *streamChatCompletion(messages: any[], stream: any) {
    try {
      const originalStream = super.streamChatCompletion(messages, stream);
      
      for await (const chunk of originalStream) {
        // Emit AG UI content events for each chunk
        if (chunk && chunk.choices && chunk.choices[0]?.delta?.content) {
          const contentEvent = {
            content: chunk.choices[0].delta.content,
            timestamp: new Date().toISOString(),
            streaming: true
          };
          
          if (stream && typeof stream.write === 'function') {
            stream.write(`data: ${JSON.stringify({
              type: 'ag-ui-stream',
              data: contentEvent
            })}\n\n`);
          }
        }
        
        yield chunk;
      }
    } catch (error) {
      console.error("AG UI Streaming Error:", error);
      // Fallback to original behavior
      yield* super.streamChatCompletion(messages, stream);
    }
  }
}

// Initialize enhanced runtime with AG UI protocol
const copilotKit = new AGUICopilotRuntime();

// Enhanced handler with AG UI protocol support
const handler = copilotRuntimeNextJSAppRouterEndpoint({
  runtime: copilotKit,
  serviceAdapter: new AGUIOpenAIAdapter({ model: "gpt-4" }),
  endpoint: "/api/copilotkit",
});

export const POST = async (req: NextRequest) => {
  try {
    // Set headers for AG UI protocol streaming
    const response = await handler.POST(req);
    
    // Ensure proper headers for event streaming
    response.headers.set('Cache-Control', 'no-cache');
    response.headers.set('Connection', 'keep-alive');
    response.headers.set('Access-Control-Allow-Origin', '*');
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type');
    response.headers.set('X-AG-UI-Protocol', 'v1.0');
    
    return response;
  } catch (error) {
    console.error("AG UI Enhanced API Error:", error);
    // Fallback to original handler
    return handler.POST(req);
  }
};