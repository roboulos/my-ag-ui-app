"use client";

import { useState, useEffect, useRef } from "react";
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

// Dynamic component types
type ComponentType = "generateVisualization" | "generateDashboard" | "generateForm" | "generateTable" | "generateKPI" | 
                    "generateDataTable" | "generateTimeline" | "generateDocumentViewer" | "generateRichTextEditor" | 
                    "generateCalendar" | "generateFileUpload" | "generateSettingsPanel" | "generateAnalyticsDashboard";

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
              <div key={i} className="flex items-center gap-3 group/bar hover:scale-105 transition-all duration-300">
                <span className="text-sm w-24 text-gray-600 dark:text-gray-400 group-hover/bar:text-purple-600 dark:group-hover/bar:text-purple-400 transition-colors duration-300">{item.label}</span>
                <div className="flex-1 bg-gray-200 dark:bg-gray-700 rounded-full h-8 overflow-hidden group-hover/bar:shadow-lg transition-all duration-300">
                  <div 
                    className="h-full bg-gradient-to-r from-purple-600 to-purple-400 rounded-full flex items-center justify-end px-3 animate-expand transition-all duration-500 group-hover/bar:from-purple-500 group-hover/bar:to-purple-300"
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
                <div key={i} className="flex items-center gap-2 animate-fade-in hover:scale-105 cursor-pointer transition-all duration-300 p-1 rounded" style={{ animationDelay: `${i * 0.1}s` }}>
                  <div 
                    className="w-3 h-3 rounded-full transition-all duration-300 hover:scale-125" 
                    style={{ backgroundColor: CHART_COLORS[i % CHART_COLORS.length] }}
                  />
                  <span className="text-sm dark:text-gray-300 hover:text-purple-600 dark:hover:text-purple-400 transition-colors duration-300">{item.label}: {item.value.toLocaleString()}</span>
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
    <Card className="animate-slide-up hover-lift hover-glow transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50">
              {getIcon()}
            </div>
            <CardTitle className="text-lg transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon" className="hover-lift opacity-60 group-hover:opacity-100 transition-all duration-300">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {renderChart()}
      </CardContent>
    </Card>
  );
}

// Dynamic Table Component
function DynamicTable({ title, columns, data, features }: any) {
  return (
    <Card className="animate-slide-up hover-lift hover-glow transition-all duration-300 group">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{title}</CardTitle>
          <div className="flex gap-2 opacity-60 group-hover:opacity-100 transition-all duration-300">
            {features?.filtering && (
              <Button variant="ghost" size="icon" className="hover-lift">
                <Filter className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon" className="hover-lift">
              <Download className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
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
      </CardContent>
    </Card>
  );
}

// Dynamic Form Component
function DynamicForm({ title, fields, submitAction }: any) {
  const [formData, setFormData] = useState<any>({});

  return (
    <Card className="animate-slide-up hover-lift hover-glow transition-all duration-300 group">
      <CardHeader>
        <CardTitle className="text-lg transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <form className="space-y-4">
        {fields.map((field: any, i: number) => (
          <div key={i} className="animate-fade-in space-y-2" style={{ animationDelay: `${i * 0.1}s` }}>
            <Label htmlFor={field.name}>{field.label}</Label>
            {field.type === "select" ? (
              <Select onValueChange={(value) => setFormData({ ...formData, [field.name]: value })}>
                <SelectTrigger>
                  <SelectValue placeholder={`Select ${field.label}`} />
                </SelectTrigger>
                <SelectContent>
                  {field.options?.map((opt: string) => (
                    <SelectItem key={opt} value={opt}>{opt}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id={field.name}
                type={field.type || "text"}
                placeholder={field.placeholder}
                onChange={(e) => setFormData({ ...formData, [field.name]: e.target.value })}
              />
            )}
          </div>
        ))}
        <Button
          type="submit"
          className="w-full"
          onClick={(e) => {
            e.preventDefault();
            console.log("Form submitted:", formData);
          }}
        >
          {submitAction || "Submit"}
        </Button>
        </form>
      </CardContent>
    </Card>
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
    <Card className="animate-slide-up hover-lift hover-glow transition-all duration-500 group cursor-pointer">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm text-muted-foreground mb-1 transition-colors duration-300 group-hover:text-purple-600 dark:group-hover:text-purple-400">{title}</p>
            <p className="text-3xl font-bold animate-count-up transition-all duration-300 group-hover:scale-105">{value}</p>
            <div className={`flex items-center gap-1 mt-2 ${changeColor} transition-all duration-300 group-hover:scale-110`}>
              {trendIcon}
              <span className="text-sm font-medium">{change}</span>
            </div>
          </div>
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400 transition-all duration-300 group-hover:scale-110 group-hover:rotate-12 group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50">
            {getIcon()}
          </div>
        </div>
      </CardContent>
    </Card>
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

// Advanced Data Table Component
function AdvancedDataTable({ title, columns, data, features, pageSize = 10 }: any) {
  const [sortColumn, setSortColumn] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [filterValues, setFilterValues] = useState<Record<string, string>>({});
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedRows, setSelectedRows] = useState<Set<number>>(new Set());

  // Filter and search data
  const filteredData = data.filter((row: any) => {
    // Global search
    if (searchTerm && features?.search) {
      const searchLower = searchTerm.toLowerCase();
      const matches = Object.values(row).some((value: any) => 
        String(value).toLowerCase().includes(searchLower)
      );
      if (!matches) return false;
    }

    // Column filters
    return Object.entries(filterValues).every(([field, filterValue]) => {
      if (!filterValue) return true;
      return String(row[field]).toLowerCase().includes(filterValue.toLowerCase());
    });
  });

  // Sort data
  const sortedData = [...filteredData].sort((a, b) => {
    if (!sortColumn) return 0;
    const aVal = a[sortColumn];
    const bVal = b[sortColumn];
    
    if (typeof aVal === 'number' && typeof bVal === 'number') {
      return sortDirection === 'asc' ? aVal - bVal : bVal - aVal;
    }
    
    const aStr = String(aVal).toLowerCase();
    const bStr = String(bVal).toLowerCase();
    
    if (sortDirection === 'asc') {
      return aStr.localeCompare(bStr);
    } else {
      return bStr.localeCompare(aStr);
    }
  });

  // Pagination
  const totalPages = Math.ceil(sortedData.length / pageSize);
  const startIndex = (currentPage - 1) * pageSize;
  const paginatedData = features?.pagination ? sortedData.slice(startIndex, startIndex + pageSize) : sortedData;

  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortColumn(column);
      setSortDirection('asc');
    }
  };

  const formatCellValue = (value: any, type: string) => {
    switch (type) {
      case 'currency':
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
      case 'number':
        return Number(value).toLocaleString();
      case 'date':
        return new Date(value).toLocaleDateString();
      case 'badge':
        return (
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
            value === 'active' || value === 'completed' ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400' :
            value === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400' :
            'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
          }`}>
            {value}
          </span>
        );
      default:
        return value;
    }
  };

  return (
    <Card className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{title}</CardTitle>
          <div className="flex gap-2">
            {features?.export && (
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 mt-4">
          {features?.search && (
            <div className="relative">
              <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Search all columns..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          )}
          
          {features?.filtering && (
            <div className="flex flex-wrap gap-2">
              {columns.filter((col: any) => col.filterable).map((col: any) => (
                <Input
                  key={col.field}
                  placeholder={`Filter ${col.label}...`}
                  value={filterValues[col.field] || ''}
                  onChange={(e) => setFilterValues(prev => ({ ...prev, [col.field]: e.target.value }))}
                  className="w-40"
                />
              ))}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b dark:border-gray-700">
                {features?.selection && (
                  <th className="text-left py-3 px-4">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedRows(new Set(paginatedData.map((_: any, i: number) => i)));
                        } else {
                          setSelectedRows(new Set());
                        }
                      }}
                      className="rounded border-gray-300"
                    />
                  </th>
                )}
                {columns.map((col: any, i: number) => (
                  <th 
                    key={i} 
                    className={`text-left py-3 px-4 font-medium text-gray-700 dark:text-gray-300 ${
                      col.sortable && features?.sorting ? 'cursor-pointer hover:text-purple-600 dark:hover:text-purple-400' : ''
                    }`}
                    onClick={() => col.sortable && features?.sorting && handleSort(col.field)}
                  >
                    <div className="flex items-center gap-2">
                      {col.label}
                      {col.sortable && features?.sorting && (
                        <div className="flex flex-col">
                          {sortColumn === col.field ? (
                            sortDirection === 'asc' ? <SortAsc className="w-3 h-3" /> : <SortDesc className="w-3 h-3" />
                          ) : (
                            <ArrowUp className="w-3 h-3 opacity-50" />
                          )}
                        </div>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {paginatedData.map((row: any, i: number) => (
                <tr key={i} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
                  {features?.selection && (
                    <td className="py-3 px-4">
                      <input
                        type="checkbox"
                        checked={selectedRows.has(i)}
                        onChange={(e) => {
                          const newSelected = new Set(selectedRows);
                          if (e.target.checked) {
                            newSelected.add(i);
                          } else {
                            newSelected.delete(i);
                          }
                          setSelectedRows(newSelected);
                        }}
                        className="rounded border-gray-300"
                      />
                    </td>
                  )}
                  {columns.map((col: any, j: number) => (
                    <td key={j} className="py-3 px-4 text-gray-900 dark:text-gray-100">
                      {formatCellValue(row[col.field], col.type)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {features?.pagination && totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Showing {startIndex + 1} to {Math.min(startIndex + pageSize, filteredData.length)} of {filteredData.length} results
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <span className="px-3 py-1 text-sm">
                {currentPage} of {totalPages}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
        
        {/* Selection info */}
        {features?.selection && selectedRows.size > 0 && (
          <div className="mt-4 p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
            <p className="text-sm text-purple-700 dark:text-purple-300">
              {selectedRows.size} row{selectedRows.size !== 1 ? 's' : ''} selected
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Timeline Component
function TimelineComponent({ title, type = "vertical", events, showProgress }: any) {
  const completedEvents = events.filter((e: any) => e.status === 'completed').length;
  const progressPercentage = (completedEvents / events.length) * 100;

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="w-5 h-5 text-green-600" />;
      case 'in-progress': return <Circle className="w-5 h-5 text-blue-600" />;
      case 'pending': return <Circle className="w-5 h-5 text-gray-400" />;
      case 'cancelled': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Circle className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'border-green-600 bg-green-50 dark:bg-green-900/20';
      case 'in-progress': return 'border-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'pending': return 'border-gray-400 bg-gray-50 dark:bg-gray-700';
      case 'cancelled': return 'border-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'border-gray-400 bg-gray-50 dark:bg-gray-700';
    }
  };

  return (
    <Card className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Clock className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
        
        {showProgress && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Progress</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {completedEvents}/{events.length} completed
              </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-purple-600 to-purple-400 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {Math.round(progressPercentage)}% complete
            </p>
          </div>
        )}
      </CardHeader>
      
      <CardContent>
        <div className={type === "horizontal" ? "flex overflow-x-auto gap-6 pb-4" : "space-y-4"}>
          {events.map((event: any, i: number) => (
            <div 
              key={event.id}
              className={`
                animate-fade-in relative
                ${type === "horizontal" ? "flex-shrink-0 w-64" : ""}
              `}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              {type === "vertical" && i < events.length - 1 && (
                <div className="absolute left-6 top-12 w-0.5 h-16 bg-gray-300 dark:bg-gray-600" />
              )}
              
              <div className={`
                flex gap-4 p-4 rounded-lg border-2 transition-all duration-200 hover:scale-[1.02]
                ${getStatusColor(event.status)}
              `}>
                <div className="flex-shrink-0 mt-1">
                  {getStatusIcon(event.status)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100 truncate">
                    {event.title}
                  </h4>
                  {event.description && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      {event.description}
                    </p>
                  )}
                  <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                    {new Date(event.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Document Viewer Component
function DocumentViewer({ title, documentType, content, features, pages = [] }: any) {
  const [currentPage, setCurrentPage] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <Card className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <FileText className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            {features?.search && (
              <div className="relative">
                <Search className="absolute left-3 top-3 w-4 h-4 text-gray-400" />
                <Input
                  placeholder="Search document..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 w-40"
                />
              </div>
            )}
            {features?.fullscreen && (
              <Button variant="ghost" size="icon" onClick={() => setIsFullscreen(!isFullscreen)}>
                {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </Button>
            )}
            {features?.download && (
              <Button variant="ghost" size="icon">
                <Download className="w-4 h-4" />
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="flex gap-4">
          {/* Navigation sidebar for multi-page documents */}
          {pages.length > 0 && features?.navigation && (
            <div className="w-48 border-r dark:border-gray-700 pr-4">
              <h4 className="font-medium mb-3 text-gray-900 dark:text-gray-100">Contents</h4>
              <div className="space-y-1">
                {pages.map((page: any, i: number) => (
                  <button
                    key={page.id}
                    onClick={() => setCurrentPage(i)}
                    className={`w-full text-left p-2 text-sm rounded transition-colors ${
                      currentPage === i 
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400' 
                        : 'hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {page.title}
                  </button>
                ))}
              </div>
            </div>
          )}
          
          {/* Document content */}
          <div className="flex-1">
            <div className="bg-white dark:bg-gray-800 rounded-lg p-6 min-h-96 border dark:border-gray-700">
              {pages.length > 0 ? (
                <div>
                  <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-gray-100">
                    {pages[currentPage]?.title}
                  </h3>
                  <div className="prose dark:prose-invert max-w-none">
                    {pages[currentPage]?.content || content}
                  </div>
                </div>
              ) : (
                <div className="prose dark:prose-invert max-w-none">
                  {content || "Document content will appear here..."}
                </div>
              )}
            </div>
            
            {/* Page navigation */}
            {pages.length > 1 && (
              <div className="flex items-center justify-between mt-4">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(0, p - 1))}
                  disabled={currentPage === 0}
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Previous
                </Button>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  Page {currentPage + 1} of {pages.length}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(pages.length - 1, p + 1))}
                  disabled={currentPage === pages.length - 1}
                >
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Rich Text Editor Component
function RichTextEditor({ title, initialContent = "", features, placeholder, maxLength }: any) {
  const [content, setContent] = useState(initialContent);
  const [activeFormats, setActiveFormats] = useState<Set<string>>(new Set());

  const formatButtons = [
    { key: 'bold', icon: Bold, label: 'Bold' },
    { key: 'italic', icon: Italic, label: 'Italic' },
    { key: 'underline', icon: Underline, label: 'Underline' },
    { key: 'lists', icon: List, label: 'List' },
    { key: 'links', icon: Link, label: 'Link' },
    { key: 'images', icon: Image, label: 'Image' },
    { key: 'codeBlocks', icon: Code, label: 'Code' },
  ];

  return (
    <Card className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Edit3 className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm">
              <Eye className="w-4 h-4 mr-2" />
              Preview
            </Button>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Toolbar */}
        <div className="flex flex-wrap gap-1 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg mt-4">
          {features?.headings && (
            <Select defaultValue="p">
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="p">Paragraph</SelectItem>
                <SelectItem value="h1">Heading 1</SelectItem>
                <SelectItem value="h2">Heading 2</SelectItem>
                <SelectItem value="h3">Heading 3</SelectItem>
              </SelectContent>
            </Select>
          )}
          
          {formatButtons.map(({ key, icon: Icon, label }) => (
            features?.[key] && (
              <Button
                key={key}
                variant={activeFormats.has(key) ? "default" : "ghost"}
                size="sm"
                onClick={() => {
                  const newFormats = new Set(activeFormats);
                  if (newFormats.has(key)) {
                    newFormats.delete(key);
                  } else {
                    newFormats.add(key);
                  }
                  setActiveFormats(newFormats);
                }}
              >
                <Icon className="w-4 h-4" />
              </Button>
            )
          ))}
        </div>
      </CardHeader>
      
      <CardContent>
        <div className="border dark:border-gray-700 rounded-lg">
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder={placeholder || "Start writing..."}
            className="w-full h-64 p-4 border-none outline-none resize-none bg-transparent text-gray-900 dark:text-gray-100"
            maxLength={maxLength}
          />
        </div>
        
        <div className="flex justify-between items-center mt-4 text-sm text-gray-500 dark:text-gray-400">
          <div className="flex gap-4">
            <span>Words: {content.split(' ').filter(word => word).length}</span>
            <span>Characters: {content.length}</span>
            {maxLength && <span>Limit: {maxLength}</span>}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Copy className="w-4 h-4 mr-2" />
              Copy
            </Button>
            <Button size="sm">
              <Check className="w-4 h-4 mr-2" />
              Save
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Calendar Component
function CalendarComponent({ title, view = "month", events = [], features }: any) {
  const [currentView, setCurrentView] = useState(view);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<any>(null);

  const viewOptions = [
    { value: 'month', label: 'Month' },
    { value: 'week', label: 'Week' },
    { value: 'day', label: 'Day' },
    { value: 'agenda', label: 'Agenda' }
  ];

  const getEventsForDate = (date: Date) => {
    return events.filter((event: any) => {
      const eventDate = new Date(event.start);
      return eventDate.toDateString() === date.toDateString();
    });
  };

  const renderMonthView = () => {
    const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();
    
    const days = [];
    
    // Empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 dark:border-gray-700" />);
    }
    
    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dayEvents = getEventsForDate(date);
      
      days.push(
        <div key={day} className="h-24 border border-gray-200 dark:border-gray-700 p-1 overflow-hidden">
          <div className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">{day}</div>
          <div className="space-y-1">
            {dayEvents.slice(0, 2).map((event: any, i: number) => (
              <div
                key={event.id}
                className="text-xs p-1 rounded cursor-pointer truncate"
                style={{ backgroundColor: event.color || '#9333ea', color: 'white' }}
                onClick={() => setSelectedEvent(event)}
              >
                {event.title}
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                +{dayEvents.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-7 gap-0">
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-medium text-gray-500 dark:text-gray-400 border-b dark:border-gray-700">
            {day}
          </div>
        ))}
        {days}
      </div>
    );
  };

  return (
    <Card className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Calendar className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <div className="flex gap-2">
            {features?.addEvents && (
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4 mr-2" />
                Add Event
              </Button>
            )}
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>
        
        {/* Calendar controls */}
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 min-w-48 text-center">
              {currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentDate(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
          
          <Select value={currentView} onValueChange={setCurrentView}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {viewOptions.map(option => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      
      <CardContent>
        {currentView === 'month' && renderMonthView()}
        {currentView === 'agenda' && (
          <div className="space-y-2">
            {events.map((event: any) => (
              <div
                key={event.id}
                className="flex items-center gap-3 p-3 border dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 cursor-pointer"
                onClick={() => setSelectedEvent(event)}
              >
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: event.color || '#9333ea' }}
                />
                <div className="flex-1">
                  <h4 className="font-medium text-gray-900 dark:text-gray-100">{event.title}</h4>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date(event.start).toLocaleDateString()} {event.allDay ? '' : `at ${new Date(event.start).toLocaleTimeString()}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// File Upload Component
function FileUploadComponent({ title, acceptedTypes = [], maxFileSize, maxFiles, features, uploadUrl, placeholder }: any) {
  const [files, setFiles] = useState<File[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<Record<string, number>>({});

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files);
    handleFiles(droppedFiles);
  };

  const handleFiles = (newFiles: File[]) => {
    let validFiles = newFiles;
    
    // Filter by accepted types
    if (acceptedTypes.length > 0) {
      validFiles = validFiles.filter(file => 
        acceptedTypes.some(type => file.type.includes(type) || file.name.endsWith(type))
      );
    }
    
    // Filter by file size
    if (maxFileSize) {
      validFiles = validFiles.filter(file => file.size <= maxFileSize * 1024 * 1024);
    }
    
    // Limit number of files
    if (maxFiles) {
      validFiles = validFiles.slice(0, maxFiles - files.length);
    }
    
    setFiles(prev => [...prev, ...validFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Card className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Upload className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        {/* Upload area */}
        <div
          className={`
            border-2 border-dashed rounded-lg p-8 text-center transition-all duration-200
            ${isDragging 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
            }
          `}
          onDrop={handleDrop}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
        >
          <Upload className="w-12 h-12 mx-auto mb-4 text-gray-400" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
            {placeholder || "Upload files"}
          </h3>
          <p className="text-gray-500 dark:text-gray-400 mb-4">
            {features?.dragDrop ? "Drag and drop files here, or " : ""}
            <button className="text-purple-600 hover:text-purple-700 dark:text-purple-400 font-medium">
              browse
            </button>
          </p>
          <div className="text-sm text-gray-400 space-y-1">
            {acceptedTypes.length > 0 && (
              <p>Accepted types: {acceptedTypes.join(', ')}</p>
            )}
            {maxFileSize && <p>Max file size: {maxFileSize}MB</p>}
            {maxFiles && <p>Max files: {maxFiles}</p>}
          </div>
        </div>
        
        {/* File list */}
        {files.length > 0 && (
          <div className="mt-6 space-y-3">
            <h4 className="font-medium text-gray-900 dark:text-gray-100">Uploaded Files</h4>
            {files.map((file, index) => (
              <div key={index} className="flex items-center gap-3 p-3 border dark:border-gray-700 rounded-lg">
                {features?.thumbnails && file.type.startsWith('image/') && (
                  <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded overflow-hidden">
                    <img
                      src={URL.createObjectURL(file)}
                      alt={file.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                    {file.name}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {formatFileSize(file.size)}
                  </p>
                  
                  {features?.progress && uploadProgress[file.name] !== undefined && (
                    <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
                      <div
                        className="bg-purple-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress[file.name]}%` }}
                      />
                    </div>
                  )}
                </div>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            ))}
            
            <Button className="w-full" disabled={files.length === 0}>
              <Upload className="w-4 h-4 mr-2" />
              Upload {files.length} file{files.length !== 1 ? 's' : ''}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Settings Panel Component  
function SettingsPanel({ title, sections, layout = "tabs" }: any) {
  const [activeSection, setActiveSection] = useState(sections[0]?.id);
  const [settings, setSettings] = useState<Record<string, any>>({});

  const updateSetting = (settingId: string, value: any) => {
    setSettings(prev => ({ ...prev, [settingId]: value }));
  };

  const renderSetting = (setting: any) => {
    const currentValue = settings[setting.id] ?? setting.value;

    switch (setting.type) {
      case 'toggle':
        return (
          <div className="flex items-center justify-between">
            <div>
              <label className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {setting.label}
              </label>
              {setting.description && (
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {setting.description}
                </p>
              )}
            </div>
            <button
              onClick={() => updateSetting(setting.id, !currentValue)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                currentValue ? 'bg-purple-600' : 'bg-gray-200 dark:bg-gray-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  currentValue ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        );

      case 'select':
        return (
          <div>
            <Label htmlFor={setting.id}>{setting.label}</Label>
            {setting.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                {setting.description}
              </p>
            )}
            <Select value={currentValue} onValueChange={(value) => updateSetting(setting.id, value)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {setting.options?.map((option: string) => (
                  <SelectItem key={option} value={option}>
                    {option}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );

      case 'input':
        return (
          <div>
            <Label htmlFor={setting.id}>{setting.label}</Label>
            {setting.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                {setting.description}
              </p>
            )}
            <Input
              id={setting.id}
              value={currentValue || ''}
              onChange={(e) => updateSetting(setting.id, e.target.value)}
            />
          </div>
        );

      case 'slider':
        return (
          <div>
            <div className="flex justify-between items-center mb-2">
              <Label htmlFor={setting.id}>{setting.label}</Label>
              <span className="text-sm text-gray-500 dark:text-gray-400">{currentValue}</span>
            </div>
            {setting.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                {setting.description}
              </p>
            )}
            <input
              type="range"
              id={setting.id}
              min={setting.min || 0}
              max={setting.max || 100}
              value={currentValue || setting.min || 0}
              onChange={(e) => updateSetting(setting.id, parseInt(e.target.value))}
              className="w-full"
            />
          </div>
        );

      case 'color':
        return (
          <div>
            <Label htmlFor={setting.id}>{setting.label}</Label>
            {setting.description && (
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 mb-2">
                {setting.description}
              </p>
            )}
            <div className="flex items-center gap-2">
              <input
                type="color"
                id={setting.id}
                value={currentValue || '#9333ea'}
                onChange={(e) => updateSetting(setting.id, e.target.value)}
                className="w-12 h-8 rounded border dark:border-gray-600"
              />
              <Input
                value={currentValue || '#9333ea'}
                onChange={(e) => updateSetting(setting.id, e.target.value)}
                className="flex-1"
              />
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  const activeSection_data = sections.find((s: any) => s.id === activeSection);

  return (
    <Card className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
              <Settings className="w-6 h-6" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          <Button variant="ghost" size="icon">
            <MoreVertical className="w-4 h-4" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent>
        <div className={layout === "tabs" ? "flex flex-col" : "flex gap-6"}>
          {/* Section navigation */}
          <div className={layout === "tabs" ? "flex border-b dark:border-gray-700 mb-6" : "w-48"}>
            {sections.map((section: any) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  px-4 py-2 text-sm font-medium transition-colors
                  ${layout === "tabs" 
                    ? (activeSection === section.id 
                        ? 'border-b-2 border-purple-600 text-purple-600 dark:text-purple-400' 
                        : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300')
                    : (activeSection === section.id
                        ? 'bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 rounded-lg'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg')
                  }
                `}
              >
                {section.title}
              </button>
            ))}
          </div>
          
          {/* Settings content */}
          <div className="flex-1">
            {activeSection_data && (
              <div>
                <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">
                  {activeSection_data.title}
                </h3>
                {activeSection_data.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-6">
                    {activeSection_data.description}
                  </p>
                )}
                
                <div className="space-y-6">
                  {activeSection_data.settings.map((setting: any) => (
                    <div key={setting.id} className="animate-fade-in">
                      {renderSetting(setting)}
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            <div className="flex justify-end gap-2 mt-8 pt-6 border-t dark:border-gray-700">
              <Button variant="outline">Reset</Button>
              <Button>Save Changes</Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Analytics Dashboard Component
function AnalyticsDashboard({ title, timeRange, metrics, charts, features }: any) {
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange);
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set(metrics.map((m: any) => m.id)));

  const timeRangeOptions = [
    { value: 'today', label: 'Today' },
    { value: 'week', label: 'This Week' },
    { value: 'month', label: 'This Month' },
    { value: 'quarter', label: 'This Quarter' },
    { value: 'year', label: 'This Year' },
    { value: 'custom', label: 'Custom' }
  ];

  const getChartSize = (size: string) => {
    switch (size) {
      case 'small': return 'col-span-1';
      case 'medium': return 'col-span-2';
      case 'large': return 'col-span-3';
      case 'full': return 'col-span-4';
      default: return 'col-span-2';
    }
  };

  return (
    <div className="space-y-6 animate-slide-up">
      {/* Header */}
      <Card className="hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                <BarChart3 className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">{title}</CardTitle>
            </div>
            <div className="flex gap-2">
              {features?.filters && (
                <Button variant="ghost" size="sm">
                  <Filter className="w-4 h-4 mr-2" />
                  Filters
                </Button>
              )}
              {features?.export && (
                <Button variant="ghost" size="sm">
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </Button>
              )}
              <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeRangeOptions.map(option => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {metrics.map((metric: any, i: number) => (
          <Card key={metric.id} className="animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 hover:scale-[1.02] transform"
                style={{ animationDelay: `${i * 0.1}s` }}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <p className="text-sm text-muted-foreground mb-1">{metric.title}</p>
                  <p className="text-3xl font-bold animate-count-up">{metric.value}</p>
                  {metric.change && (
                    <div className={`flex items-center gap-1 mt-2 ${
                      metric.trend === 'up' ? 'text-green-600 dark:text-green-400' :
                      metric.trend === 'down' ? 'text-red-600 dark:text-red-400' :
                      'text-gray-600 dark:text-gray-400'
                    }`}>
                      {metric.trend === 'up' && <TrendingUp className="w-4 h-4" />}
                      {metric.trend === 'down' && <TrendingUp className="w-4 h-4 rotate-180" />}
                      <span className="text-sm font-medium">{metric.change}</span>
                    </div>
                  )}
                </div>
                {metric.icon && (
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
                    {metric.icon === 'revenue' && <DollarSign className="w-6 h-6" />}
                    {metric.icon === 'users' && <Users className="w-6 h-6" />}
                    {metric.icon === 'activity' && <Activity className="w-6 h-6" />}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {charts.map((chart: any, i: number) => (
          <Card key={chart.id} className={`animate-slide-up hover:shadow-2xl dark:hover:shadow-purple-500/10 transition-all duration-300 ${getChartSize(chart.size)}`}
                style={{ animationDelay: `${(metrics.length + i) * 0.1}s` }}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{chart.title}</CardTitle>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="w-4 h-4" />
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <DynamicVisualization 
                type={chart.type}
                title=""
                data={chart.data}
                config={{}}
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Real-time indicator */}
      {features?.realTime && (
        <div className="flex items-center justify-center p-4">
          <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            Live data - updates every 30 seconds
          </div>
        </div>
      )}
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
    case "generateDataTable":
      return <AdvancedDataTable {...component.props} />;
    case "generateTimeline":
      return <TimelineComponent {...component.props} />;
    case "generateDocumentViewer":
      return <DocumentViewer {...component.props} />;
    case "generateRichTextEditor":
      return <RichTextEditor {...component.props} />;
    case "generateCalendar":
      return <CalendarComponent {...component.props} />;
    case "generateFileUpload":
      return <FileUploadComponent {...component.props} />;
    case "generateSettingsPanel":
      return <SettingsPanel {...component.props} />;
    case "generateAnalyticsDashboard":
      return <AnalyticsDashboard {...component.props} />;
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
    <div className={`min-h-screen bg-background text-foreground flex animate-page-enter ${isDarkMode ? 'dark' : ''}`}>
      {/* Main Content Area - Left Side */}
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-gray-950 animate-slide-in-left">
        {/* Header with theme toggle */}
        <header className="bg-white dark:bg-gray-900 border-b dark:border-gray-800 animate-slide-in-top">
          <div className="px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent animate-fade-in">
                  AG UI Dynamic Interface
                </h1>
                <div className="flex items-center gap-2 animate-fade-in stagger-2">
                  <div className={`w-2 h-2 rounded-full ${isConnected ? "bg-green-500 animate-glow" : "bg-red-500"} animate-pulse`} />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2 animate-fade-in stagger-3">
                <Button 
                  variant="ghost"
                  size="icon"
                  onClick={() => {
                    setIsDarkMode(!isDarkMode);
                    // Add theme toggle animation
                    const button = event?.currentTarget;
                    if (button) {
                      button.classList.add('animate-theme-toggle');
                      setTimeout(() => button.classList.remove('animate-theme-toggle'), 500);
                    }
                  }}
                  className="hover-lift transition-all duration-300"
                >
                  {isDarkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                </Button>
                <Button variant="ghost" size="icon" className="hover-lift transition-all duration-300">
                  <Settings className="w-5 h-5" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content with padding */}
        <main className="flex-1 overflow-y-auto p-6">
          {components.length === 0 ? (
            <div className="flex flex-col items-center justify-center min-h-full text-center">
              <div className="mb-8 animate-slide-in-bottom">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-500 to-blue-600 rounded-full flex items-center justify-center animate-glow">
                  <Activity className="w-12 h-12 text-white animate-bounce-slow" />
                </div>
              </div>
              <h2 className="text-2xl font-semibold mb-4 dark:text-white animate-slide-in-bottom stagger-2">Welcome to AG UI</h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8 animate-slide-in-bottom stagger-3">
                Start a conversation in the chat panel and watch as the interface dynamically generates 
                components based on our discussion. Try asking for charts, dashboards, forms, or tables!
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {components.map((component, index) => (
                <div key={component.id} className="animate-component-materialize hover-lift" style={{ animationDelay: `${index * 0.2}s` }}>
                  <ComponentRenderer component={component} />
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* Chat Sidebar - Right Side */}
      <div className="w-96 bg-white dark:bg-gray-900 border-l dark:border-gray-800 flex flex-col animate-slide-in-right">
        <div className="p-4 border-b dark:border-gray-800 flex items-center justify-between animate-slide-in-top stagger-2">
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
            <div className="text-center text-gray-500 dark:text-gray-400 mt-8 animate-fade-in">
              <p>Start a conversation to generate UI components</p>
            </div>
          ) : (
            messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-message-slide-in`} style={{ animationDelay: `${i * 0.1}s` }}>
                <div className={`max-w-[80%] rounded-lg p-3 hover-lift transition-all duration-300 ${
                  msg.role === 'user' 
                    ? 'bg-purple-600 text-white hover-glow' 
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
        <div className="p-4 border-t dark:border-gray-800 bg-white dark:bg-gray-900 animate-slide-in-bottom stagger-4">
          <div className="flex gap-2">
            <Input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask me to create UI components..."
              disabled={!isConnected || isLoading}
              className="flex-1 focus-ring transition-all duration-300"
            />
            <Button
              onClick={(e) => {
                sendMessage();
                // Add button press animation
                e.currentTarget.classList.add('animate-button-press');
                setTimeout(() => e.currentTarget.classList.remove('animate-button-press'), 150);
              }}
              disabled={!isConnected || isLoading || !input.trim()}
              size="icon"
              className="hover-lift focus-ring transition-all duration-300"
            >
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}