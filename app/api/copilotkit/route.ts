import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from "@copilotkit/runtime";
import { NextRequest } from "next/server";

const copilotKit = new CopilotRuntime();

const handler = copilotRuntimeNextJSAppRouterEndpoint({
  runtime: copilotKit,
  serviceAdapter: new OpenAIAdapter({ model: "gpt-4" }),
  endpoint: "/api/copilotkit",
});

export const POST = (req: NextRequest) => {
  return handler.POST(req);
};