"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { EyeIcon, EyeOffIcon, BarChart, LineChart, PieChart, Sparkles } from "lucide-react";
import { ChartConfig, ChartType } from "@/types/dashboard";
import { useDashboard } from "@/contexts/DashboardContext";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

interface ChartCardProps {
  chart: ChartConfig;
}

export function ChartCard({ chart }: ChartCardProps) {
  const { updateChart, toggleChartVisibility, removeChart, resizeChart } = useDashboard();

  const ChartIcon = {
    line: LineChart,
    bar: BarChart,
    pie: PieChart,
    area: LineChart,
    scatter: BarChart
  }[chart.type];

  // Make chart data readable by CopilotKit
  useCopilotReadable({
    description: `Chart: ${chart.title}`,
    value: {
      title: chart.title,
      type: chart.type,
      width: chart.width,
      height: chart.height,
      dataPoints: chart.data.length,
      visible: chart.visible,
      color: chart.config.color
    }
  });

  // Add CopilotKit actions for AI-powered chart suggestions
  useCopilotAction({
    name: `optimizeChart_${chart.id}`,
    description: `Optimize chart settings for ${chart.title}`,
    parameters: [
      {
        name: "purpose",
        type: "string",
        description: "What the chart should emphasize (trends, comparisons, distributions, etc.)",
        required: false
      }
    ],
    handler: async ({ purpose }) => {
      let suggestedType: ChartType = chart.type;
      let suggestedWidth = chart.width;
      let suggestedHeight = chart.height;
      
      // AI logic for chart optimization
      if (purpose?.toLowerCase().includes('trend')) {
        suggestedType = 'line';
        suggestedHeight = 350;
      } else if (purpose?.toLowerCase().includes('comparison')) {
        suggestedType = 'bar';
        suggestedWidth = 8;
      } else if (purpose?.toLowerCase().includes('distribution')) {
        suggestedType = 'pie';
        suggestedWidth = 6;
      }
      
      updateChart(chart.id, { type: suggestedType });
      resizeChart(chart.id, suggestedWidth, suggestedHeight);
      
      return `Optimized ${chart.title}: Changed to ${suggestedType} chart with ${suggestedWidth}x${suggestedHeight} dimensions for ${purpose || 'better visualization'}`;
    }
  });

  return (
    <Card 
      className={`transition-all duration-300 hover:shadow-lg ${
        !chart.visible ? "opacity-50" : ""
      }`}
      style={{ gridColumn: `span ${chart.width}` }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <ChartIcon className="h-4 w-4" />
          {chart.title}
        </CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleChartVisibility(chart.id)}
            className="h-6 w-6 p-0"
          >
            {chart.visible ? (
              <EyeIcon className="h-3 w-3" />
            ) : (
              <EyeOffIcon className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeChart(chart.id)}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {/* Mock chart visualization */}
        <div 
          className="bg-gradient-to-r from-purple-500 to-blue-500 rounded-lg flex items-center justify-center text-white font-semibold"
          style={{ height: `${chart.height}px` }}
        >
          <div className="text-center">
            <ChartIcon className="h-8 w-8 mx-auto mb-2" />
            <div className="text-sm">{chart.type.toUpperCase()} CHART</div>
            <div className="text-xs opacity-75">{chart.data.length} data points</div>
          </div>
        </div>
        
        {/* AI-Enhanced Interactive controls for real-time editing */}
        <div className="mt-3 space-y-2">
          <div className="relative">
            <input
              type="text"
              value={chart.title}
              onChange={(e) => updateChart(chart.id, { title: e.target.value })}
              className="w-full text-xs p-1 pr-6 border rounded bg-transparent transition-colors hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800"
              placeholder="Chart title (AI-enhanced)"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="absolute right-0 top-0 h-6 w-6 p-0 text-purple-500 hover:text-purple-600"
              title="Get AI suggestions for chart title"
            >
              <Sparkles className="h-2 w-2" />
            </Button>
          </div>
          
          <div className="flex gap-2">
            <div className="relative flex-1">
              <select
                value={chart.type}
                onChange={(e) => updateChart(chart.id, { type: e.target.value as ChartType })}
                className="w-full text-xs p-1 pr-6 border rounded bg-transparent transition-colors hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800 appearance-none"
              >
                <option value="line">Line Chart</option>
                <option value="bar">Bar Chart</option>
                <option value="pie">Pie Chart</option>
                <option value="area">Area Chart</option>
                <option value="scatter">Scatter Plot</option>
              </select>
              <Sparkles className="absolute right-1 top-1.5 h-2 w-2 text-purple-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <input
                type="number"
                value={chart.width}
                onChange={(e) => resizeChart(chart.id, parseInt(e.target.value) || 4, chart.height)}
                className="w-16 text-xs p-1 pr-5 border rounded bg-transparent transition-colors hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Width"
                min="1"
                max="12"
              />
              <Sparkles className="absolute right-1 top-1.5 h-2 w-2 text-purple-400 pointer-events-none" />
            </div>
          </div>
          
          <div className="flex gap-2">
            <div className="relative">
              <input
                type="number"
                value={chart.height}
                onChange={(e) => resizeChart(chart.id, chart.width, parseInt(e.target.value) || 300)}
                className="w-20 text-xs p-1 pr-5 border rounded bg-transparent transition-colors hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Height"
                min="200"
                max="600"
                step="50"
              />
              <Sparkles className="absolute right-1 top-1.5 h-2 w-2 text-purple-400 pointer-events-none" />
            </div>
            
            <div className="relative">
              <input
                type="color"
                value={chart.config.color === "purple" ? "#9333ea" : "#3b82f6"}
                onChange={(e) => updateChart(chart.id, { 
                  config: { ...chart.config, color: e.target.value === "#9333ea" ? "purple" : "blue" }
                })}
                className="w-8 h-6 border rounded bg-transparent transition-colors hover:border-purple-400 focus:border-purple-500"
                title="AI can suggest optimal colors"
              />
              <Sparkles className="absolute right-0.5 top-1 h-2 w-2 text-purple-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}