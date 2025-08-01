"use client";

import { useState, useRef, useEffect } from "react";
import { VisualizationTemplate, KPITemplate, FormTemplate, TableTemplate, DashboardTemplate } from "@/components/response-templates";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, RotateCcw } from "lucide-react";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface UIComponent {
  id: string;
  type: string;
  props: any;
  timestamp: string;
}

// Response templates mapping
const responseTemplates: Record<string, React.ComponentType<any>> = {
  generateVisualization: VisualizationTemplate,
  generateKPI: KPITemplate,
  generateForm: FormTemplate,
  generateTable: TableTemplate,
  generateDashboard: DashboardTemplate,
};

export default function CrayonPage() {
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [messages, setMessages] = useState<Message[]>([]);
  const [components, setComponents] = useState<UIComponent[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, assistantMessage]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setAssistantMessage("");

    try {
      const response = await fetch("/api/crayon-agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage]
        }),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let currentAssistantMessage = "";

      while (reader) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || "";

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const event = JSON.parse(line.slice(6));
              console.log("Received event:", event);

              switch (event.type) {
                case "text":
                  currentAssistantMessage += event.content || "";
                  setAssistantMessage(currentAssistantMessage);
                  break;

                case "tpl":
                  // Create component from template
                  const component: UIComponent = {
                    id: `comp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
                    type: event.template_name,
                    props: event.template_props,
                    timestamp: new Date().toISOString()
                  };
                  console.log("Adding component:", component);
                  setComponents(prev => [...prev, component]);
                  
                  // Add description to assistant message
                  const description = getComponentDescription(event.template_name, event.template_props);
                  currentAssistantMessage = description;
                  setAssistantMessage(currentAssistantMessage);
                  break;

                case "done":
                  if (currentAssistantMessage) {
                    setMessages(prev => [...prev, { role: "assistant", content: currentAssistantMessage }]);
                  }
                  setIsLoading(false);
                  break;

                case "error":
                  console.error("Stream error:", event.message);
                  setIsLoading(false);
                  break;
              }
            } catch (e) {
              console.error("Failed to parse SSE event:", e);
            }
          }
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
      setIsLoading(false);
    }
  };

  const resetConversation = () => {
    setMessages([]);
    setComponents([]);
    setAssistantMessage("");
  };

  const getComponentDescription = (componentType: string, props: any): string => {
    switch (componentType) {
      case "generateVisualization":
        return `I've created a ${props.type} chart titled "${props.title}" to visualize your data.`;
      case "generateKPI":
        return `I've created a KPI card showing "${props.title}" with a value of ${props.value}.`;
      case "generateForm":
        return `I've created a form titled "${props.title}" with ${props.fields?.length || 0} fields.`;
      case "generateTable":
        return `I've generated a table titled "${props.title}" with ${props.data?.length || 0} rows of data.`;
      case "generateDashboard":
        return `I've generated a dashboard titled "${props.title}" with ${props.components?.length || 0} components.`;
      default:
        return `I've created a new UI component for you.`;
    }
  };

  const renderComponent = (component: UIComponent) => {
    const Component = responseTemplates[component.type];
    if (!Component) {
      return (
        <div className="p-4 border border-red-200 rounded-lg">
          <p className="text-red-600">Unknown component type: {component.type}</p>
        </div>
      );
    }
    return <Component {...component.props} />;
  };

  return (
    <div className={`h-screen ${isDarkMode ? 'dark' : ''}`}>
      <div className="bg-background text-foreground h-full flex">
        {/* Main Content Area - Left Side */}
        <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
          {/* Header */}
          <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 p-4">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                Crayon AG UI Interface 
              </h1>
              <button
                onClick={() => setIsDarkMode(!isDarkMode)}
                className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
                aria-label="Toggle theme"
              >
                {isDarkMode ? "🌞" : "🌙"}
              </button>
            </div>
          </header>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6">
            {components.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="mb-8">
                  <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center animate-glow">
                    <span className="text-4xl">🎨</span>
                  </div>
                </div>
                <h2 className="text-2xl font-semibold mb-4 dark:text-white">Welcome to Crayon AG UI</h2>
                <p className="text-gray-600 dark:text-gray-400 max-w-md">
                  Start a conversation in the chat panel and watch as components are generated dynamically 
                  based on our discussion. Try asking for charts, dashboards, forms, or tables!
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {components.map((component, index) => (
                  <div key={component.id} className="animate-component-materialize" style={{ animationDelay: `${index * 0.2}s` }}>
                    {renderComponent(component)}
                  </div>
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Chat Sidebar - Right Side */}
        <div className="w-96 bg-white dark:bg-gray-900 border-l dark:border-gray-800 flex flex-col">
          <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between">
            <h2 className="text-lg font-semibold dark:text-white">Chat</h2>
            <Button 
              variant="ghost"
              size="sm"
              onClick={resetConversation}
              className="hover-lift transition-all duration-300"
            >
              <RotateCcw className="w-4 h-4 mr-2" />
              Reset
            </Button>
          </div>
          
          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
                <p>Start a conversation to generate UI components</p>
              </div>
            ) : (
              messages.map((msg, i) => (
                <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-slide-in`}>
                  <div className={`max-w-[80%] rounded-lg p-3 transition-all duration-300 ${
                    msg.role === 'user' 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 border dark:border-gray-700'
                  }`}>
                    <p className="text-sm">{msg.content}</p>
                  </div>
                </div>
              ))
            )}
            {isLoading && assistantMessage && (
              <div className="flex justify-start animate-message-slide-in">
                <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-3 max-w-[80%] border dark:border-gray-700">
                  <p className="text-sm">{assistantMessage}</p>
                </div>
              </div>
            )}
            {isLoading && !assistantMessage && (
              <div className="flex justify-start animate-message-slide-in">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border dark:border-gray-700 flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-typing-dot"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-typing-dot"></div>
                    <div className="w-2 h-2 bg-purple-600 rounded-full animate-typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
            <div className="flex gap-2">
              <Input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && sendMessage()}
                placeholder="Ask me to create UI components..."
                disabled={isLoading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={isLoading || !input.trim()}
                size="icon"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}