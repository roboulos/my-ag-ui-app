"use client";

import React from "react";
import { 
  VisualizationType, DashboardType, FormType, TableType, KPIType,
  DataTableType, TimelineType, DocumentViewerType, RichTextEditorType,
  CalendarType, FileUploadType, SettingsPanelType, AnalyticsDashboardType
} from "@/lib/schemas";

// Import Recharts components for professional visualizations
import { 
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  AreaChart, Area, ScatterChart, Scatter, RadarChart, Radar,
  RadialBarChart, RadialBar, Treemap, Sunburst,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PolarGrid, PolarAngleAxis, PolarRadiusAxis, LabelList
} from 'recharts';

// Import Lucide icons
import { 
  Activity, TrendingUp, 
  DollarSign, Users, Package, ShoppingCart, Calendar,
  ChevronRight, MoreVertical, Download, Share2, Filter,
  Search, Bell, Settings, Menu, X, Loader2, Send,
  Moon, Sun, RotateCcw, Clock, FileText, Edit3, Upload,
  Table, CheckCircle, Circle, XCircle, AlertCircle,
  ArrowUp, ArrowDown, ArrowRight, ArrowLeft, Eye,
  Bold, Italic, Underline, List, Link, Image, Code,
  Plus, Minus, Play, Pause, Trash2, Copy, Check,
  ChevronUp, ChevronDown, Maximize2, Minimize2,
  Grid, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon,
  SortAsc, SortDesc, ChevronLeft, Sliders, Palette
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useState, useEffect } from "react";

// Chart color palette - Purple-based theme
const CHART_COLORS = [
  "#9333EA", "#A855F7", "#C084FC", "#D8B4FE", "#E9D5FF",
  "#7C3AED", "#6D28D9", "#5B21B6", "#4C1D95", "#6366F1"
];

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-3 rounded-lg shadow-lg border dark:border-gray-700">
        <p className="font-medium text-gray-900 dark:text-gray-100">{label}</p>
        {payload.map((entry: any, index: number) => (
          <p key={index} className="text-sm" style={{ color: entry.color }}>
            {entry.name}: {entry.value.toLocaleString()}
          </p>
        ))}
      </div>
    );
  }
  return null;
};

// Visualization Response Template with Recharts
export function VisualizationTemplate({ type, title, data, config }: VisualizationType) {
  const getIcon = () => {
    switch (type) {
      case "line": return <LineChartIcon className="w-5 h-5" />;
      case "bar": return <BarChart3 className="w-5 h-5" />;
      case "pie": return <PieChartIcon className="w-5 h-5" />;
      case "area": return <Activity className="w-5 h-5" />;
      case "scatter": return <Grid className="w-5 h-5" />;
      case "radar": return <Activity className="w-5 h-5" />;
      default: return <Activity className="w-5 h-5" />;
    }
  };

  const renderChart = () => {
    // Transform data for multi-series if needed
    const isMultiSeries = data.length > 0 && typeof data[0].value === 'object';
    
    switch (type) {
      case "line":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="label" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#9333EA" 
                strokeWidth={2}
                dot={{ fill: '#9333EA', r: 4 }}
                activeDot={{ r: 6 }}
                animationDuration={1000}
              />
            </LineChart>
          </ResponsiveContainer>
        );
      
      case "bar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="label" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" fill="#9333EA" radius={[8, 8, 0, 0]} animationDuration={1000}>
                <LabelList dataKey="value" position="top" className="fill-gray-600 dark:fill-gray-400" />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case "pie":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ percent }) => `${(percent * 100).toFixed(0)}%`}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                animationBegin={0}
                animationDuration={1000}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        );

      case "area":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={data} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                dataKey="label" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area 
                type="monotone" 
                dataKey="value" 
                stroke="#9333EA" 
                fill="#9333EA" 
                fillOpacity={0.3}
                animationDuration={1000}
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      case "scatter":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200 dark:stroke-gray-700" />
              <XAxis 
                type="number" 
                dataKey="x" 
                name="X" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <YAxis 
                type="number" 
                dataKey="y" 
                name="Y" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ strokeDasharray: '3 3' }} />
              <Scatter 
                name="Data" 
                data={data.map(d => ({ x: d.value, y: d.value * Math.random() }))} 
                fill="#9333EA"
                animationDuration={1000}
              />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case "radar":
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadarChart data={data}>
              <PolarGrid className="stroke-gray-200 dark:stroke-gray-700" />
              <PolarAngleAxis 
                dataKey="label" 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <PolarRadiusAxis 
                className="text-gray-600 dark:text-gray-400"
                tick={{ fill: 'currentColor', fontSize: 12 }}
              />
              <Radar 
                name="Value" 
                dataKey="value" 
                stroke="#9333EA" 
                fill="#9333EA" 
                fillOpacity={0.6}
                animationDuration={1000}
              />
              <Tooltip content={<CustomTooltip />} />
            </RadarChart>
          </ResponsiveContainer>
        );

      case "heatmap":
        // For heatmap, we'll use a treemap as a substitute
        return (
          <ResponsiveContainer width="100%" height={300}>
            <Treemap
              data={[{ 
                name: 'root', 
                children: data.map(d => ({ name: d.label, size: d.value }))
              }]}
              dataKey="size"
              aspectRatio={4/3}
              stroke="#fff"
              fill="#9333EA"
              animationDuration={1000}
            >
              <Tooltip content={<CustomTooltip />} />
            </Treemap>
          </ResponsiveContainer>
        );

      case "gauge":
        // Use RadialBarChart for gauge
        const gaugeData = [{
          name: title,
          value: data[0]?.value || 0,
          fill: '#9333EA'
        }];
        
        return (
          <ResponsiveContainer width="100%" height={300}>
            <RadialBarChart 
              cx="50%" 
              cy="50%" 
              innerRadius="60%" 
              outerRadius="90%" 
              barSize={10} 
              data={gaugeData}
              startAngle={180}
              endAngle={0}
            >
              <PolarAngleAxis
                type="number"
                domain={[0, 100]}
                angleAxisId={0}
                tick={false}
              />
              <RadialBar
                background
                dataKey="value"
                cornerRadius={10}
                fill="#9333EA"
                animationDuration={1000}
              />
              <text x="50%" y="50%" textAnchor="middle" dominantBaseline="middle" className="text-3xl font-bold fill-gray-900 dark:fill-gray-100">
                {gaugeData[0].value}%
              </text>
              <Tooltip />
            </RadialBarChart>
          </ResponsiveContainer>
        );

      default:
        return <div className="h-64 flex items-center justify-center text-gray-500">Chart type "{type}" coming soon!</div>;
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