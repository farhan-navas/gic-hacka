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
  // Hardcoded engineering metrics
  const metrics = [
    { name: "System Uptime", value: "99.98%", status: "good" },
    { name: "Error Rate", value: "0.02%", status: "good" },
    { name: "Build Success", value: "97%", status: "warning" },
    { name: "Deployment Frequency", value: "5/week", status: "good" },
    { name: "Incident Response Time", value: "12 min", status: "good" },
    { name: "Open Issues", value: "3", status: "warning" },
  ];

  // --- Ops Agent Dashboard logic ---
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
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Top Section */}
        <section className="financial-card p-8 space-y-4 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h1 className="text-2xl font-bold text-blue-900">
            Engineering Metrics Dashboard
          </h1>
          <p className="text-gray-700 text-lg">
            Overview of key engineering metrics and system health for the
            current release cycle.
          </p>
        </section>
        {/* Metrics Cards */}
        <section className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">
            Current Metrics
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {metrics.map((m, idx) => (
              <div
                key={idx}
                className={`border rounded-xl p-5 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 ${
                  m.status === "good" ? "border-green-300" : "border-yellow-300"
                }`}
              >
                <p className="font-semibold text-gray-800 mb-2">{m.name}</p>
                <p
                  className={`text-lg font-bold ${
                    m.status === "good" ? "text-green-700" : "text-yellow-700"
                  }`}
                >
                  {m.value}
                </p>
                <span
                  className={`inline-block mt-2 px-2 py-1 rounded text-xs ${
                    m.status === "good"
                      ? "bg-green-100 text-green-800"
                      : "bg-yellow-100 text-yellow-800"
                  }`}
                >
                  {m.status === "good" ? "Healthy" : "Attention"}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Ops Agent Dashboard Section */}
        <section className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">
            Ops Agent Dashboard
          </h2>
          <div className="text-sm text-gray-500 mb-2">SSE: {status}</div>
          <div className="flex gap-2 mb-4">
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
            <div className="p-3 rounded border bg-green-50 mb-4">
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
        </section>
      </div>
    </div>
  );
}
