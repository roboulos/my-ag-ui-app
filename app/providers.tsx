"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CollaborationProvider } from "@/contexts/CollaborationContext";
import { DashboardProvider } from "@/contexts/DashboardContext";

// AG UI Providers with collaboration support
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <DashboardProvider>
        <CollaborationProvider>
          {children}
        </CollaborationProvider>
      </DashboardProvider>
    </CopilotKit>
  );
}