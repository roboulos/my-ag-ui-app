"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";
import { 
  LayoutGrid, 
  List, 
  Kanban, 
  CreditCard, 
  Plus, 
  RotateCcw,
  Settings2,
  Sun,
  Moon,
  Eye,
  Sparkles
} from "lucide-react";
import { LayoutType, ThemeType } from "@/types/dashboard";
import { useDashboard } from "@/contexts/DashboardContext";
import { useState } from "react";

export function DashboardControls() {
  const {
    layout,
    theme,
    sidebarOpen,
    gridColumns,
    title,
    description,
    metrics,
    charts,
    filters,
    setLayout,
    setTheme,
    setSidebarOpen,
    setGridColumns,
    setTitle,
    setDescription,
    addMetric,
    addChart,
    resetDashboard,
    refresh
  } = useDashboard();

  // Make dashboard state readable by CopilotKit
  useCopilotReadable({
    description: "Dashboard configuration and current state",
    value: {
      title,
      description,
      layout,
      theme,
      gridColumns,
      metricsCount: metrics.length,
      chartsCount: charts.length,
      visibleMetrics: metrics.filter(m => m.visible).length,
      visibleCharts: charts.filter(c => c.visible).length,
      activeFilters: filters.filter(f => f.active).length
    }
  });

  // Add CopilotKit actions for AI-powered form assistance
  useCopilotAction({
    name: "suggestDashboardTitle",
    description: "Suggest a professional dashboard title based on current metrics and layout",
    parameters: [
      {
        name: "context",
        type: "string",
        description: "Additional context about the dashboard purpose",
        required: false
      }
    ],
    handler: async ({ context }) => {
      const suggestions = [
        "Executive Analytics Dashboard",
        "Business Performance Insights",
        "Real-time KPI Monitor",
        "Analytics Command Center",
        "Performance Intelligence Hub"
      ];
      
      // Use the first suggestion as an example
      const suggestion = suggestions[0];
      setTitle(suggestion);
      
      return `Set dashboard title to: "${suggestion}". You can ask me to suggest different titles or modify this one.`;
    }
  });

  useCopilotAction({
    name: "suggestDashboardDescription",
    description: "Generate a professional description for the dashboard based on current setup",
    parameters: [
      {
        name: "focus",
        type: "string",
        description: "What aspect to focus on (performance, analytics, monitoring, etc.)",
        required: false
      }
    ],
    handler: async ({ focus }) => {
      const description = `Comprehensive ${focus || 'business'} analytics with ${metrics.filter(m => m.visible).length} key metrics and ${charts.filter(c => c.visible).length} visualization${charts.filter(c => c.visible).length !== 1 ? 's' : ''} in ${layout} layout`;
      setDescription(description);
      
      return `Updated dashboard description to: "${description}"`;
    }
  });

  useCopilotAction({
    name: "optimizeDashboardLayout",
    description: "Suggest optimal dashboard layout and settings based on current content",
    parameters: [],
    handler: async () => {
      const metricsCount = metrics.filter(m => m.visible).length;
      const chartsCount = charts.filter(c => c.visible).length;
      
      let suggestedLayout: LayoutType = "grid";
      let suggestedColumns = 12;
      
      if (metricsCount <= 3 && chartsCount <= 2) {
        suggestedLayout = "cards";
        suggestedColumns = 8;
      } else if (chartsCount > 4) {
        suggestedLayout = "grid";
        suggestedColumns = 12;
      }
      
      setLayout(suggestedLayout);
      setGridColumns(suggestedColumns);
      
      return `Optimized dashboard: Set layout to ${suggestedLayout} with ${suggestedColumns} columns for best viewing of ${metricsCount} metrics and ${chartsCount} charts.`;
    }
  });

  const layoutOptions: { value: LayoutType; icon: any; label: string }[] = [
    { value: "grid", icon: LayoutGrid, label: "Grid" },
    { value: "list", icon: List, label: "List" },
    { value: "kanban", icon: Kanban, label: "Kanban" },
    { value: "cards", icon: CreditCard, label: "Cards" }
  ];

  const handleAddMetric = () => {
    addMetric({
      title: "New Metric",
      value: "0",
      change: 0,
      trend: "neutral",
      icon: "TrendingUp",
      visible: true,
      color: "purple"
    });
  };

  const handleAddChart = () => {
    addChart({
      title: "New Chart",
      type: "line",
      data: [
        { name: "A", value: 100 },
        { name: "B", value: 200 },
        { name: "C", value: 150 }
      ],
      visible: true,
      width: 6,
      height: 300,
      config: { color: "purple" }
    });
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings2 className="h-5 w-5" />
          Dashboard Controls
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Title and Description with AI Assistance */}
        <div className="space-y-3">
          <div>
            <Label htmlFor="title" className="flex items-center gap-2">
              Dashboard Title
              <Sparkles className="h-3 w-3 text-purple-500" title="AI-enhanced input" />
            </Label>
            <div className="relative">
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full mt-1 p-2 pr-10 border rounded-md bg-transparent transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Enter dashboard title (ask AI for suggestions in chat)"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // This will be handled by CopilotKit actions
                }}
                className="absolute right-1 top-1.5 h-7 w-7 p-0 text-purple-500 hover:text-purple-600"
                title="Get AI suggestions for title"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            </div>
          </div>
          
          <div>
            <Label htmlFor="description" className="flex items-center gap-2">
              Description
              <Sparkles className="h-3 w-3 text-purple-500" title="AI-enhanced input" />
            </Label>
            <div className="relative">
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full mt-1 p-2 pr-10 border rounded-md bg-transparent h-20 resize-none transition-all duration-200 hover:border-purple-400 focus:border-purple-500 focus:ring-2 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Enter dashboard description (ask AI for suggestions in chat)"
              />
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  // This will be handled by CopilotKit actions
                }}
                className="absolute right-1 top-1.5 h-7 w-7 p-0 text-purple-500 hover:text-purple-600"
                title="Get AI suggestions for description"
              >
                <Sparkles className="h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Layout Controls */}
        <div className="space-y-3">
          <Label>Layout</Label>
          <div className="flex gap-2">
            {layoutOptions.map(({ value, icon: Icon, label }) => (
              <Button
                key={value}
                variant={layout === value ? "default" : "outline"}
                size="sm"
                onClick={() => setLayout(value)}
                className="flex items-center gap-2"
              >
                <Icon className="h-4 w-4" />
                {label}
              </Button>
            ))}
          </div>
        </div>

        {/* Theme and Settings */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-3">
            <Label>Theme</Label>
            <div className="flex gap-2">
              <Button
                variant={theme === "light" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("light")}
                className="flex items-center gap-2"
              >
                <Sun className="h-4 w-4" />
                Light
              </Button>
              <Button
                variant={theme === "dark" ? "default" : "outline"}
                size="sm"
                onClick={() => setTheme("dark")}
                className="flex items-center gap-2"
              >
                <Moon className="h-4 w-4" />
                Dark
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <Label htmlFor="grid-columns">Grid Columns</Label>
            <input
              id="grid-columns"
              type="range"
              min="6"
              max="12"
              value={gridColumns}
              onChange={(e) => setGridColumns(parseInt(e.target.value))}
              className="w-full"
            />
            <div className="text-sm text-gray-500 text-center">{gridColumns} columns</div>
          </div>
        </div>

        {/* Toggle Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Switch
              id="sidebar"
              checked={sidebarOpen}
              onCheckedChange={setSidebarOpen}
            />
            <Label htmlFor="sidebar">Show Sidebar</Label>
          </div>
          
          <div className="text-sm text-gray-500">
            {metrics.filter(m => m.visible).length}/{metrics.length} metrics, {" "}
            {charts.filter(c => c.visible).length}/{charts.length} charts, {" "}
            {filters.filter(f => f.active).length} active filters
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-2 pt-4 border-t">
          <Button onClick={handleAddMetric} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Metric
          </Button>
          
          <Button onClick={handleAddChart} size="sm" className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Chart
          </Button>
          
          <div className="flex-1" />
          
          <Button onClick={refresh} variant="outline" size="sm">
            <RotateCcw className="h-4 w-4" />
          </Button>
          
          <Button 
            onClick={resetDashboard} 
            variant="destructive" 
            size="sm"
            className="flex items-center gap-2"
          >
            Reset Dashboard
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}