// Dashboard State Types for Bidirectional AI Synchronization
import { ComponentSpec } from "@/lib/ComponentFactory";

export type LayoutType = "grid" | "list" | "kanban" | "cards";
export type ChartType = "line" | "bar" | "pie" | "area" | "scatter";
export type ThemeType = "light" | "dark" | "auto";

export interface MetricConfig {
  id: string;
  title: string;
  value: number | string;
  change: number;
  trend: "up" | "down" | "neutral";
  icon: string;
  visible: boolean;
  color: string;
}

export interface ChartConfig {
  id: string;
  title: string;
  type: ChartType;
  data: any[];
  visible: boolean;
  width: number; // 1-12 for grid system
  height: number; // in pixels
  config: Record<string, any>;
}

export interface FilterConfig {
  id: string;
  field: string;
  operator: "equals" | "contains" | "greater" | "less" | "between";
  value: any;
  active: boolean;
}

export interface DashboardState {
  // Layout Configuration
  layout: LayoutType;
  theme: ThemeType;
  
  // Data and Display
  metrics: MetricConfig[];
  charts: ChartConfig[];
  filters: FilterConfig[];
  dynamicComponents: ComponentSpec[];
  
  // UI State
  sidebarOpen: boolean;
  gridColumns: number;
  refreshInterval: number; // in seconds
  
  // Metadata
  lastUpdated: Date;
  title: string;
  description: string;
}

export interface DashboardActions {
  // Layout Actions
  setLayout: (layout: LayoutType) => void;
  setTheme: (theme: ThemeType) => void;
  setSidebarOpen: (open: boolean) => void;
  setGridColumns: (columns: number) => void;
  
  // Metric Actions
  addMetric: (metric: Omit<MetricConfig, "id">) => void;
  updateMetric: (id: string, updates: Partial<MetricConfig>) => void;
  removeMetric: (id: string) => void;
  toggleMetricVisibility: (id: string) => void;
  
  // Chart Actions
  addChart: (chart: Omit<ChartConfig, "id">) => void;
  updateChart: (id: string, updates: Partial<ChartConfig>) => void;
  removeChart: (id: string) => void;
  toggleChartVisibility: (id: string) => void;
  resizeChart: (id: string, width: number, height: number) => void;
  
  // Filter Actions
  addFilter: (filter: Omit<FilterConfig, "id">) => void;
  updateFilter: (id: string, updates: Partial<FilterConfig>) => void;
  removeFilter: (id: string) => void;
  toggleFilter: (id: string) => void;
  clearAllFilters: () => void;
  
  // Dynamic Component Actions
  addDynamicComponent: (component: ComponentSpec) => void;
  updateDynamicComponent: (id: string, updates: Partial<ComponentSpec>) => void;
  removeDynamicComponent: (id: string) => void;
  clearDynamicComponents: () => void;
  
  // Global Actions
  resetDashboard: () => void;
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  refresh: () => void;
}

export type DashboardContextType = DashboardState & DashboardActions;

// Default dashboard state
export const defaultDashboardState: DashboardState = {
  layout: "grid",
  theme: "dark",
  metrics: [
    {
      id: "revenue",
      title: "Total Revenue",
      value: "$1,234,560",
      change: 15.3,
      trend: "up",
      icon: "DollarSign",
      visible: true,
      color: "purple"
    },
    {
      id: "users",
      title: "Active Users",
      value: "12,483",
      change: 8.7,
      trend: "up",
      icon: "Users",
      visible: true,
      color: "blue"
    },
    {
      id: "orders",
      title: "Orders",
      value: "3,421",
      change: -2.1,
      trend: "down",
      icon: "ShoppingCart",
      visible: true,
      color: "green"
    }
  ],
  charts: [
    {
      id: "revenue-chart",
      title: "Revenue Over Time",
      type: "line",
      data: [
        { month: "Jan", revenue: 45000 },
        { month: "Feb", revenue: 52000 },
        { month: "Mar", revenue: 48000 },
        { month: "Apr", revenue: 61000 },
        { month: "May", revenue: 55000 },
        { month: "Jun", revenue: 67000 }
      ],
      visible: true,
      width: 8,
      height: 300,
      config: { color: "purple" }
    },
    {
      id: "users-chart",
      title: "User Growth",
      type: "bar",
      data: [
        { category: "New", value: 120 },
        { category: "Returning", value: 380 },
        { category: "Premium", value: 95 }
      ],
      visible: true,
      width: 4,
      height: 300,
      config: { color: "blue" }
    }
  ],
  filters: [
    {
      id: "date-range",
      field: "date",
      operator: "between",
      value: { start: "2024-01-01", end: "2024-12-31" },
      active: true
    }
  ],
  dynamicComponents: [],
  sidebarOpen: false,
  gridColumns: 12,
  refreshInterval: 30,
  lastUpdated: new Date(),
  title: "Analytics Dashboard",
  description: "Real-time business analytics and KPI tracking"
};