"use client";

import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar,
  RadialBarChart, RadialBar, Treemap, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis
} from 'recharts';
import { 
  Activity, TrendingUp, DollarSign, Users, Package, ShoppingCart,
  Gauge, Thermometer, Zap, Target, Clock, Calendar,
  ArrowUp, ArrowDown, MoreVertical, Settings, Eye,
  Palette, Grid, Sliders, ToggleLeft, ToggleRight,
  Upload, Download, Play, Pause
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// Chart color palette - Purple-based theme
const CHART_COLORS = [
  "#9333EA", "#A855F7", "#C084FC", "#D8B4FE", "#E9D5FF",
  "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95", "#6366F1"
];

// Dynamic component type definitions
export interface ComponentSpec {
  id: string;
  type: string;
  category: "chart" | "widget" | "layout" | "interactive" | "display";
  props: Record<string, any>;
  timestamp: string;
}

export interface ComponentTemplate {
  name: string;
  category: "chart" | "widget" | "layout" | "interactive" | "display";
  description: string;
  defaultProps: Record<string, any>;
  requiredProps: string[];
  render: (props: any) => React.ReactNode;
}

// Component Templates Registry
const COMPONENT_TEMPLATES: Record<string, ComponentTemplate> = {
  // Advanced Chart Types
  gauge: {
    name: "Gauge Chart",
    category: "chart",
    description: "Circular gauge for showing percentage or progress values",
    defaultProps: {
      title: "Progress",
      value: 75,
      max: 100,
      unit: "%",
      color: "#9333EA",
      showLabel: true
    },
    requiredProps: ["title", "value"],
    render: (props) => <GaugeChart {...props} />
  },
  
  heatmap: {
    name: "Heat Map",
    category: "chart", 
    description: "2D visualization showing data intensity with color coding",
    defaultProps: {
      title: "Activity Heatmap",
      data: [],
      colorRange: ["#E9D5FF", "#9333EA"],
      cellSize: 20
    },
    requiredProps: ["title", "data"],
    render: (props) => <HeatMapChart {...props} />
  },

  sparkline: {
    name: "Sparkline",
    category: "chart",
    description: "Mini trend line for compact data visualization",
    defaultProps: {
      data: [],
      color: "#9333EA",
      showDots: false,
      height: 40
    },
    requiredProps: ["data"],
    render: (props) => <SparklineChart {...props} />
  },

  funnel: {
    name: "Funnel Chart", 
    category: "chart",
    description: "Conversion funnel visualization",
    defaultProps: {
      title: "Conversion Funnel",
      data: [],
      colors: CHART_COLORS
    },
    requiredProps: ["title", "data"],
    render: (props) => <FunnelChart {...props} />
  },

  // Interactive Widgets
  progressBar: {
    name: "Progress Bar",
    category: "widget",
    description: "Animated progress indicator with customizable styling",
    defaultProps: {
      title: "Progress",
      value: 65,
      max: 100,
      color: "#9333EA",
      animated: true,
      showPercentage: true
    },
    requiredProps: ["title", "value"],
    render: (props) => <ProgressBar {...props} />
  },

  toggleSwitch: {
    name: "Toggle Switch",
    category: "interactive",
    description: "Interactive toggle for boolean states",
    defaultProps: {
      label: "Enable Feature",
      value: false,
      color: "#9333EA",
      onChange: () => {}
    },
    requiredProps: ["label"],
    render: (props) => <ToggleSwitch {...props} />
  },

  slider: {
    name: "Slider Control",
    category: "interactive", 
    description: "Range input slider for numeric values",
    defaultProps: {
      label: "Value",
      value: 50,
      min: 0,
      max: 100,
      step: 1,
      onChange: () => {}
    },
    requiredProps: ["label"],
    render: (props) => <SliderControl {...props} />
  },

  colorPicker: {
    name: "Color Picker",
    category: "interactive",
    description: "Color selection widget",
    defaultProps: {
      label: "Choose Color",
      value: "#9333EA",
      onChange: () => {}
    },
    requiredProps: ["label"],
    render: (props) => <ColorPicker {...props} />
  },

  // Layout Components
  dynamicGrid: {
    name: "Dynamic Grid",
    category: "layout",
    description: "Resizable grid layout for components",
    defaultProps: {
      columns: 3,
      gap: 4,
      items: [],
      resizable: true
    },
    requiredProps: ["items"],
    render: (props) => <DynamicGrid {...props} />
  },

  collapsiblePanel: {
    name: "Collapsible Panel",
    category: "layout",
    description: "Expandable content section",
    defaultProps: {
      title: "Panel",
      defaultOpen: false,
      content: "",
      icon: "ChevronRight"
    },
    requiredProps: ["title", "content"],
    render: (props) => <CollapsiblePanel {...props} />
  },

  tabsContainer: {
    name: "Tabs Container",
    category: "layout",
    description: "Switchable content tabs",
    defaultProps: {
      tabs: [],
      defaultTab: 0
    },
    requiredProps: ["tabs"],
    render: (props) => <TabsContainer {...props} />
  },

  // Display Components
  statCard: {
    name: "Stat Card",
    category: "display",
    description: "Highlighted statistic with trend indicator",
    defaultProps: {
      title: "Statistic",
      value: "0",
      change: "+0%",
      trend: "up",
      icon: "TrendingUp",
      color: "#9333EA"
    },
    requiredProps: ["title", "value"],
    render: (props) => <StatCard {...props} />
  },

  alertBanner: {
    name: "Alert Banner",
    category: "display",
    description: "Notification or status banner",
    defaultProps: {
      message: "Alert message",
      type: "info",
      dismissible: true,
      onDismiss: () => {}
    },
    requiredProps: ["message"],
    render: (props) => <AlertBanner {...props} />
  }
};

// Component Factory Class
export class ComponentFactory {
  private templates: Record<string, ComponentTemplate> = COMPONENT_TEMPLATES;
  
  // Register a new component template
  registerTemplate(name: string, template: ComponentTemplate) {
    this.templates[name] = template;
  }

  // Get available component types
  getAvailableTypes(): string[] {
    return Object.keys(this.templates);
  }

  // Get component template by name
  getTemplate(name: string): ComponentTemplate | null {
    return this.templates[name] || null;
  }

  // Create component instance from natural language description
  createFromDescription(description: string): ComponentSpec | null {
    // Simple keyword matching for component type detection
    const lowerDesc = description.toLowerCase();
    
    // Chart keywords
    if (lowerDesc.includes("gauge") || lowerDesc.includes("speedometer")) {
      return this.createComponent("gauge", { title: "Gauge", value: 75 });
    }
    if (lowerDesc.includes("heatmap") || lowerDesc.includes("heat map")) {
      return this.createComponent("heatmap", { title: "Heat Map", data: [] });
    }
    if (lowerDesc.includes("sparkline") || lowerDesc.includes("mini chart")) {
      return this.createComponent("sparkline", { data: [] });
    }
    if (lowerDesc.includes("funnel") || lowerDesc.includes("conversion")) {
      return this.createComponent("funnel", { title: "Funnel", data: [] });
    }

    // Widget keywords
    if (lowerDesc.includes("progress bar") || lowerDesc.includes("progress")) {
      return this.createComponent("progressBar", { title: "Progress", value: 65 });
    }
    if (lowerDesc.includes("toggle") || lowerDesc.includes("switch")) {
      return this.createComponent("toggleSwitch", { label: "Toggle" });
    }
    if (lowerDesc.includes("slider") || lowerDesc.includes("range")) {
      return this.createComponent("slider", { label: "Value" });
    }
    if (lowerDesc.includes("color picker") || lowerDesc.includes("color")) {
      return this.createComponent("colorPicker", { label: "Color" });
    }

    // Layout keywords
    if (lowerDesc.includes("grid") || lowerDesc.includes("layout")) {
      return this.createComponent("dynamicGrid", { items: [] });
    }
    if (lowerDesc.includes("panel") || lowerDesc.includes("collapsible")) {
      return this.createComponent("collapsiblePanel", { title: "Panel", content: "Content" });
    }
    if (lowerDesc.includes("tabs") || lowerDesc.includes("tab")) {
      return this.createComponent("tabsContainer", { tabs: [] });
    }

    // Display keywords
    if (lowerDesc.includes("stat") || lowerDesc.includes("metric")) {
      return this.createComponent("statCard", { title: "Statistic", value: "100" });
    }
    if (lowerDesc.includes("alert") || lowerDesc.includes("banner")) {
      return this.createComponent("alertBanner", { message: "Alert message" });
    }

    return null;
  }

  // Create component with specific type and props
  createComponent(type: string, props: Record<string, any> = {}): ComponentSpec {
    const template = this.getTemplate(type);
    if (!template) {
      throw new Error(`Unknown component type: ${type}`);
    }

    return {
      id: `comp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      category: template.category,
      props: { ...template.defaultProps, ...props },
      timestamp: new Date().toISOString()
    };
  }

  // Render component from spec
  renderComponent(spec: ComponentSpec): React.ReactNode {
    const template = this.getTemplate(spec.type);
    if (!template) {
      return <div>Unknown component type: {spec.type}</div>;
    }

    return (
      <div key={spec.id} className="animate-component-materialize">
        {template.render(spec.props)}
      </div>
    );
  }
}

// Create singleton factory instance
export const componentFactory = new ComponentFactory();

// Individual Component Implementations
function GaugeChart({ title, value, max = 100, unit = "%", color = "#9333EA", showLabel = true }: any) {
  const percentage = (value / max) * 100;
  const strokeDasharray = `${percentage * 2.51}, 251`;

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <Gauge className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative w-32 h-32 mx-auto">
          <svg className="w-full h-full transform -rotate-90" viewBox="-2 -2 84 84">
            <circle
              cx="40"
              cy="40"
              r="40"
              fill="none"
              stroke="currentColor"
              strokeWidth="4"
              className="text-gray-200 dark:text-gray-700"
            />
            <circle
              cx="40"
              cy="40"
              r="40"
              fill="none"
              stroke={color}
              strokeWidth="4"
              strokeDasharray={strokeDasharray}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          {showLabel && (
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                {value}{unit}
              </span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function HeatMapChart({ title, data, colorRange = ["#E9D5FF", "#9333EA"], cellSize = 20 }: any) {
  // Generate sample heatmap data if none provided
  const sampleData = data.length ? data : Array.from({ length: 7 }, (_, day) =>
    Array.from({ length: 24 }, (_, hour) => ({
      day,
      hour,
      value: Math.floor(Math.random() * 100)
    }))
  ).flat();

  const maxValue = Math.max(...sampleData.map((d: any) => d.value));

  const getColor = (value: number) => {
    const intensity = value / maxValue;
    const r = parseInt(colorRange[0].slice(1, 3), 16);
    const g = parseInt(colorRange[0].slice(3, 5), 16);
    const b = parseInt(colorRange[0].slice(5, 7), 16);
    const r2 = parseInt(colorRange[1].slice(1, 3), 16);
    const g2 = parseInt(colorRange[1].slice(3, 5), 16);
    const b2 = parseInt(colorRange[1].slice(5, 7), 16);
    
    const finalR = Math.round(r + (r2 - r) * intensity);
    const finalG = Math.round(g + (g2 - g) * intensity);
    const finalB = Math.round(b + (b2 - b) * intensity);
    
    return `rgb(${finalR}, ${finalG}, ${finalB})`;
  };

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <Grid className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-24 gap-1">
          {sampleData.map((cell: any, index: number) => (
            <div
              key={index}
              className="aspect-square rounded-sm transition-all duration-200 hover:scale-110"
              style={{
                backgroundColor: getColor(cell.value),
                width: `${cellSize}px`,
                height: `${cellSize}px`
              }}
              title={`Day ${cell.day}, Hour ${cell.hour}: ${cell.value}`}
            />
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SparklineChart({ data, color = "#9333EA", showDots = false, height = 40 }: any) {
  // Generate sample data if none provided
  const sampleData = data.length ? data : Array.from({ length: 20 }, (_, i) => ({
    value: 20 + Math.sin(i / 3) * 15 + Math.random() * 10
  }));

  return (
    <div className="w-full animate-slide-up" style={{ height: `${height}px` }}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={sampleData}>
          <Line
            type="monotone"
            dataKey="value"
            stroke={color}
            strokeWidth={2}
            dot={showDots ? { fill: color, r: 2 } : false}
            animationDuration={1000}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

function FunnelChart({ title, data, colors = CHART_COLORS }: any) {
  // Generate sample funnel data if none provided
  const sampleData = data.length ? data : [
    { stage: "Visitors", value: 10000 },
    { stage: "Leads", value: 5000 },
    { stage: "Prospects", value: 2000 },
    { stage: "Customers", value: 500 }
  ];

  const maxValue = Math.max(...sampleData.map((d: any) => d.value));

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <Target className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {sampleData.map((stage: any, index: number) => {
            const width = (stage.value / maxValue) * 100;
            return (
              <div key={index} className="space-y-1 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{stage.stage}</span>
                  <span className="text-gray-500">{stage.value.toLocaleString()}</span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-8">
                  <div
                    className="h-8 rounded-full transition-all duration-1000 ease-out flex items-center justify-center text-white text-sm font-medium"
                    style={{
                      width: `${width}%`,
                      backgroundColor: colors[index % colors.length]
                    }}
                  >
                    {width.toFixed(0)}%
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function ProgressBar({ title, value, max = 100, color = "#9333EA", animated = true, showPercentage = true }: any) {
  const percentage = (value / max) * 100;

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-gray-900 dark:text-gray-100">{title}</h3>
            {showPercentage && (
              <span className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {value}/{max} ({percentage.toFixed(0)}%)
              </span>
            )}
          </div>
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
            <div
              className={`h-3 rounded-full transition-all duration-1000 ease-out ${animated ? 'animate-expand' : ''}`}
              style={{
                width: `${percentage}%`,
                backgroundColor: color
              }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ToggleSwitch({ label, value, color = "#9333EA", onChange = () => {} }: any) {
  const [isOn, setIsOn] = useState(value);

  const handleToggle = () => {
    const newValue = !isOn;
    setIsOn(newValue);
    onChange(newValue);
  };

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
          <button
            onClick={handleToggle}
            className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 ${
              isOn ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
            }`}
          >
            <span
              className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                isOn ? 'translate-x-6' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </CardContent>
    </Card>
  );
}

function SliderControl({ label, value, min = 0, max = 100, step = 1, onChange = () => {} }: any) {
  const [currentValue, setCurrentValue] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setCurrentValue(newValue);
    onChange(newValue);
  };

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
            <span className="text-sm font-medium text-purple-600 dark:text-purple-400">{currentValue}</span>
          </div>
          <input
            type="range"
            min={min}
            max={max}
            step={step}
            value={currentValue}
            onChange={handleChange}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
          />
        </div>
      </CardContent>
    </Card>
  );
}

function ColorPicker({ label, value = "#9333EA", onChange = () => {} }: any) {
  const [currentColor, setCurrentColor] = useState(value);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newColor = e.target.value;
    setCurrentColor(newColor);
    onChange(newColor);
  };

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardContent className="p-6">
        <div className="space-y-3">
          <span className="font-medium text-gray-900 dark:text-gray-100">{label}</span>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={currentColor}
              onChange={handleChange}
              className="w-12 h-12 rounded-lg border-2 border-gray-200 dark:border-gray-700 cursor-pointer"
            />
            <Input
              type="text"
              value={currentColor}
              onChange={(e) => handleChange(e as any)}
              className="flex-1 font-mono text-sm"
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function DynamicGrid({ columns = 3, gap = 4, items = [], resizable = true }: any) {
  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardContent className="p-6">
        <div 
          className={`grid gap-${gap}`}
          style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
        >
          {items.map((item: any, index: number) => (
            <div
              key={index}
              className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg animate-fade-in"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {item.content || `Grid Item ${index + 1}`}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function CollapsiblePanel({ title, defaultOpen = false, content, icon = "ChevronRight" }: any) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex items-center justify-between w-full text-left"
        >
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className={`transform transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}>
            <Activity className="w-4 h-4" />
          </div>
        </button>
      </CardHeader>
      {isOpen && (
        <CardContent className="animate-slide-down">
          <p className="text-gray-600 dark:text-gray-400">{content}</p>
        </CardContent>
      )}
    </Card>
  );
}

function TabsContainer({ tabs = [], defaultTab = 0 }: any) {
  const [activeTab, setActiveTab] = useState(defaultTab);

  // Sample tabs if none provided
  const sampleTabs = tabs.length ? tabs : [
    { label: "Tab 1", content: "Content for tab 1" },
    { label: "Tab 2", content: "Content for tab 2" },
    { label: "Tab 3", content: "Content for tab 3" }
  ];

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader className="pb-0">
        <div className="flex border-b border-gray-200 dark:border-gray-700">
          {sampleTabs.map((tab: any, index: number) => (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`px-4 py-2 font-medium text-sm transition-colors duration-200 border-b-2 ${
                activeTab === index
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400'
                  : 'border-transparent text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <div className="animate-fade-in">
          {sampleTabs[activeTab]?.content}
        </div>
      </CardContent>
    </Card>
  );
}

function StatCard({ title, value, change, trend = "up", icon = "TrendingUp", color = "#9333EA" }: any) {
  const getIcon = () => {
    switch (icon) {
      case "DollarSign": return <DollarSign className="w-6 h-6" />;
      case "Users": return <Users className="w-6 h-6" />;
      case "Package": return <Package className="w-6 h-6" />;
      case "ShoppingCart": return <ShoppingCart className="w-6 h-6" />;
      default: return <TrendingUp className="w-6 h-6" />;
    }
  };

  const getTrendIcon = () => {
    return trend === "up" ? <ArrowUp className="w-4 h-4" /> : <ArrowDown className="w-4 h-4" />;
  };

  const changeColor = trend === "up" 
    ? "text-green-600 dark:text-green-400" 
    : "text-red-600 dark:text-red-400";

  return (
    <Card className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02]">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
            <p className="text-3xl font-bold text-gray-900 dark:text-gray-100 animate-count-up">{value}</p>
            {change && (
              <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
                {getTrendIcon()}
                <span>{change}</span>
              </div>
            )}
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function AlertBanner({ message, type = "info", dismissible = true, onDismiss = () => {} }: any) {
  const [visible, setVisible] = useState(true);

  if (!visible) return null;

  const handleDismiss = () => {
    setVisible(false);
    onDismiss();
  };

  const typeStyles = {
    info: "bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200",
    success: "bg-green-50 dark:bg-green-950 border-green-200 dark:border-green-800 text-green-800 dark:text-green-200",
    warning: "bg-yellow-50 dark:bg-yellow-950 border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200",
    error: "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800 text-red-800 dark:text-red-200"
  };

  return (
    <div className={`p-4 border rounded-lg animate-slide-up ${typeStyles[type as keyof typeof typeStyles]}`}>
      <div className="flex items-center justify-between">
        <p className="font-medium">{message}</p>
        {dismissible && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleDismiss}
            className="h-auto p-1 hover:bg-transparent"
          >
            ×
          </Button>
        )}
      </div>
    </div>
  );
}

export default ComponentFactory;