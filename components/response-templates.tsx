"use client";

import React from "react";
import { 
  VisualizationType, DashboardType, FormType, TableType, KPIType,
  DataTableType, TimelineType, DocumentViewerType, RichTextEditorType,
  CalendarType, FileUploadType, SettingsPanelType, AnalyticsDashboardType
} from "@/lib/schemas";

// Import our existing component implementations
import { 
  LineChart, BarChart, PieChart, Activity, TrendingUp, 
  DollarSign, Users, Package, ShoppingCart, Calendar,
  ChevronRight, MoreVertical, Download, Share2, Filter,
  Search, Bell, Settings, Menu, X, Loader2, Send,
  Moon, Sun, RotateCcw, Clock, FileText, Edit3, Upload,
  Table, CheckCircle, Circle, XCircle, AlertCircle,
  ArrowUp, ArrowDown, ArrowRight, ArrowLeft, Eye,
  Bold, Italic, Underline, List, Link, Image, Code,
  Plus, Minus, Play, Pause, Trash2, Copy, Check,
  ChevronUp, ChevronDown, Maximize2, Minimize2,
  Grid, BarChart3, PieChart as PieChartIcon,
  SortAsc, SortDesc, ChevronLeft, Sliders, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

// Chart color palette
const CHART_COLORS = [
  "#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6",
  "#EC4899", "#06B6D4", "#84CC16", "#F97316", "#6366F1"
];

// Visualization Response Template (Crayon-compatible)
export function VisualizationTemplate({ type, title, data, config }: VisualizationType) {
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
            {data.map((point, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-2">
                <div 
                  className="w-full bg-gradient-to-t from-purple-600 to-purple-400 rounded-t animate-grow-up"
                  style={{ 
                    height: `${(point.value / Math.max(...data.map(d => d.value))) * 100}%`,
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
            {data.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-3 group/bar hover:scale-105 transition-all duration-300">
                <span className="text-sm w-24 text-gray-600 dark:text-gray-400 group-hover/bar:text-purple-600 dark:group-hover/bar:text-purple-400 transition-colors duration-300">{item.label}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden group-hover/bar:shadow-lg transition-all duration-300">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-end px-3 animate-expand transition-all duration-500 group-hover/bar:from-purple-500 group-hover/bar:to-purple-300"
                    style={{ 
                      "--target-width": `${(item.value / Math.max(...data.map(d => d.value))) * 100}%`,
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
        const total = data.reduce((sum, item) => sum + item.value, 0);
        let currentAngle = 0;
        
        return (
          <div className="h-64 flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {data.map((segment, i) => {
                  const percentage = (segment.value / total) * 100;
                  const strokeDasharray = `${percentage} ${100 - percentage}`;
                  const strokeDashoffset = -currentAngle;
                  const angle = currentAngle;
                  currentAngle += percentage;
                  
                  return (
                    <circle
                      key={i}
                      cx="50"
                      cy="50"
                      r="15.915"
                      fill="transparent"
                      stroke={CHART_COLORS[i % CHART_COLORS.length]}
                      strokeWidth="8"
                      strokeDasharray={strokeDasharray}
                      strokeDashoffset={strokeDashoffset}
                      className="animate-draw"
                      style={{ animationDelay: `${i * 0.3}s` }}
                    />
                  );
                })}
              </svg>
              
              {/* Legend */}
              <div className="absolute -right-24 top-0 space-y-2">
                {data.map((segment, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm">
                    <div 
                      className="w-3 h-3 rounded-full animate-scale-in"
                      style={{ 
                        backgroundColor: CHART_COLORS[i % CHART_COLORS.length],
                        animationDelay: `${i * 0.1}s`
                      }}
                    />
                    <span className="text-gray-600 dark:text-gray-400">{segment.label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        );

      default:
        return <div className="h-64 flex items-center justify-center text-gray-500">Chart type not supported</div>;
    }
  };

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              {getIcon()}
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="icon">
              <Download className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <Share2 className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}

// KPI Response Template
export function KPITemplate({ title, value, change, icon, trend }: KPIType) {
  const getIcon = () => {
    switch (icon) {
      case "revenue": return <DollarSign className="w-6 h-6" />;
      case "users": return <Users className="w-6 h-6" />;
      case "sales": return <ShoppingCart className="w-6 h-6" />;
      case "products": return <Package className="w-6 h-6" />;
      case "activity": return <Activity className="w-6 h-6" />;
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
            <div className={`flex items-center gap-1 text-sm font-medium ${changeColor}`}>
              {getTrendIcon()}
              <span>{change}</span>
            </div>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Form Response Template
export function FormTemplate({ title, fields, submitAction }: FormType) {
  const [formData, setFormData] = useState<Record<string, any>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    // Here you could send data back to the AI or perform actions
  };

  const handleChange = (name: string, value: any) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <FileText className="w-6 h-6" />
          </div>
          <CardTitle className="text-lg">{title}</CardTitle>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {fields.map((field, index) => (
            <div key={field.name} className="space-y-2 animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
              <Label htmlFor={field.name}>{field.label}</Label>
              {field.type === "select" && field.options ? (
                <Select value={formData[field.name] || ""} onValueChange={(value) => handleChange(field.name, value)}>
                  <SelectTrigger>
                    <SelectValue placeholder={field.placeholder || `Select ${field.label}`} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options.map(option => (
                      <SelectItem key={option} value={option}>{option}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.name}
                  type={field.type || "text"}
                  placeholder={field.placeholder}
                  value={formData[field.name] || ""}
                  onChange={(e) => handleChange(field.name, e.target.value)}
                  className="focus-ring"
                />
              )}
            </div>
          ))}
          <Button type="submit" className="w-full mt-6 hover-lift">
            {submitAction || "Submit"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

// Table Response Template
export function TableTemplate({ title, columns, data, features }: TableType) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [filterValue, setFilterValue] = useState("");

  // Sort and filter data
  let processedData = [...data];
  
  if (filterValue && features?.filtering) {
    processedData = processedData.filter(row => 
      Object.values(row).some(value => 
        String(value).toLowerCase().includes(filterValue.toLowerCase())
      )
    );
  }

  if (sortColumn && features?.sorting) {
    processedData.sort((a, b) => {
      const aValue = a[sortColumn];
      const bValue = b[sortColumn];
      const direction = sortDirection === "asc" ? 1 : -1;
      return aValue > bValue ? direction : -direction;
    });
  }

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };

  return (
    <Card className="w-full animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Table className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {features?.filtering && (
            <div className="flex items-center gap-2">
              <Search className="w-4 h-4 text-gray-400" />
              <Input
                placeholder="Filter data..."
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
                className="w-48"
              />
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                {columns.map((column) => (
                  <th
                    key={column.field}
                    className="text-left p-4 font-medium text-gray-600 dark:text-gray-400 cursor-pointer hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-200"
                    onClick={() => features?.sorting && handleSort(column.field)}
                  >
                    <div className="flex items-center gap-2">
                      {column.label}
                      {features?.sorting && sortColumn === column.field && (
                        sortDirection === "asc" ? <SortAsc className="w-4 h-4" /> : <SortDesc className="w-4 h-4" />
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {processedData.map((row, index) => (
                <tr 
                  key={index} 
                  className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors duration-200 animate-fade-in"
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  {columns.map((column) => (
                    <td key={column.field} className="p-4 text-gray-900 dark:text-gray-100">
                      {row[column.field]}
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

// Dashboard Response Template
export function DashboardTemplate({ title, layout = "grid", components }: DashboardType) {
  const layoutClass = {
    grid: "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
    list: "space-y-6",
    masonry: "columns-1 md:columns-2 lg:columns-3 gap-6"
  }[layout];

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{title}</h2>
        <div className="flex gap-2">
          <Button variant="ghost" size="icon">
            <Download className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="icon">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>
      
      <div className={layoutClass}>
        {components.map((comp, i) => (
          <div key={i} className="animate-component-materialize hover-lift" style={{ animationDelay: `${i * 0.2}s` }}>
            {/* This would render sub-components - for now showing placeholder */}
            <Card className="p-6">
              <div className="text-center text-gray-500">
                Component {i + 1}: {comp.type || "Unknown"}
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}