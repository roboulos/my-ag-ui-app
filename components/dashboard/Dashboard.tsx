"use client";

import { useDashboard } from "@/contexts/DashboardContext";
import { DashboardControls } from "./DashboardControls";
import { MetricCard } from "./MetricCard";
import { ChartCard } from "./ChartCard";
import { componentFactory } from "@/lib/ComponentFactory";
import { enhancedComponentFactory } from "@/lib/EnhancedComponentFactory";

export function Dashboard() {
  const {
    layout,
    theme,
    gridColumns,
    metrics,
    charts,
    title,
    description,
    lastUpdated,
    sidebarOpen,
    dynamicComponents
  } = useDashboard();

  const visibleMetrics = metrics.filter(m => m.visible);
  const visibleCharts = charts.filter(c => c.visible);

  const getLayoutClasses = () => {
    switch (layout) {
      case "grid":
        return `grid gap-6` + ` grid-cols-${Math.min(gridColumns, 12)}`;
      case "list":
        return "space-y-4";
      case "cards":
        return "grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3";
      case "kanban":
        return "flex gap-6 overflow-x-auto";
      default:
        return "grid gap-6 grid-cols-12";
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-300 ${
      theme === "dark" ? "dark bg-gray-950" : "bg-gray-50"
    }`}>
      <div className="p-6 max-w-7xl mx-auto">
        {/* Dashboard Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              {title}
            </h1>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Last updated: {lastUpdated.toLocaleTimeString()}
            </div>
          </div>
          <p className="text-gray-600 dark:text-gray-400">{description}</p>
          
          {/* State Summary for Debugging */}
          <div className="mt-2 p-2 bg-blue-50 dark:bg-blue-950/20 rounded-lg text-xs text-blue-800 dark:text-blue-200">
            Layout: {layout} | Theme: {theme} | Columns: {gridColumns} | 
            Metrics: {visibleMetrics.length}/{metrics.length} | 
            Charts: {visibleCharts.length}/{charts.length}
          </div>
        </div>

        {/* Dashboard Controls */}
        <DashboardControls />

        {/* Metrics Section */}
        {visibleMetrics.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Key Metrics</h2>
            <div className={layout === "list" ? "space-y-4" : "grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"}>
              {visibleMetrics.map((metric) => (
                <MetricCard key={metric.id} metric={metric} />
              ))}
            </div>
          </div>
        )}

        {/* Charts Section */}
        {visibleCharts.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">Analytics</h2>
            <div className={getLayoutClasses()}>
              {visibleCharts.map((chart) => (
                <ChartCard key={chart.id} chart={chart} />
              ))}
            </div>
          </div>
        )}

        {/* Dynamic Components Section */}
        {dynamicComponents.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-4 dark:text-white">
              Dynamic Components
              <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                ({dynamicComponents.length})
              </span>
            </h2>
            <div className={getLayoutClasses()}>
              {dynamicComponents.map((component) => (
                <div 
                  key={component.id} 
                  className="animate-component-materialize"
                  style={{ animationDelay: `${Math.random() * 0.3}s` }}
                >
                  {/* Use enhanced factory for enhanced components, regular factory for others */}
                  {'category' in component && component.category ? 
                    enhancedComponentFactory.renderComponent(component as any) :
                    componentFactory.renderComponent(component as any)
                  }
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Empty State */}
        {visibleMetrics.length === 0 && visibleCharts.length === 0 && dynamicComponents.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 dark:text-gray-600 mb-4">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-2xl">📊</span>
              </div>
              <h3 className="text-lg font-medium mb-2">No visible components</h3>
              <p className="text-sm">Add metrics or charts using the controls above, or ask the AI to create them for you.</p>
            </div>
          </div>
        )}

        {/* Sidebar placeholder */}
        {sidebarOpen && (
          <div className="fixed right-0 top-0 h-full w-80 bg-white dark:bg-gray-900 border-l dark:border-gray-800 p-6 shadow-xl">
            <h3 className="text-lg font-semibold mb-4 dark:text-white">Dashboard Sidebar</h3>
            <div className="space-y-4 text-sm dark:text-gray-300">
              <div>
                <h4 className="font-medium mb-2">Quick Stats</h4>
                <ul className="space-y-1 text-xs">
                  <li>Total Metrics: {metrics.length}</li>
                  <li>Visible Metrics: {visibleMetrics.length}</li>
                  <li>Total Charts: {charts.length}</li>
                  <li>Visible Charts: {visibleCharts.length}</li>
                  <li>Dynamic Components: {dynamicComponents.length}</li>
                  <li>Current Layout: {layout}</li>
                  <li>Theme: {theme}</li>
                </ul>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}