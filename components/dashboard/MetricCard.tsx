"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowUpIcon, ArrowDownIcon, EyeIcon, EyeOffIcon, Sparkles } from "lucide-react";
import { MetricConfig } from "@/types/dashboard";
import { useDashboard } from "@/contexts/DashboardContext";
import { useCopilotAction, useCopilotReadable } from "@copilotkit/react-core";

interface MetricCardProps {
  metric: MetricConfig;
}

export function MetricCard({ metric }: MetricCardProps) {
  const { updateMetric, toggleMetricVisibility, removeMetric } = useDashboard();

  const TrendIcon = metric.trend === "up" ? ArrowUpIcon : ArrowDownIcon;
  const trendColor = metric.trend === "up" ? "text-green-600" : "text-red-600";

  // Make metric data readable by CopilotKit
  useCopilotReadable({
    description: `Metric: ${metric.title}`,
    value: {
      title: metric.title,
      value: metric.value,
      change: metric.change,
      trend: metric.trend,
      visible: metric.visible,
      color: metric.color
    }
  });

  // Add CopilotKit actions for AI-powered metric suggestions
  useCopilotAction({
    name: `suggestMetricValue_${metric.id}`,
    description: `Suggest realistic values for ${metric.title} metric`,
    parameters: [
      {
        name: "industry",
        type: "string",
        description: "Industry context (e.g., SaaS, e-commerce, finance)",
        required: false
      }
    ],
    handler: async ({ industry }) => {
      // Generate realistic values based on metric type
      let suggestedValue = metric.value;
      let suggestedChange = metric.change;
      
      if (metric.title.toLowerCase().includes('revenue')) {
        suggestedValue = '$1,234,560';
        suggestedChange = 15.3;
      } else if (metric.title.toLowerCase().includes('users')) {
        suggestedValue = '12,483';
        suggestedChange = 8.7;
      } else if (metric.title.toLowerCase().includes('orders')) {
        suggestedValue = '3,421';
        suggestedChange = -2.1;
      }
      
      updateMetric(metric.id, { 
        value: suggestedValue, 
        change: suggestedChange,
        trend: suggestedChange > 0 ? 'up' : 'down'
      });
      
      return `Updated ${metric.title} to ${suggestedValue} with ${suggestedChange}% change`;
    }
  });

  return (
    <Card className={`transition-all duration-300 hover:shadow-lg ${
      !metric.visible ? "opacity-50" : ""
    }`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{metric.title}</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => toggleMetricVisibility(metric.id)}
            className="h-6 w-6 p-0"
          >
            {metric.visible ? (
              <EyeIcon className="h-3 w-3" />
            ) : (
              <EyeOffIcon className="h-3 w-3" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeMetric(metric.id)}
            className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
          >
            ×
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{metric.value}</div>
        <div className={`flex items-center text-xs ${trendColor}`}>
          <TrendIcon className="mr-1 h-3 w-3" />
          {Math.abs(metric.change)}%
        </div>
        
        {/* AI-Enhanced Interactive controls for real-time editing */}
        <div className="mt-2 space-y-1">
          <div className="relative">
            <input
              type="text"
              value={metric.value.toString()}
              onChange={(e) => updateMetric(metric.id, { value: e.target.value })}
              className="w-full text-xs p-1 pr-6 border rounded bg-transparent transition-colors hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800"
              placeholder="Update value (AI-enhanced)"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {}}
              className="absolute right-0 top-0 h-6 w-6 p-0 text-purple-500 hover:text-purple-600"
              title="Get AI suggestions for metric value"
            >
              <Sparkles className="h-2 w-2" />
            </Button>
          </div>
          <div className="flex gap-1">
            <div className="relative flex-1">
              <select
                value={metric.trend}
                onChange={(e) => updateMetric(metric.id, { trend: e.target.value as "up" | "down" | "neutral" })}
                className="w-full text-xs p-1 pr-6 border rounded bg-transparent transition-colors hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800 appearance-none"
              >
                <option value="up">Up ↗</option>
                <option value="down">Down ↘</option>
                <option value="neutral">Neutral →</option>
              </select>
              <Sparkles className="absolute right-1 top-1.5 h-2 w-2 text-purple-400 pointer-events-none" />
            </div>
            <div className="relative">
              <input
                type="number"
                value={metric.change}
                onChange={(e) => updateMetric(metric.id, { change: parseFloat(e.target.value) || 0 })}
                className="w-16 text-xs p-1 pr-5 border rounded bg-transparent transition-colors hover:border-purple-400 focus:border-purple-500 focus:ring-1 focus:ring-purple-200 dark:focus:ring-purple-800"
                placeholder="Change %"
                step="0.1"
              />
              <Sparkles className="absolute right-1 top-1.5 h-2 w-2 text-purple-400 pointer-events-none" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}