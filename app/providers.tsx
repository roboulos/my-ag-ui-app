"use client";

import { CopilotKit } from "@copilotkit/react-core";
import { CopilotSidebar } from "@copilotkit/react-ui";
import "@copilotkit/react-ui/styles.css";

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <CopilotKit runtimeUrl="/api/copilotkit">
      <CopilotSidebar 
        defaultOpen={true}
        labels={{
          title: "AG UI Assistant",
          initial: "Hi! I'm your AG UI assistant. I can help you interact with the application, update messages, and manage the counter. Try asking me to change the message or increment the counter!"
        }}
        instructions="You are an AG UI assistant that helps users interact with the application. You can update messages and manage the counter. Be helpful and demonstrate the power of agent-user interaction."
      >
        {children}
      </CopilotSidebar>
    </CopilotKit>
  );
}