"use client";

import { Dashboard } from "@/components/dashboard/Dashboard";
import { CollaborationPanel } from "@/components/collaboration/CollaborationPanel";
import { PremiumChatSidebar } from "@/components/chat/PremiumChatSidebar";

export default function Home() {
  return (
    <div className="flex h-screen overflow-hidden">
      {/* Main Content Area with Dashboard - scrollable */}
      <div className="flex-1 overflow-y-auto">
        <Dashboard />
      </div>

      {/* Premium Chat Sidebar - sticky */}
      <PremiumChatSidebar
        instructions={`You are an AI assistant that can read and modify the dashboard state in real-time. 

This is a COLLABORATIVE dashboard where multiple users can work together. When you make changes, all connected users will see them instantly.

You have access to the complete dashboard state including:
- Layout (grid, list, kanban, cards)
- Theme (light, dark)
- Metrics (KPIs with values, trends, visibility)
- Charts (visualizations with types, sizes, data)
- Filters (data filtering options)
- Settings (columns, sidebar, refresh rate)

You can:
1. READ the current state: "What's my current dashboard layout?" or "Show me all visible metrics"
2. MODIFY the state: "Change to list layout" or "Add a revenue metric" or "Hide the sales chart"
3. ANALYZE the data: "What trends do you see?" or "Which metrics are performing best?"
4. COLLABORATE: Your changes are synchronized with all other users in real-time

The dashboard updates instantly when you make changes - no refresh needed!

Try asking things like:
- "What dashboard settings do I currently have?"
- "Change my layout to grid view"
- "Add a new metric for user growth"  
- "Hide all charts except the revenue chart"
- "Switch to dark mode"
- "Set grid to 8 columns"
- "Who else is currently viewing this dashboard?"

Your changes will appear immediately in the main dashboard area and will be synchronized with all other users.`}
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