"use client";

import { useState, useEffect } from "react";
import UploadBox from "@/components/UploadBox";
import ComplianceActions from "@/components/ComplianceActions";

// Types for mock JSON structure
interface ComplianceJson {
  guidelines: { category: string; rule: string; value: string | number }[];
  pendingActions: string[];
  feedback: string[];
}

export default function CompliancePage() {
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [data, setData] = useState<ComplianceJson | null>(null);

  // Mock: load compliance.json on mount
  useEffect(() => {
    async function loadJson() {
      // In a real app you’d fetch from /api/compliance/data
      // For now, we’ll simulate with a local import
      const json: ComplianceJson = {
        guidelines: [
          { category: "Trading", rule: "Trading Limit", value: "5,000,000" },
          { category: "Operational", rule: "Report Frequency", value: "Daily" },
          { category: "Risk Management", rule: "Max Leverage", value: "2x" },
        ],
        pendingActions: [
          "Tighten trading limit to 4,000,000",
          "Introduce quarterly compliance audits",
        ],
        feedback: [],
      };
      setData(json);
    }
    loadJson();
  }, []);

  // Mock OpenAI call
  async function analyzePdf(file: File) {
    setPdfName(file.name);

    // Fake delay + mock results
    await new Promise((res) => setTimeout(res, 1000));

    setSummary("This PDF describes new compliance rules for trading activities.");
    setActions([
      "Set new trading limit to SGD 5,000,000",
      "Require daily compliance report submission",
      "Mandate pre-trade approval for derivatives",
    ]);
  }

  function handleDecision(action: string, accepted: boolean, feedback?: string) {
  if (accepted) {
    // store guideline in JSON …
    console.log("ACCEPTED", { action });
  } else {
    // store feedback + action in JSON …
    console.log("DECLINED", { action, feedback });
  }
}


  return (
    <div className="min-h-screen p-6">
      <div className="max-w-6xl mx-auto space-y-6">

      {/* Active Rules Section */}
      {data && (
        <section className="financial-card p-8 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Current Active Rules</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {data.guidelines.map((g, idx) => (
              <div
                key={idx}
                className="border border-blue-200 rounded-xl p-5 bg-white/80 backdrop-blur-sm hover:shadow-md transition-all duration-200 hover:border-blue-300"
              >
                <p className="text-sm text-blue-600 font-medium mb-1">{g.category}</p>
                <p className="font-semibold text-gray-800 mb-2">{g.rule}</p>
                <p className="text-blue-700 font-medium">{g.value}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Pending AI Actions from JSON */}
      {data && data.pendingActions.length > 0 && (
        <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Pending AI-Suggested Actions</h2>
          <ComplianceActions
            actions={data.pendingActions}
            onDecision={handleDecision}
          />
        </section>
      )}

      {/* Upload + new summary/actions */}
      <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
        <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Upload Compliance PDF</h2>
        <UploadBox onFileSelected={analyzePdf} />
      </section>

      {summary && (
        <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Summary</h2>
          <p className="text-gray-700 leading-relaxed bg-blue-50/50 p-4 rounded-lg border border-blue-100">{summary}</p>
        </section>
      )}

      {actions.length > 0 && (
        <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">New Suggested Actions</h2>
          <ComplianceActions actions={actions} onDecision={handleDecision} />
        </section>
      )}
      </div>
    </div>
  );
}
