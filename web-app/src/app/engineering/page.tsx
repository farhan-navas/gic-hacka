/* eslint-disable @typescript-eslint/no-explicit-any */
// app/page.tsx
"use client";

import { useEffect, useState } from "react";

type Evt =
  | { type: "hello"; data: string }
  | { type: "telemetry"; data: any }
  | { type: "agent_log"; data: string }
  | {
      type: "agent_action";
      data: { name: string; args: any; result?: any; error?: string };
    }
  | { type: "agent_done"; data: { summary: string } };

export default function Page() {
  const [events, setEvents] = useState<Evt[]>([]);
  const [summary, setSummary] = useState<string | null>(null);
  const [status, setStatus] = useState<"disconnected" | "connected">(
    "disconnected"
  );

  useEffect(() => {
    const es = new EventSource("/api/stream");
    es.onopen = () => setStatus("connected");
    es.onmessage = (m) => {
      const e: Evt = JSON.parse(m.data);
      setEvents((prev) => [...prev, e].slice(-200));
      if (e.type === "agent_done") setSummary(e.data.summary);
    };
    es.onerror = () => setStatus("disconnected");
    return () => es.close();
  }, []);

  async function triggerAgent() {
    await fetch("/api/agent", {
      method: "POST",
      body: JSON.stringify({ reason: "manual" }),
    });
  }

  return (
    <main className="p-6 max-w-4xl mx-auto space-y-4">
      <h1 className="text-2xl font-semibold">Ops Agent Dashboard</h1>
      <div className="text-sm text-gray-500">SSE: {status}</div>

      <div className="flex gap-2">
        <button
          onClick={triggerAgent}
          className="px-3 py-2 rounded bg-black text-white"
        >
          Run Agent
        </button>
        <a
          href="/api/stream"
          target="_blank"
          className="text-blue-600 underline"
        >
          Raw stream
        </a>
      </div>

      {summary && (
        <div className="p-3 rounded border bg-green-50">
          <b>Latest diagnosis:</b> {summary}
        </div>
      )}

      <div className="space-y-2">
        {events.map((e, i) => (
          <div key={i} className="p-3 rounded border">
            <div className="text-xs text-gray-500">{e.type}</div>
            <pre className="text-sm overflow-auto">
              {JSON.stringify(e, null, 2)}
            </pre>
          </div>
        ))}
      </div>
    </main>
  );
}
