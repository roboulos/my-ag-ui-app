"use client";

import { useState, useEffect, useRef } from "react";
import { 
  LineChart, BarChart, PieChart, Activity, TrendingUp, 
  DollarSign, Users, Package, ShoppingCart, Calendar,
  ChevronRight, MoreVertical, Download, Share2, Filter,
  Search, Bell, Settings, Menu, X, Loader2, Send,
  Moon, Sun, RotateCcw
} from "lucide-react";

// Dynamic component types
type ComponentType = "generateVisualization" | "generateDashboard" | "generateForm" | "generateTable" | "generateKPI";

interface UIComponent {
  id: string;
  type: ComponentType;
  props: any;
  timestamp: string;
}

// Chart color palette
const CHART_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
];

// Dynamic Visualization Component
function DynamicVisualization({ type, title, data, config }: any) {
  const getIcon = () => {
    switch (type) {
      case "line": return <LineChart className="w-5 h-5" />;
      case "bar": return <BarChart className="w-5 h-5" />;
      case "pie": return <PieChart className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const renderChart = () => {
    switch (type) {
      case "line":
        return (
          <div className="h-64 flex items-end justify-between gap-2 px-4">
            {data.map((point: any, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t animate-grow-up"
                  style={{ 
                    height: `${(point.value / Math.max(...data.map((d: any) => d.value))) * 100}%`,
                    animationDelay: `${i * 0.1}s`
                  }}
                />
                <span className="text-xs text-gray-500 dark:text-gray-400">{point.label}</span>
              </div>
            ))}
          </div>
        );
      
      case "bar":
        return (
          <div className="h-64 flex flex-col justify-between gap-2 p-4">
            {data.slice(0, 5).map((item: any, i: number) => (
              <div key={i} className="flex items-center gap-3">
                <span className="text-sm w-24 text-gray-600 dark:text-gray-400">{item.label}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-end px-3 animate-expand transition-all duration-500"
                    style={{ 
                      "--target-width": `${(item.value / Math.max(...data.map((d: any) => d.value))) * 100}%`,
                      animationDelay: `${i * 0.1}s`
                    } as any}
                  >
                    <span className="text-xs text-white font-medium">{item.value.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        );

      case "pie":
        const total = data.reduce((sum: number, item: any) => sum + item.value, 0);
        let currentAngle = 0;
        
        return (
          <div className="h-64 flex items-center justify-center">
            <div className="relative">
              <svg width="200" height="200" className="transform -rotate-90">
                {data.map((item: any, i: number) => {
                  const percentage = item.value / total;
                  const angle = percentage * 360;
                  const largeArcFlag = angle > 180 ? 1 : 0;
                  const endAngle = currentAngle + angle;
                  
                  const startX = 100 + 80 * Math.cos((currentAngle * Math.PI) / 180);
                  const startY = 100 + 80 * Math.sin((currentAngle * Math.PI) / 180);
                  const endX = 100 + 80 * Math.cos((endAngle * Math.PI) / 180);
                  const endY = 100 + 80 * Math.sin((endAngle * Math.PI) / 180);
                  
                  const path = `M 100 100 L ${startX} ${startY} A 80 80 0 ${largeArcFlag} 1 ${endX} ${endY} Z`;
                  
                  currentAngle = endAngle;
                  
                  return (
                    <path
                      key={i}
                      d={path}
                      fill={CHART_COLORS[i % CHART_COLORS.length]}
                      className="animate-scale-in hover:opacity-80 transition-opacity cursor-pointer"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    />
                  );
                })}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center transform rotate-0">
                <span className="text-2xl font-bold dark:text-white">{total.toLocaleString()}</span>
                <span className="text-sm text-gray-500 dark:text-gray-400">Total</span>
              </div>
            </div>
            <div className="ml-8 space-y-2">
              {data.map((item: any, i: number) => (
                <div key={i} className="flex items-center gap-2 animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-sm dark:text-gray-300">{item.label}: {item.value.toLocaleString()}</span>
                </div>
              ))}
            </div>
          </div>
        );

      default:
        return (
          <div className="h-64 flex items-center justify-center">
            <div className="text-gray-400 dark:text-gray-500">
              <Activity className="w-16 h-16 mx-auto mb-2" />
              <p>Visualization: {type}</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 animate-slide-up border border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            {getIcon()}
          </div>
          <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        </div>
        <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-150">
          <MoreVertical className="w-4 h-4 text-gray-500 dark:text-gray-400" />
        </button>
      </div>
      {renderChart()}
    </div>
  );
}

// Dynamic Table Component
function DynamicTable({ title, columns, data, features }: any) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 animate-slide-up border border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold dark:text-white">{title}</h3>
        <div className="flex gap-2">
          {features?.filtering && (
            <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-150">
              <Filter className="w-4 h-4 text-gray-500 dark:text-gray-400" />
            </button>
          )}
          <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-all duration-150">
            <Download className="w-4 h-4 text-gray-500 dark:text-gray-400" />
          </button>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b dark:border-gray-700">
              {columns.map((col: any, i: number) => (
                <th key={i} className="text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300">
                  {col.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.map((row: any, i: number) => (
              <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                {columns.map((col: any, j: number) => (
                  <td key={j} className="py-3 px-4 text-gray-900 dark:text-gray-100">
                    {row[col.field]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Dynamic Form Component
function DynamicForm({ title, fields, submitAction }: any) {
  const [formData, setFormData] = useState<any>({});

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 animate-slide-up border border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <h3 className="text-lg font-semibold mb-6 dark:text-white">{title}</h3>
      <form className="space-y-4">
        {fields.map((field: any, i: number) => (
          <div key={i} className="animate-fade-in" style={{ animationDelay: `${i * 0.1}s` }}>
            <label className="block text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">{field.label}</label>
            {field.type === "select" ? (
              <select 
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white transition-all duration-150"
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              >
                <option value="">Select {field.label}</option>
                {field.options?.map((opt: string) => (
                  <option key={opt} value={opt}>{opt}</option>
                ))}
              </select>
            ) : (
              <input
                type={field.type || "text"}
                placeholder={field.placeholder}
                className="w-full p-3 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent dark:text-white placeholder-gray-400 dark:placeholder-gray-500 transition-all duration-150"
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              />
            )}
          </div>
        ))}
        <button
          type="submit"
          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-all duration-150 font-medium transform hover:scale-[1.02]"
          onClick={(e) => {
            e.preventDefault();
            console.log("Form submitted:", formData);
          }}
        >
          {submitAction || "Submit"}
        </button>
      </form>
    </div>
  );
}

// KPI Card Component
function KPICard({ title, value, change, icon, trend }: any) {
  const isPositive = trend === "up";
  const changeColor = isPositive ? "text-green-600 dark:text-green-400" : "text-red-600 dark:text-red-400";
  const trendIcon = isPositive ? <TrendingUp className="w-4 h-4" /> : <TrendingUp className="w-4 h-4 rotate-180" />;
  
  const getIcon = () => {
    switch (icon) {
      case "revenue": return <DollarSign className="w-6 h-6" />;
      case "users": return <Users className="w-6 h-6" />;
      case "sales": return <ShoppingCart className="w-6 h-6" />;
      case "products": return <Package className="w-6 h-6" />;
      default: return <Activity className="w-6 h-6" />;
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl dark:shadow-2xl p-6 animate-slide-up border border-gray-200 dark:border-gray-700 hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] transform">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">{title}</p>
          <p className="text-3xl font-bold text-gray-900 dark:text-white animate-count-up">{value}</p>
          <div className={`flex items-center gap-1 mt-2 ${changeColor}`}>
            {trendIcon}
            <span className="text-sm font-medium">{change}</span>
          </div>
        </div>
        <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
          {getIcon()}
        </div>
      </div>
    </div>
  );
}

// Dynamic Dashboard Component
function DynamicDashboard({ title, layout, components }: any) {
  const gridClass = layout === "masonry" ? "columns-1 md:columns-2 lg:columns-3 gap-6" : "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6";
  
  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold animate-fade-in dark:text-white">{title}</h2>
      <div className={gridClass}>
        {components.map((comp: any, i: number) => (
          <div key={i} className={layout === "masonry" ? "break-inside-avoid mb-6" : ""}>
            <ComponentRenderer component={{ 
              ...comp, 
              id: `${i}`,
              type: comp.type || "generateVisualization",
              props: comp.props || comp,
              timestamp: new Date().toISOString()
            }} />
          </div>
        ))}
      </div>
    </div>
  );
}

// Component Renderer
function ComponentRenderer({ component }: { component: UIComponent }) {
  switch (component.type) {
    case "generateVisualization":
      return <DynamicVisualization {...component.props} />;
    case "generateTable":
      return <DynamicTable {...component.props} />;
    case "generateForm":
      return <DynamicForm {...component.props} />;
    case "generateDashboard":
      return <DynamicDashboard {...component.props} />;
    case "generateKPI":
      return <KPICard {...component.props} />;
    default:
      return null;
  }
}

// Define Message interface
interface Message {
  role: "user" | "assistant";
  content: string;
}

// Main AG UI Application
export default function Home() {
  const [components, setComponents] = useState<UIComponent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isConnected, setIsConnected] = useState(true); // Default to connected
  const [isLoading, setIsLoading] = useState(false);
  const [assistantMessage, setAssistantMessage] = useState("");
  const [isDarkMode, setIsDarkMode] = useState(true); // Default to dark
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, assistantMessage]);

  // Reset conversation function
  const resetConversation = () => {
    setMessages([]);
    setComponents([]);
    setAssistantMessage("");
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMessage: Message = { role: "user", content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);
    setAssistantMessage("");

    try {
      console.log("Sending message:", userMessage);
      
      // Direct fetch implementation for SSE
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          threadId: `thread_${Date.now()}`,
          runId: `run_${Date.now()}`
        })
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

              // Handle different event types
              switch (event.type) {
                case "TEXT_MESSAGE_CONTENT":
                  currentAssistantMessage += event.delta || "";
                  setAssistantMessage(currentAssistantMessage);
                  break;

                case "STATE_DELTA":
                  if (event.delta && Array.isArray(event.delta)) {
                    event.delta.forEach((patch: any) => {
                      if (patch.op === "add" && patch.path === "/components/-" && patch.value?.component) {
                        console.log("Adding component:", patch.value.component);
                        setComponents(prev => [...prev, patch.value.component]);
                      }
                    });
                  }
                  break;

                case "RUN_STARTED":
                  console.log("Run started:", event);
                  setIsConnected(true);
                  break;

                case "RUN_FINISHED":
                  console.log("Run finished:", event);
                  if (currentAssistantMessage) {
                    setMessages(prev => [...prev, { role: "assistant", content: currentAssistantMessage }]);
                  }
                  setIsLoading(false);
                  break;

                case "RUN_ERROR":
                  console.error("Run error:", event);
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
      setIsConnected(false);
    }
  };

  return (
    <div className={`min-h-screen bg-background text-foreground flex ${isDarkMode ? 'dark' : ''}`}>
      {/* Main Content Area - Left Side */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950">
        {/* Header with theme toggle */}
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                  AG UI Dynamic Interface
                </h1>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500" : "bg-red-500"} animate-pulse`} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => setIsDarkMode(!isDarkMode)}
                  className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150">
                  <Settings className="w-5 h-5" />
                </button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with padding */}
        <main className="flex-1 overflow-y-auto p-6">
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full text-center">
              <div className="mb-8">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center animate-pulse">
                  <Activity className="w-12 h-12 text-white" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-4 dark:text-white">Welcome to AG UI</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
                Start a conversation in the chat panel and watch as the interface dynamically generates 
                components based on our discussion. Try asking for charts, dashboards, forms, or tables!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {components.map((component) => (
                <div key={component.id} className="animate-slide-up">
                  <ComponentRenderer component={component} />
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
          <button 
            onClick={resetConversation}
            className="flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-all duration-150"
          >
            <RotateCcw className="w-4 h-4" />
            Reset
          </button>
        </div>
        
        {/* Messages Area */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 dark:bg-gray-950">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8">
              <p>Start a conversation to generate UI components</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                <div className={`max-w-[80%] rounded-lg p-3 ${
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
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-lg p-3 max-w-[80%] border dark:border-gray-700">
                <p className="text-sm">{assistantMessage}</p>
              </div>
            </div>
          )}
          {isLoading && !assistantMessage && (
            <div className="flex justify-start animate-fade-in">
              <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border dark:border-gray-700">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Chat Input */}
        <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me to create UI components..."
              className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-800 border-0 rounded-lg focus:ring-2 focus:ring-purple-500 focus:outline-none text-sm transition-all duration-150"
              disabled={!isConnected || isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!isConnected || isLoading || !input.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}