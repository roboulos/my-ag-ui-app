"use client";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { CollaborationPanel } from "@/components/collaboration/CollaborationPanel";
import { CopilotSidebar } from "@copilotkit/react-ui";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content Area with Dashboard - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <Dashboard />
      </div>

      {/* CopilotKit Sidebar - sticky */}
      <CopilotSidebar
        instructions={`You are an AI assistant that can create and modify dashboard components in real-time. 

You have access to powerful component generation capabilities:

1. GENERATE COMPONENTS: "Create a bar chart showing revenue by month" or "Generate a KPI card for user growth"
   - Use generateComponent action to create enhanced visualizations with Thesys-level polish
   - Components include: multiSeriesBarChart, insightCard, comparisonTable, relatedQueries, expandableSection
   - All components are professionally styled with smooth animations

2. DASHBOARD CONTROL: 
   - Layout (grid, list, kanban, cards): "Change to grid layout"
   - Theme (light, dark): "Switch to dark mode"
   - Grid columns (1-12): "Set grid to 8 columns"
   - Metrics & Charts: "Add a revenue metric" or "Hide the sales chart"

3. ENHANCED FEATURES:
   - Multi-series visualizations with legends
   - Insight cards with key findings
   - Comparison tables for data analysis
   - Related query suggestions
   - Expandable sections for detailed content

4. REAL-TIME COLLABORATION: Your changes are synchronized with all connected users instantly

Try commands like:
- "Generate a multi-series bar chart comparing sales and revenue by quarter"
- "Create an insight card about top performing products"
- "Add a comparison table for regional performance"
- "Show me related queries for sales analysis"
- "Create an expandable section with detailed metrics"

All components are created with premium visual quality, smooth animations, and professional styling.`}
        defaultOpen={true}
        clickOutsideToClose={false}
      />

      {/* Collaboration Panel - positioned absolute to overlay */}
      <div className="absolute top-4 right-4 z-50">
        <CollaborationPanel />
      </div>
    </div>
  );
}