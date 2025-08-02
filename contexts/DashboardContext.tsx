"use client";

import React, { createContext, useContext, useCallback, useState } from "react";
import { useCopilotReadable, useCopilotAction } from "@copilotkit/react-core";
import { 
  DashboardState, 
  DashboardActions, 
  DashboardContextType,
  defaultDashboardState,
  MetricConfig,
  ChartConfig,
  FilterConfig,
  LayoutType,
  ThemeType
} from "@/types/dashboard";
import { componentFactory, ComponentSpec } from "@/lib/ComponentFactory";

const DashboardContext = createContext<DashboardContextType | null>(null);

export function useDashboard(): DashboardContextType {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error("useDashboard must be used within a DashboardProvider");
  }
  return context;
}

export function DashboardProvider({ children }: { children: React.ReactNode }) {
  // Use regular React state with CopilotKit integration
  const [state, setState] = useState<DashboardState>(defaultDashboardState);
  
  // Dynamic components state
  const [dynamicComponents, setDynamicComponents] = useState<ComponentSpec[]>([]);

  // Make dashboard state readable by AI
  useCopilotReadable({
    description: "Current dashboard configuration and state",
    value: {
      layout: state.layout,
      theme: state.theme,
      title: state.title,
      description: state.description,
      metricsCount: state.metrics.length,
      chartsCount: state.charts.length,
      activeFiltersCount: state.filters.filter(f => f.active).length,
      visibleMetrics: state.metrics.filter(m => m.visible).map(m => ({
        title: m.title,
        value: m.value,
        trend: m.trend
      })),
      visibleCharts: state.charts.filter(c => c.visible).map(c => ({
        title: c.title,
        type: c.type,
        width: c.width,
        height: c.height
      })),
      filters: state.filters.map(f => ({
        field: f.field,
        operator: f.operator,
        active: f.active
      })),
      settings: {
        sidebarOpen: state.sidebarOpen,
        gridColumns: state.gridColumns,
        refreshInterval: state.refreshInterval
      },
      dynamicComponents: dynamicComponents.map(c => ({
        id: c.id,
        type: c.type,
        category: c.category,
        title: c.props.title || c.props.label || "Untitled"
      }))
    }
  });

  // Also make the raw state available for detailed AI operations
  useCopilotReadable({
    description: "Complete dashboard state for advanced AI operations",
    value: state
  });

  // Helper function to update state with timestamp
  const updateState = useCallback((updates: Partial<DashboardState>) => {
    setState(prev => ({
      ...prev,
      ...updates,
      lastUpdated: new Date()
    }));
  }, []);

  // CopilotKit Actions for AI to modify dashboard state
  useCopilotAction({
    name: "updateDashboardLayout",
    description: "Update the dashboard layout type",
    parameters: [
      {
        name: "layout",
        type: "string",
        enum: ["grid", "list", "kanban", "cards"],
        description: "The layout type to set",
        required: true
      }
    ],
    handler: ({ layout }) => {
      updateState({ layout });
      return `Dashboard layout changed to ${layout}`;
    }
  });

  useCopilotAction({
    name: "updateDashboardTheme", 
    description: "Update the dashboard theme",
    parameters: [
      {
        name: "theme",
        type: "string",
        enum: ["light", "dark", "auto"],
        description: "The theme to set",
        required: true
      }
    ],
    handler: ({ theme }) => {
      updateState({ theme });
      return `Dashboard theme changed to ${theme}`;
    }
  });

  useCopilotAction({
    name: "addDashboardMetric",
    description: "Add a new metric to the dashboard",
    parameters: [
      {
        name: "title",
        type: "string", 
        description: "Metric title",
        required: true
      },
      {
        name: "value",
        type: "string",
        description: "Metric value (can include currency/units)",
        required: true
      },
      {
        name: "change",
        type: "number",
        description: "Percentage change",
        required: true
      },
      {
        name: "trend",
        type: "string",
        enum: ["up", "down", "neutral"],
        description: "Trend direction",
        required: true
      },
      {
        name: "icon",
        type: "string",
        description: "Icon name",
        required: false
      },
      {
        name: "color",
        type: "string", 
        description: "Color theme",
        required: false
      }
    ],
    handler: ({ title, value, change, trend, icon = "TrendingUp", color = "purple" }) => {
      const newMetric: MetricConfig = {
        id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        title,
        value,
        change,
        trend,
        icon,
        color,
        visible: true
      };
      updateState({
        metrics: [...state.metrics, newMetric]
      });
      return `Added new metric: ${title} with value ${value}`;
    }
  });

  useCopilotAction({
    name: "updateDashboardSettings",
    description: "Update dashboard settings like grid columns, sidebar, title, etc.",
    parameters: [
      {
        name: "gridColumns",
        type: "number",
        description: "Number of grid columns (6-12)",
        required: false
      },
      {
        name: "sidebarOpen", 
        type: "boolean",
        description: "Whether sidebar is open",
        required: false
      },
      {
        name: "title",
        type: "string",
        description: "Dashboard title",
        required: false
      },
      {
        name: "description",
        type: "string",
        description: "Dashboard description", 
        required: false
      }
    ],
    handler: (settings) => {
      const updates = Object.fromEntries(
        Object.entries(settings).filter(([_, value]) => value !== undefined)
      );
      updateState(updates);
      const updatesList = Object.entries(updates).map(([key, value]) => `${key}: ${value}`).join(", ");
      return `Updated dashboard settings: ${updatesList}`;
    }
  });

  // Advanced Analytics AI Actions
  useCopilotAction({
    name: "analyzePerformance",
    description: "Analyze current dashboard metrics and provide performance insights and recommendations",
    parameters: [],
    handler: () => {
      const visibleMetrics = state.metrics.filter(m => m.visible);
      const totalValue = visibleMetrics.reduce((acc, m) => {
        const numValue = parseFloat(m.value.replace(/[^0-9.-]/g, ''));
        return acc + (isNaN(numValue) ? 0 : numValue);
      }, 0);
      
      const positiveMetrics = visibleMetrics.filter(m => m.trend === 'up').length;
      const negativeMetrics = visibleMetrics.filter(m => m.trend === 'down').length;
      const neutralMetrics = visibleMetrics.filter(m => m.trend === 'neutral').length;
      
      const performanceScore = Math.round((positiveMetrics / visibleMetrics.length) * 100);
      
      let insights = [`📊 **Performance Analysis Summary**\n`];
      insights.push(`**Overall Score:** ${performanceScore}/100 (${positiveMetrics} positive, ${negativeMetrics} negative trends)`);
      insights.push(`**Total Metrics:** ${visibleMetrics.length} active metrics`);
      insights.push(`**Key Observations:**`);
      
      if (performanceScore >= 70) {
        insights.push(`✅ Strong performance - ${positiveMetrics} metrics trending upward`);
        insights.push(`🎯 Focus on sustaining growth in top-performing areas`);
      } else if (performanceScore >= 40) {
        insights.push(`⚠️ Mixed performance - balance improvement opportunities`);
        insights.push(`📈 Prioritize addressing ${negativeMetrics} declining metrics`);
      } else {
        insights.push(`🚨 Performance concerns - immediate attention needed`);
        insights.push(`🔧 Consider reviewing strategies for underperforming areas`);
      }
      
      // Specific metric insights
      visibleMetrics.forEach(metric => {
        if (metric.trend === 'down' && Math.abs(metric.change) > 5) {
          insights.push(`⚠️ ${metric.title}: ${metric.change}% decline requires attention`);
        } else if (metric.trend === 'up' && metric.change > 10) {
          insights.push(`🚀 ${metric.title}: Excellent ${metric.change}% growth`);
        }
      });
      
      insights.push(`\n**Recommendations:**`);
      if (negativeMetrics > 0) {
        insights.push(`• Investigate root causes of declining metrics`);
        insights.push(`• Set up alerts for continued monitoring`);
      }
      if (positiveMetrics > 0) {
        insights.push(`• Analyze success factors from growing metrics`);
        insights.push(`• Consider scaling successful strategies`);
      }
      
      return insights.join('\n');
    }
  });

  useCopilotAction({
    name: "identifyAnomalies",
    description: "Detect unusual patterns and anomalies in current dashboard data",
    parameters: [],
    handler: () => {
      const anomalies = [];
      const visibleMetrics = state.metrics.filter(m => m.visible);
      
      // Check for extreme changes
      visibleMetrics.forEach(metric => {
        if (Math.abs(metric.change) > 20) {
          anomalies.push({
            type: 'extreme_change',
            metric: metric.title,
            change: metric.change,
            severity: Math.abs(metric.change) > 50 ? 'high' : 'medium'
          });
        }
      });
      
      // Check for inconsistent trends
      const revenueLike = visibleMetrics.filter(m => 
        m.title.toLowerCase().includes('revenue') || 
        m.title.toLowerCase().includes('sales') ||
        m.title.toLowerCase().includes('income')
      );
      const userLike = visibleMetrics.filter(m => 
        m.title.toLowerCase().includes('user') || 
        m.title.toLowerCase().includes('customer')
      );
      
      if (revenueLike.length > 0 && userLike.length > 0) {
        const revenueUp = revenueLike.some(m => m.trend === 'up');
        const usersDown = userLike.some(m => m.trend === 'down');
        if (revenueUp && usersDown) {
          anomalies.push({
            type: 'trend_inconsistency',
            description: 'Revenue increasing while users declining - investigate retention/pricing',
            severity: 'medium'
          });
        }
      }
      
      // Check for missing critical metrics
      const hasCriticalMetrics = {
        revenue: visibleMetrics.some(m => m.title.toLowerCase().includes('revenue')),
        users: visibleMetrics.some(m => m.title.toLowerCase().includes('user')),
        conversion: visibleMetrics.some(m => m.title.toLowerCase().includes('conversion') || m.title.toLowerCase().includes('rate'))
      };
      
      Object.entries(hasCriticalMetrics).forEach(([metric, exists]) => {
        if (!exists) {
          anomalies.push({
            type: 'missing_metric',
            metric: metric,
            severity: 'low'
          });
        }
      });
      
      if (anomalies.length === 0) {
        return "✅ No significant anomalies detected in current dashboard data. All metrics appear to be within normal ranges.";
      }
      
      let report = "🔍 **Anomaly Detection Report**\n\n";
      
      const highSeverity = anomalies.filter(a => a.severity === 'high');
      const mediumSeverity = anomalies.filter(a => a.severity === 'medium');
      const lowSeverity = anomalies.filter(a => a.severity === 'low');
      
      if (highSeverity.length > 0) {
        report += "🚨 **High Priority Anomalies:**\n";
        highSeverity.forEach(a => {
          if (a.type === 'extreme_change') {
            report += `• ${a.metric}: Extreme ${a.change > 0 ? 'increase' : 'decrease'} of ${Math.abs(a.change)}%\n`;
          }
        });
      }
      
      if (mediumSeverity.length > 0) {
        report += "\n⚠️ **Medium Priority Anomalies:**\n";
        mediumSeverity.forEach(a => {
          if (a.type === 'extreme_change') {
            report += `• ${a.metric}: Significant change of ${a.change}%\n`;
          } else if (a.type === 'trend_inconsistency') {
            report += `• ${a.description}\n`;
          }
        });
      }
      
      if (lowSeverity.length > 0) {
        report += "\n💡 **Optimization Opportunities:**\n";
        lowSeverity.forEach(a => {
          if (a.type === 'missing_metric') {
            report += `• Consider adding ${a.metric} tracking for comprehensive analysis\n`;
          }
        });
      }
      
      report += "\n**Recommended Actions:**\n";
      report += "• Investigate high-priority anomalies immediately\n";
      report += "• Set up monitoring for extreme changes\n";
      report += "• Review data collection processes\n";
      
      return report;
    }
  });

  useCopilotAction({
    name: "suggestOptimizations",
    description: "Provide data-driven dashboard optimization recommendations based on current state",
    parameters: [],
    handler: () => {
      const suggestions = [];
      const visibleMetrics = state.metrics.filter(m => m.visible);
      const visibleCharts = state.charts.filter(c => c.visible);
      
      // Layout optimizations
      if (state.layout === 'grid' && state.gridColumns > 8 && visibleMetrics.length < 6) {
        suggestions.push({
          category: 'layout',
          priority: 'medium',
          suggestion: `Reduce grid columns from ${state.gridColumns} to 8 for better visual balance with ${visibleMetrics.length} metrics`
        });
      }
      
      if (state.layout === 'list' && visibleMetrics.length > 8) {
        suggestions.push({
          category: 'layout',
          priority: 'high',
          suggestion: 'Switch to grid layout for better organization of numerous metrics'
        });
      }
      
      // Metric optimizations
      const lowImpactMetrics = visibleMetrics.filter(m => Math.abs(m.change) < 1);
      if (lowImpactMetrics.length > 3) {
        suggestions.push({
          category: 'metrics',
          priority: 'medium',
          suggestion: `Consider grouping or hiding ${lowImpactMetrics.length} low-change metrics to focus on impactful data`
        });
      }
      
      const duplicateTypes = {};
      visibleMetrics.forEach(m => {
        const type = m.title.toLowerCase().includes('revenue') ? 'revenue' :
                    m.title.toLowerCase().includes('user') ? 'users' :
                    m.title.toLowerCase().includes('order') ? 'orders' : 'other';
        duplicateTypes[type] = (duplicateTypes[type] || 0) + 1;
      });
      
      Object.entries(duplicateTypes).forEach(([type, count]) => {
        if (count > 2 && type !== 'other') {
          suggestions.push({
            category: 'metrics',
            priority: 'low',
            suggestion: `Consider consolidating ${count} ${type}-related metrics into a single comprehensive metric`
          });
        }
      });
      
      // Chart optimizations
      if (visibleCharts.length === 0 && visibleMetrics.length > 3) {
        suggestions.push({
          category: 'visualization',
          priority: 'high',
          suggestion: 'Add trend charts to complement your metrics for better insights'
        });
      }
      
      const oversizedCharts = visibleCharts.filter(c => c.width > 600 || c.height > 400);
      if (oversizedCharts.length > 0) {
        suggestions.push({
          category: 'visualization',
          priority: 'medium',
          suggestion: `Resize ${oversizedCharts.length} large charts for better dashboard balance`
        });
      }
      
      // Theme and UX optimizations
      if (state.theme === 'light' && new Date().getHours() > 18) {
        suggestions.push({
          category: 'ux',
          priority: 'low',
          suggestion: 'Consider switching to dark theme for better evening viewing experience'
        });
      }
      
      if (!state.sidebarOpen && (visibleMetrics.length > 6 || visibleCharts.length > 2)) {
        suggestions.push({
          category: 'ux',
          priority: 'medium',
          suggestion: 'Enable sidebar for better navigation with multiple dashboard elements'
        });
      }
      
      // Performance optimizations
      if (dynamicComponents.length > 10) {
        suggestions.push({
          category: 'performance',
          priority: 'medium',
          suggestion: `Consider organizing ${dynamicComponents.length} dynamic components into tabs or collapsible sections`
        });
      }
      
      if (suggestions.length === 0) {
        return "✅ Your dashboard is well-optimized! No significant improvements needed at this time.";
      }
      
      let report = "🎯 **Dashboard Optimization Recommendations**\n\n";
      
      const highPriority = suggestions.filter(s => s.priority === 'high');
      const mediumPriority = suggestions.filter(s => s.priority === 'medium');
      const lowPriority = suggestions.filter(s => s.priority === 'low');
      
      if (highPriority.length > 0) {
        report += "🔥 **High Priority (Implement First):**\n";
        highPriority.forEach(s => report += `• ${s.suggestion}\n`);
      }
      
      if (mediumPriority.length > 0) {
        report += "\n📈 **Medium Priority (Consider Next):**\n";
        mediumPriority.forEach(s => report += `• ${s.suggestion}\n`);
      }
      
      if (lowPriority.length > 0) {
        report += "\n💡 **Low Priority (Nice to Have):**\n";
        lowPriority.forEach(s => report += `• ${s.suggestion}\n`);
      }
      
      report += "\n**Implementation Tips:**\n";
      report += "• Make one change at a time and evaluate impact\n";
      report += "• Consider user feedback before major layout changes\n";
      report += "• Test optimizations with actual data scenarios\n";
      
      return report;
    }
  });

  useCopilotAction({
    name: "generateReport",
    description: "Generate a comprehensive summary report of current dashboard state and performance",
    parameters: [
      {
        name: "reportType",
        type: "string",
        enum: ["summary", "detailed", "executive", "technical"],
        description: "Type of report to generate",
        required: false
      }
    ],
    handler: ({ reportType = "summary" }) => {
      const now = new Date();
      const visibleMetrics = state.metrics.filter(m => m.visible);
      const visibleCharts = state.charts.filter(c => c.visible);
      const activeFilters = state.filters.filter(f => f.active);
      
      let report = "";
      
      if (reportType === "executive") {
        report = `# Executive Dashboard Report
**Generated:** ${now.toLocaleString()}
**Dashboard:** ${state.title}

## Key Performance Indicators
`;
        visibleMetrics.forEach(metric => {
          const trend = metric.trend === 'up' ? '📈' : metric.trend === 'down' ? '📉' : '➡️';
          report += `**${metric.title}:** ${metric.value} ${trend} ${metric.change}%\n`;
        });
        
        const positiveCount = visibleMetrics.filter(m => m.trend === 'up').length;
        const performanceScore = Math.round((positiveCount / visibleMetrics.length) * 100);
        
        report += `\n## Overall Performance: ${performanceScore}/100\n`;
        report += `**Status:** ${performanceScore >= 70 ? 'Strong Performance ✅' : performanceScore >= 40 ? 'Mixed Results ⚠️' : 'Needs Attention 🚨'}\n`;
        
      } else if (reportType === "technical") {
        report = `# Technical Dashboard Report
**Generated:** ${now.toLocaleString()}
**System Configuration:**
- Layout: ${state.layout}
- Theme: ${state.theme}  
- Grid Columns: ${state.gridColumns}
- Sidebar: ${state.sidebarOpen ? 'Open' : 'Closed'}
- Last Updated: ${state.lastUpdated.toLocaleString()}

## Component Inventory
- **Static Metrics:** ${visibleMetrics.length} active / ${state.metrics.length} total
- **Charts:** ${visibleCharts.length} active / ${state.charts.length} total
- **Dynamic Components:** ${dynamicComponents.length}
- **Active Filters:** ${activeFilters.length}

## Performance Metrics
`;
        visibleMetrics.forEach(metric => {
          report += `- ${metric.title}: ${metric.value} (${metric.change}% ${metric.trend})\n`;
        });
        
        report += `\n## Chart Configuration
`;
        visibleCharts.forEach(chart => {
          report += `- ${chart.title}: ${chart.type} (${chart.width}x${chart.height}px)\n`;
        });
        
      } else if (reportType === "detailed") {
        report = `# Detailed Dashboard Analysis
**Generated:** ${now.toLocaleString()}
**Dashboard:** ${state.title}
**Description:** ${state.description}

## Metrics Analysis (${visibleMetrics.length} active)
`;
        visibleMetrics.forEach(metric => {
          report += `### ${metric.title}
- **Current Value:** ${metric.value}
- **Change:** ${metric.change}% ${metric.trend === 'up' ? '(Positive)' : metric.trend === 'down' ? '(Negative)' : '(Neutral)'}
- **Status:** ${Math.abs(metric.change) > 10 ? 'High Impact' : Math.abs(metric.change) > 5 ? 'Moderate Impact' : 'Low Impact'}

`;
        });
        
        if (visibleCharts.length > 0) {
          report += `## Chart Analysis (${visibleCharts.length} active)
`;
          visibleCharts.forEach(chart => {
            report += `### ${chart.title}
- **Type:** ${chart.type}
- **Dimensions:** ${chart.width}x${chart.height}px
- **Visibility:** ${chart.visible ? 'Visible' : 'Hidden'}

`;
          });
        }
        
        if (dynamicComponents.length > 0) {
          report += `## Dynamic Components (${dynamicComponents.length} active)
`;
          dynamicComponents.forEach(comp => {
            report += `- **${comp.props.title || comp.type}:** ${comp.category} component\n`;
          });
        }
        
      } else { // summary
        report = `# Dashboard Summary Report
**Generated:** ${now.toLocaleString()}
**Dashboard:** ${state.title}

## Quick Overview
- **Total Metrics:** ${visibleMetrics.length} active
- **Charts:** ${visibleCharts.length} visualizations
- **Layout:** ${state.layout} (${state.gridColumns} columns)
- **Theme:** ${state.theme}

## Performance Summary
`;
        const trends = { up: 0, down: 0, neutral: 0 };
        visibleMetrics.forEach(m => trends[m.trend]++);
        
        report += `- **Positive Trends:** ${trends.up} metrics\n`;
        report += `- **Negative Trends:** ${trends.down} metrics\n`;
        report += `- **Stable Metrics:** ${trends.neutral} metrics\n`;
        
        const avgChange = visibleMetrics.reduce((acc, m) => acc + Math.abs(m.change), 0) / visibleMetrics.length;
        report += `- **Average Change:** ${avgChange.toFixed(1)}%\n`;
        
        report += `\n## Key Metrics
`;
        visibleMetrics.slice(0, 5).forEach(metric => {
          report += `- **${metric.title}:** ${metric.value} (${metric.change > 0 ? '+' : ''}${metric.change}%)\n`;
        });
      }
      
      report += `\n---
*Report generated by AG UI Dashboard Analytics*`;
      
      return report;
    }
  });

  // Dynamic Component Generation Actions
  useCopilotAction({
    name: "generateComponent",
    description: "Generate a new dynamic component from natural language description. Can create gauges, heatmaps, sparklines, progress bars, toggles, sliders, and more.",
    parameters: [
      {
        name: "description",
        type: "string",
        description: "Natural language description of the component to create (e.g., 'create a gauge chart showing CPU usage at 75%')",
        required: true
      }
    ],
    handler: ({ description }) => {
      const component = componentFactory.createFromDescription(description);
      if (component) {
        setDynamicComponents(prev => [...prev, component]);
        return `Created ${component.type} component: ${JSON.stringify(component.props)}`;
      } else {
        return `Could not create component from description: ${description}. Try describing a gauge, heatmap, sparkline, progress bar, toggle, slider, grid, panel, tabs, stat card, or alert banner.`;
      }
    }
  });

  useCopilotAction({
    name: "createSpecificComponent",
    description: "Create a specific type of component with custom properties",
    parameters: [
      {
        name: "type",
        type: "string",
        enum: ["gauge", "heatmap", "sparkline", "funnel", "progressBar", "toggleSwitch", "slider", "colorPicker", "dynamicGrid", "collapsiblePanel", "tabsContainer", "statCard", "alertBanner"],
        description: "The specific component type to create",
        required: true
      },
      {
        name: "title",
        type: "string",
        description: "Component title or label",
        required: false
      },
      {
        name: "value",
        type: "number",
        description: "Primary value for the component (for gauges, progress bars, etc.)",
        required: false
      },
      {
        name: "data",
        type: "string",
        description: "JSON string of data array for charts",
        required: false
      },
      {
        name: "color",
        type: "string",
        description: "Primary color for the component (hex code)",
        required: false
      }
    ],
    handler: ({ type, title, value, data, color }) => {
      const props: Record<string, any> = {};
      if (title) props.title = title;
      if (value !== undefined) props.value = value;
      if (data) {
        try {
          props.data = JSON.parse(data);
        } catch (e) {
          // If parsing fails, use as-is
          props.data = data;
        }
      }
      if (color) props.color = color;

      const component = componentFactory.createComponent(type, props);
      setDynamicComponents(prev => [...prev, component]);
      return `Created ${type} component with properties: ${JSON.stringify(props)}`;
    }
  });

  useCopilotAction({
    name: "modifyComponent",
    description: "Modify an existing dynamic component's properties",
    parameters: [
      {
        name: "componentId",
        type: "string",
        description: "ID of the component to modify",
        required: true
      },
      {
        name: "properties",
        type: "string",
        description: "JSON string of properties to update",
        required: true
      }
    ],
    handler: ({ componentId, properties }) => {
      try {
        const updatedProps = JSON.parse(properties);
        setDynamicComponents(prev => 
          prev.map(comp => 
            comp.id === componentId 
              ? { ...comp, props: { ...comp.props, ...updatedProps } }
              : comp
          )
        );
        return `Updated component ${componentId} with properties: ${properties}`;
      } catch (e) {
        return `Error updating component: Invalid JSON in properties`;
      }
    }
  });

  useCopilotAction({
    name: "removeComponent",
    description: "Remove a dynamic component from the dashboard",
    parameters: [
      {
        name: "componentId",
        type: "string",
        description: "ID of the component to remove",
        required: true
      }
    ],
    handler: ({ componentId }) => {
      const component = dynamicComponents.find(c => c.id === componentId);
      if (component) {
        setDynamicComponents(prev => prev.filter(c => c.id !== componentId));
        return `Removed ${component.type} component (${componentId})`;
      } else {
        return `Component with ID ${componentId} not found`;
      }
    }
  });

  useCopilotAction({
    name: "listComponents",
    description: "List all available component types and current dynamic components",
    parameters: [],
    handler: () => {
      const availableTypes = componentFactory.getAvailableTypes();
      const currentComponents = dynamicComponents.map(c => ({
        id: c.id,
        type: c.type,
        category: c.category,
        title: c.props.title || c.props.label || "Untitled"
      }));
      
      return `Available component types: ${availableTypes.join(", ")}. Current dynamic components: ${JSON.stringify(currentComponents, null, 2)}`;
    }
  });

  // Workflow Automation AI Actions
  useCopilotAction({
    name: "setupDashboardForRole",
    description: "Configure dashboard optimally for specific business roles with appropriate metrics, charts, and layout",
    parameters: [
      {
        name: "role",
        type: "string",
        enum: ["CEO", "Manager", "Analyst", "Developer", "Sales", "Marketing"],
        description: "The business role to optimize dashboard for",
        required: true
      }
    ],
    handler: ({ role }) => {
      const changes = [];
      
      // Role-specific configurations
      switch (role.toLowerCase()) {
        case "ceo":
          // CEO needs high-level overview with executive metrics
          updateState({
            title: "Executive Dashboard",
            description: "High-level business performance overview",
            layout: "grid",
            gridColumns: 8,
            theme: "dark" // Professional look
          });
          changes.push("Set executive title and professional dark theme");
          
          // Clear existing metrics and add executive ones
          const ceoMetrics = [
            { title: "Total Revenue", value: "$2,450,000", change: 18.5, trend: "up", icon: "DollarSign", color: "green" },
            { title: "Growth Rate", value: "24.3%", change: 8.2, trend: "up", icon: "TrendingUp", color: "purple" },
            { title: "Market Share", value: "15.8%", change: 2.1, trend: "up", icon: "Target", color: "blue" },
            { title: "Customer Satisfaction", value: "94%", change: 3.5, trend: "up", icon: "Heart", color: "red" }
          ];
          
          updateState({ metrics: ceoMetrics.map((m, i) => ({ ...m, id: `ceo-metric-${i}`, visible: true })) });
          changes.push("Added executive-level KPIs focused on growth and performance");
          break;
          
        case "manager":
          // Managers need operational metrics and team performance
          updateState({
            title: "Management Dashboard", 
            description: "Team performance and operational metrics",
            layout: "grid",
            gridColumns: 10,
            sidebarOpen: true
          });
          changes.push("Configured for management oversight with sidebar navigation");
          
          const managerMetrics = [
            { title: "Team Productivity", value: "87%", change: 5.2, trend: "up", icon: "Users", color: "purple" },
            { title: "Project Completion", value: "92%", change: 8.1, trend: "up", icon: "CheckCircle", color: "green" },
            { title: "Resource Utilization", value: "78%", change: -2.3, trend: "down", icon: "Activity", color: "orange" },
            { title: "Budget Efficiency", value: "95%", change: 1.8, trend: "up", icon: "Calculator", color: "blue" },
            { title: "Quality Score", value: "96%", change: 4.2, trend: "up", icon: "Award", color: "yellow" }
          ];
          
          updateState({ metrics: managerMetrics.map((m, i) => ({ ...m, id: `mgr-metric-${i}`, visible: true })) });
          changes.push("Added operational metrics for team and resource management");
          break;
          
        case "analyst":
          // Analysts need detailed data with multiple visualizations
          updateState({
            title: "Analytics Workbench",
            description: "Detailed data analysis and visualization workspace", 
            layout: "grid",
            gridColumns: 12,
            sidebarOpen: true
          });
          changes.push("Maximized grid layout for comprehensive data analysis");
          
          const analystMetrics = [
            { title: "Data Quality", value: "98.7%", change: 0.8, trend: "up", icon: "Database", color: "green" },
            { title: "Processing Speed", value: "145ms", change: -12.5, trend: "up", icon: "Zap", color: "yellow" },
            { title: "Accuracy Rate", value: "99.2%", change: 0.3, trend: "up", icon: "Target", color: "blue" },
            { title: "Coverage Index", value: "94.8%", change: 2.1, trend: "up", icon: "BarChart", color: "purple" },
            { title: "Anomaly Detection", value: "12", change: -15.2, trend: "up", icon: "AlertTriangle", color: "red" },
            { title: "Model Performance", value: "96.4%", change: 1.8, trend: "up", icon: "Brain", color: "green" }
          ];
          
          updateState({ metrics: analystMetrics.map((m, i) => ({ ...m, id: `analyst-metric-${i}`, visible: true })) });
          changes.push("Added comprehensive analytics metrics for data professionals");
          break;
          
        case "developer":
          // Developers need technical metrics and system health
          updateState({
            title: "Development Dashboard",
            description: "System performance and development metrics",
            layout: "grid", 
            gridColumns: 10,
            theme: "dark" // Preferred by developers
          });
          changes.push("Set dark theme and technical configuration");
          
          const devMetrics = [
            { title: "System Uptime", value: "99.9%", change: 0.1, trend: "up", icon: "Server", color: "green" },
            { title: "Response Time", value: "127ms", change: -8.3, trend: "up", icon: "Clock", color: "blue" },
            { title: "Error Rate", value: "0.02%", change: -15.8, trend: "up", icon: "AlertCircle", color: "red" },
            { title: "CPU Usage", value: "23%", change: -5.2, trend: "up", icon: "Cpu", color: "orange" },
            { title: "Memory Usage", value: "67%", change: 2.1, trend: "down", icon: "HardDrive", color: "purple" },
            { title: "Deployments", value: "47", change: 12.5, trend: "up", icon: "GitBranch", color: "green" }
          ];
          
          updateState({ metrics: devMetrics.map((m, i) => ({ ...m, id: `dev-metric-${i}`, visible: true })) });
          changes.push("Added technical metrics for system monitoring and development");
          break;
          
        case "sales":
          // Sales team needs revenue and pipeline metrics
          updateState({
            title: "Sales Performance Dashboard",
            description: "Revenue tracking and sales pipeline analysis",
            layout: "cards", // Better for sales data
            gridColumns: 9
          });
          changes.push("Optimized layout for sales performance tracking");
          
          const salesMetrics = [
            { title: "Monthly Revenue", value: "$847,250", change: 22.3, trend: "up", icon: "DollarSign", color: "green" },
            { title: "Conversion Rate", value: "18.5%", change: 3.2, trend: "up", icon: "Target", color: "purple" },
            { title: "Pipeline Value", value: "$2.1M", change: 15.7, trend: "up", icon: "TrendingUp", color: "blue" },
            { title: "Deals Closed", value: "156", change: 8.9, trend: "up", icon: "Handshake", color: "yellow" },
            { title: "Lead Quality", value: "84%", change: 5.1, trend: "up", icon: "Star", color: "orange" }
          ];
          
          updateState({ metrics: salesMetrics.map((m, i) => ({ ...m, id: `sales-metric-${i}`, visible: true })) });
          changes.push("Added sales-focused KPIs for revenue and pipeline tracking");
          break;
          
        case "marketing":
          // Marketing needs engagement and campaign metrics
          updateState({
            title: "Marketing Analytics Dashboard",
            description: "Campaign performance and audience engagement metrics",
            layout: "grid",
            gridColumns: 11
          });
          changes.push("Configured for marketing campaign analysis");
          
          const marketingMetrics = [
            { title: "Campaign ROI", value: "340%", change: 28.5, trend: "up", icon: "Target", color: "green" },
            { title: "Engagement Rate", value: "12.8%", change: 15.2, trend: "up", icon: "Heart", color: "red" },
            { title: "Reach", value: "2.4M", change: 18.7, trend: "up", icon: "Users", color: "blue" },
            { title: "Click-Through Rate", value: "4.2%", change: 8.3, trend: "up", icon: "MousePointer", color: "purple" },
            { title: "Cost Per Lead", value: "$12.50", change: -22.1, trend: "up", icon: "Calculator", color: "orange" },
            { title: "Brand Awareness", value: "67%", change: 11.4, trend: "up", icon: "Eye", color: "yellow" }
          ];
          
          updateState({ metrics: marketingMetrics.map((m, i) => ({ ...m, id: `mkt-metric-${i}`, visible: true })) });
          changes.push("Added marketing-specific metrics for campaign and engagement tracking");
          break;
          
        default:
          return `Unknown role: ${role}. Available roles: CEO, Manager, Analyst, Developer, Sales, Marketing`;
      }
      
      // Clear dynamic components for fresh start
      setDynamicComponents([]);
      changes.push("Cleared previous dynamic components for role-specific setup");
      
      return `🎯 **Dashboard configured for ${role}**\n\n` +
             `**Changes Applied:**\n${changes.map(c => `• ${c}`).join('\n')}\n\n` +
             `**Next Steps:**\n• Review the role-specific metrics\n• Add charts relevant to your ${role.toLowerCase()} responsibilities\n• Customize colors and layout as needed`;
    }
  });

  useCopilotAction({
    name: "createStandardReports",
    description: "Generate common business reports based on current dashboard data",
    parameters: [
      {
        name: "reportFormat",
        type: "string", 
        enum: ["weekly", "monthly", "quarterly", "custom"],
        description: "Time period for the report",
        required: true
      }
    ],
    handler: ({ reportFormat }) => {
      const visibleMetrics = state.metrics.filter(m => m.visible);
      const now = new Date();
      const period = reportFormat.charAt(0).toUpperCase() + reportFormat.slice(1);
      
      let report = `# ${period} Business Report\n`;
      report += `**Generated:** ${now.toLocaleString()}\n`;
      report += `**Dashboard:** ${state.title}\n`;
      report += `**Period:** ${reportFormat === 'weekly' ? 'Last 7 days' : reportFormat === 'monthly' ? 'Last 30 days' : reportFormat === 'quarterly' ? 'Last 90 days' : 'Custom period'}\n\n`;
      
      // Executive Summary
      const positiveMetrics = visibleMetrics.filter(m => m.trend === 'up').length;
      const performanceScore = Math.round((positiveMetrics / visibleMetrics.length) * 100);
      
      report += `## Executive Summary\n`;
      report += `**Overall Performance:** ${performanceScore}/100\n`;
      report += `**Key Highlights:**\n`;
      
      // Top performers
      const topPerformers = visibleMetrics
        .filter(m => m.trend === 'up')
        .sort((a, b) => b.change - a.change)
        .slice(0, 3);
      
      if (topPerformers.length > 0) {
        report += `**🚀 Top Performers:**\n`;
        topPerformers.forEach(metric => {
          report += `• ${metric.title}: ${metric.value} (+${metric.change}%)\n`;
        });
      }
      
      // Areas needing attention
      const concernAreas = visibleMetrics
        .filter(m => m.trend === 'down')
        .sort((a, b) => a.change - b.change)
        .slice(0, 3);
        
      if (concernAreas.length > 0) {
        report += `\n**⚠️ Areas Needing Attention:**\n`;
        concernAreas.forEach(metric => {
          report += `• ${metric.title}: ${metric.value} (${metric.change}%)\n`;
        });
      }
      
      // Detailed metrics
      report += `\n## Detailed Performance Metrics\n`;
      visibleMetrics.forEach(metric => {
        const status = metric.trend === 'up' ? '📈 Positive' : metric.trend === 'down' ? '📉 Declining' : '➡️ Stable';
        const impact = Math.abs(metric.change) > 10 ? 'High Impact' : Math.abs(metric.change) > 5 ? 'Medium Impact' : 'Low Impact';
        
        report += `### ${metric.title}\n`;
        report += `- **Current Value:** ${metric.value}\n`;
        report += `- **Change:** ${metric.change}% ${status}\n`;
        report += `- **Impact Level:** ${impact}\n\n`;
      });
      
      // Recommendations based on period
      report += `## ${period} Recommendations\n`;
      
      if (reportFormat === 'weekly') {
        report += `**Immediate Actions (Next 7 Days):**\n`;
        if (concernAreas.length > 0) {
          report += `• Investigate declining metrics and implement quick fixes\n`;
          report += `• Schedule team check-ins for underperforming areas\n`;
        }
        if (topPerformers.length > 0) {
          report += `• Document success factors from top-performing metrics\n`;
          report += `• Consider scaling successful strategies\n`;
        }
        report += `• Monitor daily progress on key initiatives\n`;
        
      } else if (reportFormat === 'monthly') {
        report += `**Strategic Actions (Next 30 Days):**\n`;
        report += `• Conduct thorough analysis of performance patterns\n`;
        report += `• Adjust resource allocation based on metric performance\n`;
        report += `• Plan initiatives to address declining areas\n`;
        report += `• Set targets for the next month based on current trends\n`;
        
      } else if (reportFormat === 'quarterly') {
        report += `**Strategic Planning (Next 90 Days):**\n`;
        report += `• Review and update long-term strategy based on trends\n`;
        report += `• Allocate budget for high-performing initiatives\n`;
        report += `• Consider organizational changes for better performance\n`;
        report += `• Set quarterly goals and KPI targets\n`;
      }
      
      // Action items
      report += `\n## Action Items\n`;
      let actionCount = 1;
      
      concernAreas.forEach(metric => {
        report += `${actionCount}. **Address ${metric.title} decline:** Investigate root cause of ${metric.change}% decrease\n`;
        actionCount++;
      });
      
      if (performanceScore < 70) {
        report += `${actionCount}. **Performance Review:** Overall score of ${performanceScore}/100 requires strategic review\n`;
        actionCount++;
      }
      
      topPerformers.forEach(metric => {
        report += `${actionCount}. **Scale Success:** Analyze and replicate factors behind ${metric.title}'s ${metric.change}% growth\n`;
        actionCount++;
      });
      
      report += `\n---\n*Report generated by AG UI Dashboard Analytics*`;
      
      return report;
    }
  });

  useCopilotAction({
    name: "optimizeLayout",
    description: "Automatically arrange dashboard components for optimal user experience based on data importance and visual hierarchy",
    parameters: [],
    handler: () => {
      const visibleMetrics = state.metrics.filter(m => m.visible);
      const visibleCharts = state.charts.filter(c => c.visible);
      const optimizations = [];
      
      // Determine optimal layout based on content
      let recommendedLayout = state.layout;
      let recommendedColumns = state.gridColumns;
      
      if (visibleMetrics.length <= 4 && visibleCharts.length <= 2) {
        recommendedLayout = "cards";
        recommendedColumns = 8;
        optimizations.push("Switched to cards layout for cleaner presentation of fewer items");
      } else if (visibleMetrics.length > 8 || dynamicComponents.length > 6) {
        recommendedLayout = "grid";
        recommendedColumns = 12;
        optimizations.push("Maximized grid layout for comprehensive data display");
      } else if (visibleMetrics.length >= 5 && visibleMetrics.length <= 8) {
        recommendedLayout = "grid";
        recommendedColumns = 10;
        optimizations.push("Optimized grid layout for balanced presentation");
      }
      
      // Apply layout optimizations
      if (recommendedLayout !== state.layout || recommendedColumns !== state.gridColumns) {
        updateState({ 
          layout: recommendedLayout, 
          gridColumns: recommendedColumns 
        });
      }
      
      // Optimize sidebar based on complexity
      const totalComponents = visibleMetrics.length + visibleCharts.length + dynamicComponents.length;
      if (totalComponents > 8 && !state.sidebarOpen) {
        updateState({ sidebarOpen: true });
        optimizations.push("Enabled sidebar for better navigation of complex dashboard");
      } else if (totalComponents <= 4 && state.sidebarOpen) {
        updateState({ sidebarOpen: false });
        optimizations.push("Disabled sidebar to maximize content space for simple dashboard");
      }
      
      // Sort metrics by importance (trend and change magnitude)
      const sortedMetrics = [...visibleMetrics].sort((a, b) => {
        const aImportance = (a.trend === 'up' ? 1 : a.trend === 'down' ? -1 : 0) + Math.abs(a.change) / 100;
        const bImportance = (b.trend === 'up' ? 1 : b.trend === 'down' ? -1 : 0) + Math.abs(b.change) / 100;
        return bImportance - aImportance;
      });
      
      if (JSON.stringify(sortedMetrics) !== JSON.stringify(visibleMetrics)) {
        updateState({ 
          metrics: [
            ...sortedMetrics,
            ...state.metrics.filter(m => !m.visible)
          ]
        });
        optimizations.push("Reordered metrics by importance (high-impact changes first)");
      }
      
      // Optimize theme based on time and content type
      const currentHour = new Date().getHours();
      const hasMany = totalComponents > 10;
      
      if ((currentHour >= 18 || currentHour < 6) && state.theme === 'light') {
        updateState({ theme: 'dark' });
        optimizations.push("Switched to dark theme for better evening viewing");
      } else if (hasMany && state.theme === 'light') {
        updateState({ theme: 'dark' });
        optimizations.push("Applied dark theme to reduce eye strain with complex dashboard");
      }
      
      // Performance optimizations
      if (dynamicComponents.length > 15) {
        optimizations.push("⚠️ Consider organizing dynamic components into collapsible sections for better performance");
      }
      
      if (visibleCharts.some(c => c.width > 800 || c.height > 600)) {
        optimizations.push("⚠️ Some charts are very large - consider resizing for better layout balance");
      }
      
      if (optimizations.length === 0) {
        return "✅ Your dashboard layout is already optimized! No changes needed.";
      }
      
      return `🎨 **Layout Optimization Complete**\n\n` +
             `**Applied Optimizations:**\n${optimizations.map(o => `• ${o}`).join('\n')}\n\n` +
             `**Current Configuration:**\n` +
             `• Layout: ${state.layout}\n` +
             `• Grid Columns: ${state.gridColumns}\n` +
             `• Sidebar: ${state.sidebarOpen ? 'Open' : 'Closed'}\n` +
             `• Theme: ${state.theme}\n` +
             `• Total Components: ${totalComponents}\n\n` +
             `**Result:** Improved visual hierarchy and user experience based on your content.`;
    }
  });

  useCopilotAction({
    name: "suggestNewMetrics",
    description: "Recommend additional KPIs and metrics to track based on existing dashboard patterns and business context",
    parameters: [],
    handler: () => {
      const visibleMetrics = state.metrics.filter(m => m.visible);
      const suggestions = [];
      
      // Analyze existing metrics to understand business focus
      const hasRevenue = visibleMetrics.some(m => m.title.toLowerCase().includes('revenue'));
      const hasUsers = visibleMetrics.some(m => m.title.toLowerCase().includes('user'));
      const hasOrders = visibleMetrics.some(m => m.title.toLowerCase().includes('order'));
      const hasGrowth = visibleMetrics.some(m => m.title.toLowerCase().includes('growth'));
      const hasEfficiency = visibleMetrics.some(m => m.title.toLowerCase().includes('efficiency') || m.title.toLowerCase().includes('utilization'));
      const hasQuality = visibleMetrics.some(m => m.title.toLowerCase().includes('quality') || m.title.toLowerCase().includes('satisfaction'));
      
      // Business performance suggestions
      if (hasRevenue && !hasOrders) {
        suggestions.push({
          category: 'Sales',
          metric: 'Average Order Value (AOV)',
          description: 'Track average transaction size to understand revenue per customer',
          priority: 'high',
          rationale: 'You track revenue but not order patterns - AOV provides crucial sales insights'
        });
      }
      
      if (hasUsers && !hasRevenue) {
        suggestions.push({
          category: 'Revenue',
          metric: 'Customer Lifetime Value (CLV)',
          description: 'Measure total revenue expected from customer relationship',
          priority: 'high', 
          rationale: 'You track users but not their revenue impact - CLV connects user metrics to business value'
        });
      }
      
      if (hasRevenue && hasUsers && !suggestions.some(s => s.metric.includes('Conversion'))) {
        suggestions.push({
          category: 'Performance',
          metric: 'Customer Acquisition Cost (CAC)',
          description: 'Cost to acquire each new customer',
          priority: 'medium',
          rationale: 'Balance user growth metrics with acquisition efficiency'
        });
      }
      
      // Operational efficiency suggestions
      if (!hasEfficiency && visibleMetrics.length > 3) {
        suggestions.push({
          category: 'Operations',
          metric: 'Net Promoter Score (NPS)',
          description: 'Customer loyalty and satisfaction measurement',
          priority: 'medium',
          rationale: 'Operational metrics benefit from customer sentiment tracking'
        });
      }
      
      if (hasRevenue && !hasQuality) {
        suggestions.push({
          category: 'Quality',
          metric: 'Customer Support Response Time',
          description: 'Average time to respond to customer inquiries',
          priority: 'medium',
          rationale: 'Revenue tracking should be balanced with customer experience metrics'
        });
      }
      
      // Growth and scaling suggestions
      if (!hasGrowth && visibleMetrics.some(m => m.trend === 'up')) {
        suggestions.push({
          category: 'Growth',
          metric: 'Monthly Recurring Revenue (MRR)',
          description: 'Predictable monthly revenue stream tracking',
          priority: 'high',
          rationale: 'Your positive trends suggest business growth - MRR provides sustainable revenue insights'
        });
      }
      
      // Industry-specific suggestions based on dashboard title
      const title = state.title.toLowerCase();
      if (title.includes('sales') || title.includes('revenue')) {
        suggestions.push({
          category: 'Sales',
          metric: 'Sales Cycle Length',
          description: 'Average time from lead to closed deal',
          priority: 'medium',
          rationale: 'Sales-focused dashboards benefit from pipeline velocity metrics'
        });
      }
      
      if (title.includes('marketing') || title.includes('campaign')) {
        suggestions.push({
          category: 'Marketing',
          metric: 'Return on Ad Spend (ROAS)',
          description: 'Revenue generated per dollar spent on advertising',
          priority: 'high',
          rationale: 'Marketing dashboards need direct ROI measurement'
        });
      }
      
      if (title.includes('development') || title.includes('technical')) {
        suggestions.push({
          category: 'Technical',
          metric: 'Code Coverage',
          description: 'Percentage of code covered by automated tests',
          priority: 'medium',
          rationale: 'Development dashboards should track code quality metrics'
        });
      }
      
      // Advanced analytics suggestions
      if (visibleMetrics.length >= 6) {
        suggestions.push({
          category: 'Analytics',
          metric: 'Cohort Retention Rate',
          description: 'Percentage of users returning in subsequent time periods',
          priority: 'medium',
          rationale: 'Complex dashboards benefit from advanced user behavior analysis'
        });
      }
      
      // Missing fundamental metrics
      const fundamentals = [
        { name: 'Churn Rate', check: () => !visibleMetrics.some(m => m.title.toLowerCase().includes('churn')), category: 'Retention' },
        { name: 'Profit Margin', check: () => hasRevenue && !visibleMetrics.some(m => m.title.toLowerCase().includes('margin')), category: 'Finance' },
        { name: 'Employee Productivity', check: () => !visibleMetrics.some(m => m.title.toLowerCase().includes('productivity')), category: 'Operations' }
      ];
      
      fundamentals.forEach(fund => {
        if (fund.check()) {
          suggestions.push({
            category: fund.category,
            metric: fund.name,
            description: `Track ${fund.name.toLowerCase()} for comprehensive business health`,
            priority: 'low',
            rationale: 'Fundamental business metric missing from current tracking'
          });
        }
      });
      
      if (suggestions.length === 0) {
        return "✅ Your dashboard has excellent metric coverage! All key business areas appear to be tracked.";
      }
      
      let report = "💡 **Recommended Additional Metrics**\n\n";
      
      const highPriority = suggestions.filter(s => s.priority === 'high');
      const mediumPriority = suggestions.filter(s => s.priority === 'medium');
      const lowPriority = suggestions.filter(s => s.priority === 'low');
      
      if (highPriority.length > 0) {
        report += "🔥 **High Priority (Implement First):**\n";
        highPriority.forEach(s => {
          report += `### ${s.metric} (${s.category})\n`;
          report += `**Description:** ${s.description}\n`;
          report += `**Why Important:** ${s.rationale}\n\n`;
        });
      }
      
      if (mediumPriority.length > 0) {
        report += "📈 **Medium Priority (Consider Adding):**\n";
        mediumPriority.forEach(s => {
          report += `### ${s.metric} (${s.category})\n`;
          report += `**Description:** ${s.description}\n`;
          report += `**Why Useful:** ${s.rationale}\n\n`;
        });
      }
      
      if (lowPriority.length > 0) {
        report += "💭 **Low Priority (Nice to Have):**\n";
        lowPriority.forEach(s => {
          report += `• **${s.metric}:** ${s.description}\n`;
        });
      }
      
      report += `\n**Implementation Tips:**\n`;
      report += `• Start with high-priority metrics that align with your key business goals\n`;
      report += `• Ensure you have reliable data sources before adding new metrics\n`;
      report += `• Consider the audience - add metrics that matter to your dashboard users\n`;
      report += `• Don't overwhelm the dashboard - add 1-2 metrics at a time\n`;
      
      return report;
    }
  });

  useCopilotAction({
    name: "predictTrends",
    description: "Forecast future performance trends based on current dashboard data patterns",
    parameters: [
      {
        name: "timeframe",
        type: "string",
        enum: ["1week", "1month", "3months", "6months"],
        description: "Timeframe for trend prediction",
        required: false
      }
    ],
    handler: ({ timeframe = "1month" }) => {
      const visibleMetrics = state.metrics.filter(m => m.visible);
      const period = timeframe === "1week" ? "1 Week" : timeframe === "1month" ? "1 Month" : timeframe === "3months" ? "3 Months" : "6 Months";
      const multiplier = timeframe === "1week" ? 0.25 : timeframe === "1month" ? 1 : timeframe === "3months" ? 3 : 6;
      
      let report = `🔮 **Trend Predictions for Next ${period}**\n`;
      report += `*Based on current performance patterns*\n\n`;
      
      const predictions = [];
      
      visibleMetrics.forEach(metric => {
        const currentValue = parseFloat(metric.value.replace(/[^0-9.-]/g, ''));
        const changeRate = metric.change / 100;
        
        // Simple linear projection with some variance
        const projectedChange = changeRate * multiplier;
        const projectedValue = currentValue * (1 + projectedChange);
        
        // Add confidence based on trend consistency
        let confidence = 'Medium';
        if (Math.abs(metric.change) > 15) {
          confidence = metric.trend === 'up' ? 'High' : 'Low';
        } else if (Math.abs(metric.change) < 3) {
          confidence = 'High'; // Stable metrics are predictable
        }
        
        // Format projected value with original units
        const originalUnit = metric.value.replace(/[0-9.,]/g, '');
        const formattedProjected = originalUnit + projectedValue.toLocaleString(undefined, { maximumFractionDigits: 0 });
        
        predictions.push({
          metric: metric.title,
          current: metric.value,
          projected: formattedProjected,
          trend: metric.trend,
          change: projectedChange * 100,
          confidence: confidence
        });
      });
      
      // Group by trend for better presentation
      const growingMetrics = predictions.filter(p => p.trend === 'up');
      const decliningMetrics = predictions.filter(p => p.trend === 'down');
      const stableMetrics = predictions.filter(p => p.trend === 'neutral');
      
      if (growingMetrics.length > 0) {
        report += "📈 **Growth Projections:**\n";
        growingMetrics.forEach(p => {
          report += `• **${p.metric}:** ${p.current} → ${p.projected} (+${p.change.toFixed(1)}%) [${p.confidence} confidence]\n`;
        });
      }
      
      if (decliningMetrics.length > 0) {
        report += "\n📉 **Decline Projections:**\n";
        decliningMetrics.forEach(p => {
          report += `• **${p.metric}:** ${p.current} → ${p.projected} (${p.change.toFixed(1)}%) [${p.confidence} confidence]\n`;
        });
      }
      
      if (stableMetrics.length > 0) {
        report += "\n➡️ **Stable Projections:**\n";
        stableMetrics.forEach(p => {
          report += `• **${p.metric}:** Expected to remain near ${p.projected} [${p.confidence} confidence]\n`;
        });
      }
      
      // Business insights and recommendations
      report += `\n## Business Insights\n`;
      
      const totalGrowthMetrics = growingMetrics.length;
      const totalDeclineMetrics = decliningMetrics.length;
      const highConfidenceGrowth = growingMetrics.filter(p => p.confidence === 'High').length;
      
      if (totalGrowthMetrics > totalDeclineMetrics) {
        report += `✅ **Positive Outlook:** ${totalGrowthMetrics} metrics trending upward vs ${totalDeclineMetrics} declining\n`;
        if (highConfidenceGrowth > 0) {
          report += `🎯 **High Confidence Growth:** ${highConfidenceGrowth} metrics show strong, predictable growth patterns\n`;
        }
      } else if (totalDeclineMetrics > totalGrowthMetrics) {
        report += `⚠️ **Challenging Period:** ${totalDeclineMetrics} metrics declining vs ${totalGrowthMetrics} growing\n`;
        report += `🔧 **Action Required:** Focus on turning around declining trends\n`;
      } else {
        report += `⚖️ **Mixed Outlook:** Balanced growth and decline patterns\n`;
        report += `📊 **Strategic Focus:** Amplify growth areas while addressing declines\n`;
      }
      
      // Risk assessment
      const highRiskMetrics = decliningMetrics.filter(p => Math.abs(p.change) > 20);
      if (highRiskMetrics.length > 0) {
        report += `\n🚨 **High Risk Areas:**\n`;
        highRiskMetrics.forEach(p => {
          report += `• ${p.metric}: Projected ${Math.abs(p.change).toFixed(1)}% decline needs immediate attention\n`;
        });
      }
      
      // Opportunity areas
      const highOpportunityMetrics = growingMetrics.filter(p => p.change > 25);
      if (highOpportunityMetrics.length > 0) {
        report += `\n🚀 **High Opportunity Areas:**\n`;
        highOpportunityMetrics.forEach(p => {
          report += `• ${p.metric}: Strong ${p.change.toFixed(1)}% growth potential - consider scaling\n`;
        });
      }
      
      report += `\n## Recommendations for ${period}\n`;
      
      if (timeframe === "1week") {
        report += `**Short-term Actions:**\n`;
        report += `• Monitor daily progress on key metrics\n`;
        report += `• Make tactical adjustments to improve declining trends\n`;
        report += `• Capitalize on immediate growth opportunities\n`;
      } else if (timeframe === "1month") {
        report += `**Monthly Planning:**\n`;
        report += `• Set monthly targets based on projections\n`;
        report += `• Allocate resources to high-opportunity areas\n`;
        report += `• Implement corrective measures for at-risk metrics\n`;
      } else {
        report += `**Strategic Planning:**\n`;
        report += `• Develop long-term strategies based on projected trends\n`;
        report += `• Consider major investments in high-growth areas\n`;
        report += `• Plan organizational changes to support positive trends\n`;
      }
      
      report += `\n*Note: Predictions are based on current trends and may vary due to external factors, market changes, or strategic interventions.*`;
      
      return report;
    }
  });

  // Layout Actions
  const setLayout = useCallback((layout: LayoutType) => {
    updateState({ layout });
  }, [updateState]);

  const setTheme = useCallback((theme: ThemeType) => {
    updateState({ theme });
  }, [updateState]);

  const setSidebarOpen = useCallback((sidebarOpen: boolean) => {
    updateState({ sidebarOpen });
  }, [updateState]);

  const setGridColumns = useCallback((gridColumns: number) => {
    updateState({ gridColumns });
  }, [updateState]);

  // Metric Actions
  const addMetric = useCallback((metric: Omit<MetricConfig, "id">) => {
    const newMetric: MetricConfig = {
      ...metric,
      id: `metric-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    updateState({
      metrics: [...state.metrics, newMetric]
    });
  }, [state.metrics, updateState]);

  const updateMetric = useCallback((id: string, updates: Partial<MetricConfig>) => {
    updateState({
      metrics: state.metrics.map(metric =>
        metric.id === id ? { ...metric, ...updates } : metric
      )
    });
  }, [state.metrics, updateState]);

  const removeMetric = useCallback((id: string) => {
    updateState({
      metrics: state.metrics.filter(metric => metric.id !== id)
    });
  }, [state.metrics, updateState]);

  const toggleMetricVisibility = useCallback((id: string) => {
    updateState({
      metrics: state.metrics.map(metric =>
        metric.id === id ? { ...metric, visible: !metric.visible } : metric
      )
    });
  }, [state.metrics, updateState]);

  // Chart Actions
  const addChart = useCallback((chart: Omit<ChartConfig, "id">) => {
    const newChart: ChartConfig = {
      ...chart,
      id: `chart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    updateState({
      charts: [...state.charts, newChart]
    });
  }, [state.charts, updateState]);

  const updateChart = useCallback((id: string, updates: Partial<ChartConfig>) => {
    updateState({
      charts: state.charts.map(chart =>
        chart.id === id ? { ...chart, ...updates } : chart
      )
    });
  }, [state.charts, updateState]);

  const removeChart = useCallback((id: string) => {
    updateState({
      charts: state.charts.filter(chart => chart.id !== id)
    });
  }, [state.charts, updateState]);

  const toggleChartVisibility = useCallback((id: string) => {
    updateState({
      charts: state.charts.map(chart =>
        chart.id === id ? { ...chart, visible: !chart.visible } : chart
      )
    });
  }, [state.charts, updateState]);

  const resizeChart = useCallback((id: string, width: number, height: number) => {
    updateState({
      charts: state.charts.map(chart =>
        chart.id === id ? { ...chart, width, height } : chart
      )
    });
  }, [state.charts, updateState]);

  // Filter Actions
  const addFilter = useCallback((filter: Omit<FilterConfig, "id">) => {
    const newFilter: FilterConfig = {
      ...filter,
      id: `filter-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    };
    updateState({
      filters: [...state.filters, newFilter]
    });
  }, [state.filters, updateState]);

  const updateFilter = useCallback((id: string, updates: Partial<FilterConfig>) => {
    updateState({
      filters: state.filters.map(filter =>
        filter.id === id ? { ...filter, ...updates } : filter
      )
    });
  }, [state.filters, updateState]);

  const removeFilter = useCallback((id: string) => {
    updateState({
      filters: state.filters.filter(filter => filter.id !== id)
    });
  }, [state.filters, updateState]);

  const toggleFilter = useCallback((id: string) => {
    updateState({
      filters: state.filters.map(filter =>
        filter.id === id ? { ...filter, active: !filter.active } : filter
      )
    });
  }, [state.filters, updateState]);

  const clearAllFilters = useCallback(() => {
    updateState({
      filters: state.filters.map(filter => ({ ...filter, active: false }))
    });
  }, [state.filters, updateState]);

  // Global Actions
  const resetDashboard = useCallback(() => {
    setState(defaultDashboardState);
  }, [setState]);

  const setTitle = useCallback((title: string) => {
    updateState({ title });
  }, [updateState]);

  const setDescription = useCallback((description: string) => {
    updateState({ description });
  }, [updateState]);

  const refresh = useCallback(() => {
    updateState({ lastUpdated: new Date() });
  }, [updateState]);

  // Dynamic Component Actions
  const addDynamicComponent = useCallback((component: ComponentSpec) => {
    setDynamicComponents(prev => [...prev, component]);
  }, []);

  const updateDynamicComponent = useCallback((id: string, updates: Partial<ComponentSpec>) => {
    setDynamicComponents(prev =>
      prev.map(comp => 
        comp.id === id ? { ...comp, ...updates } : comp
      )
    );
  }, []);

  const removeDynamicComponent = useCallback((id: string) => {
    setDynamicComponents(prev => prev.filter(comp => comp.id !== id));
  }, []);

  const clearDynamicComponents = useCallback(() => {
    setDynamicComponents([]);
  }, []);

  const contextValue: DashboardContextType = {
    // State
    ...state,
    dynamicComponents,
    
    // Actions
    setLayout,
    setTheme,
    setSidebarOpen,
    setGridColumns,
    addMetric,
    updateMetric,
    removeMetric,
    toggleMetricVisibility,
    addChart,
    updateChart,
    removeChart,
    toggleChartVisibility,
    resizeChart,
    addFilter,
    updateFilter,
    removeFilter,
    toggleFilter,
    clearAllFilters,
    resetDashboard,
    setTitle,
    setDescription,
    refresh,
    addDynamicComponent,
    updateDynamicComponent,
    removeDynamicComponent,
    clearDynamicComponents
  };

  return (
    <DashboardContext.Provider value={contextValue}>
      {children}
    </DashboardContext.Provider>
  );
}