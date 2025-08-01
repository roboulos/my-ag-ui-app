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
    case "generateKPI":
      return `I've created a KPI card showing "${props.title}" with a value of ${props.value}.`;
    case "generateDataTable":
      return `I've created an advanced data table titled "${props.title}" with sorting, filtering, and pagination features.`;
    case "generateTimeline":
      return `I've created a timeline component titled "${props.title}" showing ${props.events?.length || 0} events.`;
    case "generateDocumentViewer":
      return `I've created a document viewer for "${props.title}" with navigation and annotation features.`;
    case "generateRichTextEditor":
      return `I've created a rich text editor titled "${props.title}" with formatting tools.`;
    case "generateCalendar":
      return `I've created a calendar component titled "${props.title}" with event management capabilities.`;
    case "generateFileUpload":
      return `I've created a file upload interface titled "${props.title}" with drag-and-drop support.`;
    case "generateSettingsPanel":
      return `I've created a settings panel titled "${props.title}" with ${props.sections?.length || 0} configuration sections.`;
    case "generateAnalyticsDashboard":
      return `I've created an analytics dashboard titled "${props.title}" with comprehensive data visualization.`;
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
                       You can create various visualizations, dashboards, KPI cards, and interactive components.
                       Always think about what UI would best serve the user's request.
                       Use the available tools to generate appropriate UI components.
                       When showing metrics or key numbers, consider using KPI cards for a professional look.`
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
            },
            {
              type: "function",
              function: {
                name: "generateKPI",
                description: "Generate a KPI (Key Performance Indicator) card",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "KPI title/label" },
                    value: { type: "string", description: "Main KPI value (e.g., '$10,500', '1,234', '85%')" },
                    change: { type: "string", description: "Change percentage or value (e.g., '+12.5%', '-$500')" },
                    icon: { 
                      type: "string", 
                      enum: ["revenue", "users", "sales", "products", "activity"],
                      description: "Icon type to display" 
                    },
                    trend: { 
                      type: "string", 
                      enum: ["up", "down"],
                      description: "Trend direction" 
                    }
                  },
                  required: ["title", "value", "change", "trend"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateDataTable",
                description: "Generate an advanced data table with sorting, filtering, and pagination",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Table title" },
                    columns: { 
                      type: "array", 
                      description: "Column definitions with advanced features",
                      items: {
                        type: "object",
                        properties: {
                          field: { type: "string", description: "Field key in data" },
                          label: { type: "string", description: "Column header label" },
                          type: { type: "string", enum: ["text", "number", "date", "currency", "badge"], description: "Column data type" },
                          sortable: { type: "boolean", description: "Whether column is sortable" },
                          filterable: { type: "boolean", description: "Whether column is filterable" }
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
                      description: "Advanced table features",
                      properties: {
                        sorting: { type: "boolean", description: "Enable sorting" },
                        filtering: { type: "boolean", description: "Enable filtering" },
                        pagination: { type: "boolean", description: "Enable pagination" },
                        search: { type: "boolean", description: "Enable global search" },
                        export: { type: "boolean", description: "Enable data export" },
                        selection: { type: "boolean", description: "Enable row selection" }
                      },
                      additionalProperties: false
                    },
                    pageSize: { type: "number", description: "Default page size for pagination" }
                  },
                  required: ["title", "columns", "data"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateTimeline",
                description: "Generate a timeline component for project tracking and workflows",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Timeline title" },
                    type: { type: "string", enum: ["vertical", "horizontal"], description: "Timeline orientation" },
                    events: { 
                      type: "array", 
                      description: "Timeline events",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Event ID" },
                          title: { type: "string", description: "Event title" },
                          description: { type: "string", description: "Event description" },
                          date: { type: "string", description: "Event date/time" },
                          status: { type: "string", enum: ["completed", "in-progress", "pending", "cancelled"], description: "Event status" },
                          icon: { type: "string", description: "Icon name for the event" },
                          color: { type: "string", description: "Color theme for the event" }
                        },
                        required: ["id", "title", "date", "status"]
                      }
                    },
                    showProgress: { type: "boolean", description: "Show overall progress indicator" }
                  },
                  required: ["title", "events"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateDocumentViewer",
                description: "Generate an interactive document viewer with navigation and annotations",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Document viewer title" },
                    documentType: { type: "string", enum: ["pdf", "markdown", "text", "code"], description: "Type of document" },
                    content: { type: "string", description: "Document content or URL" },
                    features: { 
                      type: "object", 
                      description: "Viewer features",
                      properties: {
                        search: { type: "boolean", description: "Enable text search" },
                        annotations: { type: "boolean", description: "Enable annotations" },
                        navigation: { type: "boolean", description: "Enable page/section navigation" },
                        download: { type: "boolean", description: "Enable download" },
                        fullscreen: { type: "boolean", description: "Enable fullscreen mode" }
                      },
                      additionalProperties: false
                    },
                    pages: { 
                      type: "array", 
                      description: "Document pages/sections",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Page ID" },
                          title: { type: "string", description: "Page title" },
                          content: { type: "string", description: "Page content" }
                        },
                        required: ["id", "title"]
                      }
                    }
                  },
                  required: ["title", "documentType"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateRichTextEditor",
                description: "Generate a rich text editor with formatting tools",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Editor title" },
                    initialContent: { type: "string", description: "Initial editor content" },
                    features: { 
                      type: "object", 
                      description: "Editor features and toolbar options",
                      properties: {
                        bold: { type: "boolean", description: "Bold formatting" },
                        italic: { type: "boolean", description: "Italic formatting" },
                        underline: { type: "boolean", description: "Underline formatting" },
                        lists: { type: "boolean", description: "Ordered and unordered lists" },
                        links: { type: "boolean", description: "Link insertion" },
                        images: { type: "boolean", description: "Image insertion" },
                        tables: { type: "boolean", description: "Table insertion" },
                        codeBlocks: { type: "boolean", description: "Code block formatting" },
                        headings: { type: "boolean", description: "Heading levels" }
                      },
                      additionalProperties: false
                    },
                    placeholder: { type: "string", description: "Placeholder text" },
                    maxLength: { type: "number", description: "Maximum character count" }
                  },
                  required: ["title"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateCalendar",
                description: "Generate a calendar component with event management",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Calendar title" },
                    view: { type: "string", enum: ["month", "week", "day", "agenda"], description: "Default calendar view" },
                    events: { 
                      type: "array", 
                      description: "Calendar events",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Event ID" },
                          title: { type: "string", description: "Event title" },
                          description: { type: "string", description: "Event description" },
                          start: { type: "string", description: "Start date/time" },
                          end: { type: "string", description: "End date/time" },
                          allDay: { type: "boolean", description: "All-day event" },
                          color: { type: "string", description: "Event color" },
                          category: { type: "string", description: "Event category" }
                        },
                        required: ["id", "title", "start"]
                      }
                    },
                    features: { 
                      type: "object", 
                      description: "Calendar features",
                      properties: {
                        addEvents: { type: "boolean", description: "Allow adding new events" },
                        editEvents: { type: "boolean", description: "Allow editing events" },
                        deleteEvents: { type: "boolean", description: "Allow deleting events" },
                        dragDrop: { type: "boolean", description: "Drag and drop events" },
                        timeSlots: { type: "boolean", description: "Show time slot details" }
                      },
                      additionalProperties: false
                    }
                  },
                  required: ["title"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateFileUpload",
                description: "Generate a file upload interface with drag-and-drop support",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Upload interface title" },
                    acceptedTypes: { 
                      type: "array", 
                      description: "Accepted file types",
                      items: { type: "string" }
                    },
                    maxFileSize: { type: "number", description: "Maximum file size in MB" },
                    maxFiles: { type: "number", description: "Maximum number of files" },
                    features: { 
                      type: "object", 
                      description: "Upload features",
                      properties: {
                        dragDrop: { type: "boolean", description: "Drag and drop support" },
                        preview: { type: "boolean", description: "File preview" },
                        progress: { type: "boolean", description: "Upload progress indicators" },
                        validation: { type: "boolean", description: "File validation" },
                        thumbnails: { type: "boolean", description: "Image thumbnails" }
                      },
                      additionalProperties: false
                    },
                    uploadUrl: { type: "string", description: "Upload endpoint URL" },
                    placeholder: { type: "string", description: "Placeholder text for the upload area" }
                  },
                  required: ["title"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateSettingsPanel",
                description: "Generate a settings panel with various configuration options",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Settings panel title" },
                    sections: { 
                      type: "array", 
                      description: "Settings sections",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Section ID" },
                          title: { type: "string", description: "Section title" },
                          description: { type: "string", description: "Section description" },
                          settings: {
                            type: "array",
                            description: "Settings in this section",
                            items: {
                              type: "object",
                              properties: {
                                id: { type: "string", description: "Setting ID" },
                                label: { type: "string", description: "Setting label" },
                                description: { type: "string", description: "Setting description" },
                                type: { type: "string", enum: ["toggle", "select", "input", "slider", "color", "file"], description: "Input type" },
                                value: { description: "Current value" },
                                options: { type: "array", items: { type: "string" }, description: "Options for select type" },
                                min: { type: "number", description: "Minimum value for slider" },
                                max: { type: "number", description: "Maximum value for slider" }
                              },
                              required: ["id", "label", "type"]
                            }
                          }
                        },
                        required: ["id", "title", "settings"]
                      }
                    },
                    layout: { type: "string", enum: ["tabs", "accordion", "sidebar"], description: "Panel layout style" }
                  },
                  required: ["title", "sections"]
                }
              }
            },
            {
              type: "function",
              function: {
                name: "generateAnalyticsDashboard",
                description: "Generate a comprehensive analytics dashboard with multiple visualizations",
                parameters: {
                  type: "object",
                  properties: {
                    title: { type: "string", description: "Dashboard title" },
                    timeRange: { type: "string", enum: ["today", "week", "month", "quarter", "year", "custom"], description: "Default time range" },
                    metrics: { 
                      type: "array", 
                      description: "Key metrics to display",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Metric ID" },
                          title: { type: "string", description: "Metric title" },
                          value: { type: "string", description: "Current value" },
                          change: { type: "string", description: "Change percentage" },
                          trend: { type: "string", enum: ["up", "down", "neutral"], description: "Trend direction" },
                          icon: { type: "string", description: "Metric icon" }
                        },
                        required: ["id", "title", "value"]
                      }
                    },
                    charts: { 
                      type: "array", 
                      description: "Chart components",
                      items: {
                        type: "object",
                        properties: {
                          id: { type: "string", description: "Chart ID" },
                          title: { type: "string", description: "Chart title" },
                          type: { type: "string", enum: ["line", "bar", "pie", "area", "scatter", "heatmap"], description: "Chart type" },
                          data: { 
                            type: "array", 
                            description: "Chart data",
                            items: {
                              type: "object",
                              properties: {},
                              additionalProperties: true
                            }
                          },
                          size: { type: "string", enum: ["small", "medium", "large", "full"], description: "Chart size" }
                        },
                        required: ["id", "title", "type", "data"]
                      }
                    },
                    features: { 
                      type: "object", 
                      description: "Dashboard features",
                      properties: {
                        realTime: { type: "boolean", description: "Real-time data updates" },
                        export: { type: "boolean", description: "Export capabilities" },
                        filters: { type: "boolean", description: "Data filtering" },
                        customization: { type: "boolean", description: "Layout customization" },
                        alerts: { type: "boolean", description: "Alert notifications" }
                      },
                      additionalProperties: false
                    }
                  },
                  required: ["title", "metrics", "charts"]
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