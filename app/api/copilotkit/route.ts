import { 
  CopilotRuntime, 
  OpenAIAdapter, 
  copilotRuntimeNextJSAppRouterEndpoint 
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

// Initialize the CopilotKit runtime (actions are defined in frontend components)
const copilotKit = new CopilotRuntime();

// Create the API handler with OpenAI integration
const handler = copilotRuntimeNextJSAppRouterEndpoint({
  runtime: copilotKit,
  serviceAdapter: new OpenAIAdapter({ 
    model: "gpt-4",
    apiKey: process.env.OPENAI_API_KEY
  }),
  endpoint: "/api/copilotkit"
});

export const POST = handler.POST;