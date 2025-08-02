import { 
  CopilotRuntime, 
  OpenAIAdapter, 
  copilotRuntimeNextJSAppRouterEndpoint 
} from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const runtime = new CopilotRuntime();

export async function POST(req: NextRequest) {
  const { handleRequest } = copilotRuntimeNextJSAppRouterEndpoint({
    runtime,
    serviceAdapter: new OpenAIAdapter({ 
      model: "gpt-4o-mini",
      apiKey: process.env.OPENAI_API_KEY!
    }),
    endpoint: "/api/copilotkit"
  });

  return handleRequest(req);
}