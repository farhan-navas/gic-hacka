/* eslint-disable @typescript-eslint/no-explicit-any */
// lib/agent.ts (alt)
import OpenAI from "openai";
import { bus } from "./bus";

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });
const FASTAPI_BASE =
  "2025-app-8-http-2027981724.ap-southeast-1.elb.amazonaws.com";

const tools = {
  get_health: async () => {
    try {
      const response = await fetch(`${FASTAPI_BASE}/health`);
      return await response.json();
    } catch (error) {
      return { error: "Failed to fetch health", details: error instanceof Error ? error.message : String(error) };
    }
  },
  metrics: async () => {
    try {
      const response = await fetch(`${FASTAPI_BASE}/metrics`);
      return await response.json();
    } catch (error) {
      return { error: "Failed to fetch metrics", details: error instanceof Error ? error.message : String(error) };
    }
  },
  recent_errors: async (args: any) => {
    try {
      const response = await fetch(
        `${FASTAPI_BASE}/errors?since=${encodeURIComponent(args.since)}`
      );
      return await response.json();
    } catch (error) {
      return { error: "Failed to fetch recent errors", details: error instanceof Error ? error.message : String(error) };
    }
  },
};

export async function runAgentOnce(trigger?: any) {
  // 1) ask model what to do
  const sys = `You are an SRE assistant. Think in short steps. Prefer at most 3 tool calls. Output a brief final summary.`;
  const toolResults: any[] = [];

  // loop max 3
  for (let i = 0; i < 3; i++) {
    const resp = await client.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: sys },
        { role: "user", content: `Telemetry: ${JSON.stringify(trigger)}` },
        ...(toolResults.length
          ? [
              {
                role: "tool",
                content: JSON.stringify(toolResults),
                name: "results",
              } as any,
            ]
          : []),
      ],
      tools: [
        {
          type: "function",
          function: {
            name: "get_health",
            parameters: { type: "object", properties: {} },
          },
        },
        {
          type: "function",
          function: {
            name: "metrics",
            parameters: { type: "object", properties: {} },
          },
        },
        {
          type: "function",
          function: {
            name: "recent_errors",
            parameters: {
              type: "object",
              properties: { since: { type: "string" } },
              required: ["since"],
            },
          },
        },
      ],
      tool_choice: "auto",
    });

    const call = resp.choices[0].message.tool_calls?.[0];
    if (!call || call.type !== "function") {
      const final = resp.choices[0].message.content ?? "No issues found.";
      bus.emitEvent({ type: "agent_done", data: { summary: final } });
      return { summary: final };
    }

    const name = call.function.name as keyof typeof tools;
    const args = JSON.parse(call.function.arguments || "{}");
    bus.emitEvent({ type: "agent_action", data: { name, args } });
    const result = await (tools[name] as any)(args);
    bus.emitEvent({ type: "agent_action", data: { name, args, result } });
    toolResults.push({ name, args, result });
  }

  const summary = "Reached tool-call limit; see actions above.";
  bus.emitEvent({ type: "agent_done", data: { summary } });
  return { summary };
}
