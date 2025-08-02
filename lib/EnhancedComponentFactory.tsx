"use client";

import React, { useState, useEffect } from "react";
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar,
  RadialBarChart, RadialBar, Treemap, ComposedChart,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, LabelList
} from 'recharts';
import { 
  Activity, TrendingUp, DollarSign, Users, Package, ShoppingCart,
  Gauge, Thermometer, Zap, Target, Clock, Calendar,
  ArrowUp, ArrowDown, MoreVertical, Settings, Eye,
  Palette, Grid, Sliders, ToggleLeft, ToggleRight,
  Upload, Download, Play, Pause, ChevronDown, ChevronRight,
  Info, CheckCircle, AlertCircle, XCircle, ArrowRight,
  Sparkles, BarChart3, PieChartIcon, LineChartIcon
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

// Enhanced color palette with Thesys-inspired gradients
const ENHANCED_COLORS = {
  primary: ["#9333EA", "#A855F7", "#C084FC", "#D8B4FE"],
  secondary: ["#EC4899", "#F472B6", "#F9A8D4", "#FBCFE8"],
  tertiary: ["#3B82F6", "#60A5FA", "#93C5FD", "#BFDBFE"],
  quaternary: ["#10B981", "#34D399", "#6EE7B7", "#A7F3D0"],
  warm: ["#F59E0B", "#FBBF24", "#FCD34D", "#FDE68A"],
  cool: ["#06B6D4", "#22D3EE", "#67E8F9", "#A5F3FC"]
};

// Advanced component type definitions
export interface EnhancedComponentSpec {
  id: string;
  type: string;
  category: "visualization" | "analysis" | "comparison" | "insight" | "interactive";
  props: Record<string, any>;
  timestamp: string;
  animations?: boolean;
  interactive?: boolean;
}

// Thesys-quality components
const ENHANCED_TEMPLATES = {
  // Advanced Visualizations
  multiSeriesBarChart: {
    name: "Multi-Series Bar Chart",
    category: "comparison",
    description: "Grouped bar chart for comparing multiple data series",
    defaultProps: {
      title: "Comparison Chart",
      subtitle: "Analyzing multiple metrics",
      data: [],
      series: ["Series A", "Series B"],
      colors: ENHANCED_COLORS.primary,
      showLegend: true,
      showGrid: true,
      animated: true
    },
    requiredProps: ["title", "data", "series"],
    render: (props: any) => <MultiSeriesBarChart {...props} />
  },

  insightCard: {
    name: "Insight Card",
    category: "insight",
    description: "AI-generated insights with expandable details",
    defaultProps: {
      title: "Key Insight",
      summary: "",
      details: [],
      icon: "Sparkles",
      expandable: true,
      actionable: true
    },
    requiredProps: ["title", "summary"],
    render: (props: any) => <InsightCard {...props} />
  },

  comparisonTable: {
    name: "Comparison Table",
    category: "comparison",
    description: "Interactive table for comparing options",
    defaultProps: {
      title: "Option Comparison",
      headers: [],
      rows: [],
      highlighted: 0,
      interactive: true
    },
    requiredProps: ["title", "headers", "rows"],
    render: (props: any) => <ComparisonTable {...props} />
  },

  relatedQueries: {
    name: "Related Queries",
    category: "interactive",
    description: "Suggested follow-up questions",
    defaultProps: {
      title: "Related Queries",
      queries: [],
      onQueryClick: () => {}
    },
    requiredProps: ["queries"],
    render: (props: any) => <RelatedQueries {...props} />
  },

  expandableSection: {
    name: "Expandable Section",
    category: "interactive",
    description: "Collapsible content with smooth animations",
    defaultProps: {
      title: "More Information",
      content: "",
      defaultOpen: false,
      icon: "ChevronDown"
    },
    requiredProps: ["title", "content"],
    render: (props: any) => <ExpandableSection {...props} />
  }
};

// Enhanced Multi-Series Bar Chart Component
function MultiSeriesBarChart({ 
  title, 
  subtitle, 
  data, 
  series, 
  colors = ENHANCED_COLORS.primary,
  showLegend = true,
  showGrid = true,
  animated = true,
  xAxisLabel,
  yAxisLabel
}: any) {
  // Use provided data or generate sample data
  const chartData = data && data.length > 0 ? data : [
    { category: "Women", Mediterranean: 1700, Keto: 1400, Paleo: 1600, Vegan: 1500 },
    { category: "Men", Mediterranean: 2200, Keto: 2000, Paleo: 2100, Vegan: 2000 }
  ];

  // Extract series keys from series array if it has proper structure
  const seriesKeys = series && Array.isArray(series) && series.length > 0
    ? (typeof series[0] === 'object' && series[0].key 
        ? series.map((s: any) => s.key)
        : series)
    : ["Mediterranean", "Keto", "Paleo", "Vegan"];
  
  // Extract x-axis key (first non-series key in data)
  const xAxisKey = chartData.length > 0 
    ? Object.keys(chartData[0]).find(key => !seriesKeys.includes(key)) || "category"
    : "category";

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader className="space-y-1">
        <CardTitle className="text-xl font-semibold">{title}</CardTitle>
        {subtitle && <CardDescription className="text-gray-500 dark:text-gray-400">{subtitle}</CardDescription>}
      </CardHeader>
      <CardContent className="p-6">
        <div className="w-full h-80">
          <ResponsiveContainer>
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
              {showGrid && <CartesianGrid strokeDasharray="3 3" opacity={0.3} />}
              <XAxis 
                dataKey={xAxisKey} 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                stroke="#9ca3af"
                tickFormatter={(value) => {
                  if (value >= 1000000) return `${(value / 1000000).toFixed(1)}M`;
                  if (value >= 1000) return `${(value / 1000).toFixed(0)}K`;
                  return value;
                }}
              />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#ffffff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
                formatter={(value: any) => {
                  if (typeof value === 'number') {
                    return [value.toLocaleString(), ''];
                  }
                  return [value, ''];
                }}
              />
              {showLegend && <Legend />}
              {seriesKeys.map((key: string, index: number) => {
                const seriesInfo = series?.find((s: any) => s.key === key);
                const fillColor = seriesInfo?.color || colors[index % colors.length];
                
                return (
                  <Bar 
                    key={key}
                    dataKey={key}
                    name={seriesInfo?.name || key}
                    fill={fillColor}
                    radius={[2, 2, 0, 0]}
                  />
                );
              })}
            </BarChart>
          </ResponsiveContainer>
        </div>
        {(xAxisLabel || yAxisLabel) && (
          <div className="mt-4 flex justify-between text-sm text-gray-600 dark:text-gray-400">
            {xAxisLabel && <div><span className="font-medium">X-Axis:</span> {xAxisLabel}</div>}
            {yAxisLabel && <div><span className="font-medium">Y-Axis:</span> {yAxisLabel}</div>}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Insight Card Component
function InsightCard({ 
  title, 
  summary, 
  details = [], 
  icon = "Sparkles",
  expandable = true,
  actionable = true 
}: any) {
  const [isExpanded, setIsExpanded] = useState(false);

  const getIcon = () => {
    switch (icon) {
      case "Info": return <Info className="w-5 h-5" />;
      case "CheckCircle": return <CheckCircle className="w-5 h-5" />;
      case "AlertCircle": return <AlertCircle className="w-5 h-5" />;
      default: return <Sparkles className="w-5 h-5" />;
    }
  };

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-start gap-3">
          <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg text-purple-600 dark:text-purple-400">
            {getIcon()}
          </div>
          <div className="flex-1">
            <CardTitle className="text-lg">{title}</CardTitle>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{summary}</p>
          </div>
        </div>
      </CardHeader>
      {expandable && details.length > 0 && (
        <CardContent>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-2 text-sm text-purple-600 dark:text-purple-400 hover:text-purple-700 dark:hover:text-purple-300 transition-colors"
          >
            <ChevronRight className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
            View Details
          </button>
          {isExpanded && (
            <div className="mt-4 space-y-2 animate-slide-down">
              {details.map((detail: any, index: number) => (
                <div key={index} className="flex items-start gap-2 text-sm">
                  <div className="w-1.5 h-1.5 bg-purple-400 rounded-full mt-1.5" />
                  <span className="text-gray-600 dark:text-gray-400">{detail}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      )}
      {actionable && (
        <CardFooter className="pt-0">
          <Button variant="ghost" size="sm" className="text-purple-600 dark:text-purple-400">
            Learn More <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </CardFooter>
      )}
    </Card>
  );
}

// Comparison Table Component
function ComparisonTable({ 
  title, 
  headers, 
  rows, 
  highlighted = 0,
  interactive = true 
}: any) {
  const [selectedRow, setSelectedRow] = useState(highlighted);

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-xl">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {headers.map((header: string, index: number) => (
                  <th 
                    key={index} 
                    className="px-4 py-3 text-left text-sm font-medium text-gray-700 dark:text-gray-300"
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row: any[], rowIndex: number) => (
                <tr 
                  key={rowIndex}
                  onClick={() => interactive && setSelectedRow(rowIndex)}
                  className={`
                    border-b border-gray-100 dark:border-gray-800 transition-colors cursor-pointer
                    ${selectedRow === rowIndex ? 'bg-purple-50 dark:bg-purple-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'}
                  `}
                >
                  {row.map((cell: any, cellIndex: number) => (
                    <td 
                      key={cellIndex} 
                      className="px-4 py-3 text-sm text-gray-600 dark:text-gray-400"
                    >
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}

// Related Queries Component
function RelatedQueries({ 
  title = "Related Queries", 
  queries, 
  onQueryClick = () => {} 
}: any) {
  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {queries.map((query: string, index: number) => (
            <button
              key={index}
              onClick={() => onQueryClick(query)}
              className="w-full flex items-center justify-between p-3 text-left text-sm bg-gray-50 dark:bg-gray-800 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors group"
            >
              <span className="text-gray-700 dark:text-gray-300">{query}</span>
              <ArrowRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors" />
            </button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Expandable Section Component
function ExpandableSection({ 
  title, 
  content, 
  defaultOpen = false,
  icon = "ChevronDown" 
}: any) {
  return (
    <Accordion type="single" collapsible defaultValue={defaultOpen ? "item-1" : ""}>
      <AccordionItem value="item-1" className="border-none">
        <AccordionTrigger className="hover:no-underline py-3">
          <span className="text-base font-medium">{title}</span>
        </AccordionTrigger>
        <AccordionContent className="pt-2 pb-4">
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {typeof content === 'string' ? (
              <p>{content}</p>
            ) : (
              content
            )}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

// Enhanced Component Factory
export class EnhancedComponentFactory {
  private templates: Record<string, any> = {
    ...ENHANCED_TEMPLATES,
    // Include original templates if needed
  };

  createFromDescription(description: string): EnhancedComponentSpec | null {
    const lowerDesc = description.toLowerCase();
    
    // Enhanced pattern matching
    if (lowerDesc.includes("compare") || lowerDesc.includes("comparison") || 
        (lowerDesc.includes("multi") && lowerDesc.includes("series")) ||
        (lowerDesc.includes("multiple") && lowerDesc.includes("series"))) {
      if (lowerDesc.includes("chart") || lowerDesc.includes("bar")) {
        // Extract meaningful title from description
        let title = "Multi-Series Bar Chart";
        let subtitle = "Comparative analysis";
        
        if (lowerDesc.includes("sales") && lowerDesc.includes("revenue")) {
          title = "Sales & Revenue Comparison";
          subtitle = "Quarterly performance metrics";
        } else if (lowerDesc.includes("quarter")) {
          subtitle = "Quarterly comparison";
        }
        
        return this.createComponent("multiSeriesBarChart", {
          title,
          subtitle,
          data: [
            { quarter: "Q1 2024", sales: 450000, revenue: 520000, profit: 70000 },
            { quarter: "Q2 2024", sales: 480000, revenue: 580000, profit: 100000 },
            { quarter: "Q3 2024", sales: 520000, revenue: 640000, profit: 120000 },
            { quarter: "Q4 2024", sales: 580000, revenue: 720000, profit: 140000 }
          ],
          series: [
            { key: "sales", name: "Sales", color: "#8b5cf6" },
            { key: "revenue", name: "Revenue", color: "#3b82f6" },
            { key: "profit", name: "Profit", color: "#10b981" }
          ]
        });
      }
      if (lowerDesc.includes("table")) {
        return this.createComponent("comparisonTable", {
          title: "Option Comparison",
          headers: ["Feature", "Option A", "Option B"],
          rows: []
        });
      }
    }

    if (lowerDesc.includes("insight") || lowerDesc.includes("analysis")) {
      return this.createComponent("insightCard", {
        title: "Key Insight",
        summary: "AI-generated analysis"
      });
    }

    if (lowerDesc.includes("related") || lowerDesc.includes("queries") || lowerDesc.includes("questions")) {
      return this.createComponent("relatedQueries", {
        queries: []
      });
    }

    if (lowerDesc.includes("expandable") || lowerDesc.includes("collapsible") || lowerDesc.includes("accordion")) {
      return this.createComponent("expandableSection", {
        title: "Additional Information",
        content: "Detailed content here"
      });
    }

    return null;
  }

  createComponent(type: string, props: Record<string, any> = {}): EnhancedComponentSpec {
    const template = this.templates[type];
    if (!template) {
      throw new Error(`Unknown component type: ${type}`);
    }

    return {
      id: `ecomp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      category: template.category,
      props: { ...template.defaultProps, ...props },
      timestamp: new Date().toISOString(),
      animations: true,
      interactive: true
    };
  }

  renderComponent(spec: EnhancedComponentSpec): React.ReactNode {
    const template = this.templates[spec.type];
    if (!template) {
      return <div>Unknown component type: {spec.type}</div>;
    }

    return (
      <div key={spec.id} className="animate-component-materialize">
        {template.render(spec.props)}
      </div>
    );
  }

  getAvailableTypes(): string[] {
    return Object.keys(this.templates);
  }
}

export const enhancedComponentFactory = new EnhancedComponentFactory();