"use client";

import { useState, useEffect } from "react";
import UploadBox from "@/components/UploadBox";
import ComplianceActions from "@/components/ComplianceActions";

// Types for mock JSON structure
interface ComplianceJson {
  guidelines: { category: string; rule: string; value: string | number }[];
  pendingActions: { 
    text: string; 
    category: string; 
    rule: string; 
    value: string | number;
  }[];
  feedback: string[];
}

export default function CompliancePage() {
  const [pdfName, setPdfName] = useState<string | null>(null);
  const [summary, setSummary] = useState<string | null>(null);
  const [actions, setActions] = useState<string[]>([]);
  const [data, setData] = useState<ComplianceJson | null>(null);
  const [contextId, setContextId] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);
  const [isRefining, setIsRefining] = useState<boolean>(false);

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
          {
            text: "Tighten trading limit to 4,000,000",
            category: "Trading",
            rule: "Trading Limit", 
            value: "4,000,000"
          },
          {
            text: "Introduce quarterly compliance audits",
            category: "Operational",
            rule: "Audit Frequency",
            value: "Quarterly"
          },
          {
            text: "Enforce strong encryption both at rest and in transit to comply with PDPA and GDPR standards.",
            category: "Data Privacy & Protection",
            rule: "Personal Data Encryption",
            value: "PDPA and GDPR standards"
          },
        ],
        feedback: [],
      };
      setData(json);
    }
    loadJson();
  }, []);

  // API call to analyze PDF
  async function analyzePdf(file: File) {
    setPdfName(file.name);
    setIsAnalyzing(true);
    
    try {
      const form = new FormData();
      form.append("file", file);

      const res = await fetch("/api/compliance/analyze", { method: "POST", body: form });
      
      // Check if response is ok first
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Check content type to ensure it's JSON
      const contentType = res.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response");
      }
      
      const json = await res.json();
      
      setContextId(json.id);                // keep for refinement
      setSummary(json.summary);
      setActions(json.suggested_actions);   // new suggestions
    } catch (error) {
      console.error("Error analyzing PDF:", error);
      // Fallback to mock data for development
      console.log("Using mock data fallback from docSummary.json");
      await new Promise((res) => setTimeout(res, 1000));
      
      try {
        // Load the docSummary.json file
        const response = await fetch('/data/docSummary.json');
        const docData = await response.json();
        
        // Set summary from summary_points
        const summaryText = docData.summary_points.join(' ');
        setSummary(summaryText);
        
        // Set actions from actionable_steps and add them to pending actions
        const newActions = docData.actionable_steps.map((step: any) => step.step);
        setActions(newActions);
        
        // Also add these actions to the pending actions with proper structure
        const newPendingActions = docData.actionable_steps.map((step: any) => ({
          text: step.step,
          category: step.linked_rule.category,
          rule: step.linked_rule.rule,
          value: step.linked_rule.value
        }));
        
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            pendingActions: [...prev.pendingActions, ...newPendingActions]
          };
        });
        
      } catch (fallbackError) {
        console.error("Error loading docSummary.json:", fallbackError);
        // Ultimate fallback if JSON loading fails
        setSummary("This PDF describes new compliance rules for trading activities. (Using basic fallback - JSON not available)");
        setActions([
          "Set new trading limit to SGD 5,000,000",
          "Require daily compliance report submission",
          "Mandate pre-trade approval for derivatives",
        ]);
      }
    } finally {
      setIsAnalyzing(false);
    }
  }

  // Accept action via API
  async function handleAccept(action: string) {
    try {
      const res = await fetch("/api/compliance/accept", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();
        console.log("Action accepted:", result);
      }
      
      // Find the pending action that was accepted
      const pendingAction = data?.pendingActions.find(pa => pa.text === action);
      
      if (pendingAction && data) {
        // Check if a rule with the same category and rule name already exists
        const existingRuleIndex = data.guidelines.findIndex(
          g => g.category === pendingAction.category && g.rule === pendingAction.rule
        );
        
        if (existingRuleIndex !== -1) {
          // Update existing rule with new value
          setData(prev => {
            if (!prev) return prev;
            const newGuidelines = [...prev.guidelines];
            newGuidelines[existingRuleIndex] = {
              category: pendingAction.category,
              rule: pendingAction.rule,
              value: pendingAction.value
            };
            return {
              ...prev,
              guidelines: newGuidelines,
              pendingActions: prev.pendingActions.filter(pa => pa.text !== action)
            };
          });
        } else {
          // Add new rule to guidelines
          setData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              guidelines: [...prev.guidelines, {
                category: pendingAction.category,
                rule: pendingAction.rule,
                value: pendingAction.value
              }],
              pendingActions: prev.pendingActions.filter(pa => pa.text !== action)
            };
          });
        }
      }
      
      // Remove from current actions (for new suggested actions from PDF upload)
      setActions(prev => prev.filter(a => a !== action));
      
    } catch (error) {
      console.error("Error accepting action:", error);
      console.log("Using fallback behavior");
      
      // Fallback: still try to update local state
      const pendingAction = data?.pendingActions.find(pa => pa.text === action);
      
      if (pendingAction && data) {
        const existingRuleIndex = data.guidelines.findIndex(
          g => g.category === pendingAction.category && g.rule === pendingAction.rule
        );
        
        if (existingRuleIndex !== -1) {
          setData(prev => {
            if (!prev) return prev;
            const newGuidelines = [...prev.guidelines];
            newGuidelines[existingRuleIndex] = {
              category: pendingAction.category,
              rule: pendingAction.rule,
              value: pendingAction.value
            };
            return {
              ...prev,
              guidelines: newGuidelines,
              pendingActions: prev.pendingActions.filter(pa => pa.text !== action)
            };
          });
        } else {
          setData(prev => {
            if (!prev) return prev;
            return {
              ...prev,
              guidelines: [...prev.guidelines, {
                category: pendingAction.category,
                rule: pendingAction.rule,
                value: pendingAction.value
              }],
              pendingActions: prev.pendingActions.filter(pa => pa.text !== action)
            };
          });
        }
      }
      
      // Fallback: just remove from UI for now
      setActions(prev => prev.filter(a => a !== action));
    }
  }

  // Decline action with feedback via API
  async function handleDecline(action: string, feedback: string) {
    try {
      const res = await fetch("/api/compliance/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextId,                   // returned by analyze
          previousActions: [action],
          feedback,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();
        console.log("Action declined with feedback:", result);
      }
      
      // Remove the declined action from pending actions
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingActions: prev.pendingActions.filter(pa => pa.text !== action)
        };
      });
      
      // Remove the declined action from new suggested actions
      setActions(prev => prev.filter(a => a !== action));
      
    } catch (error) {
      console.error("Error declining action:", error);
      console.log("Using fallback behavior");
      
      // Fallback: still remove from local state
      setData(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          pendingActions: prev.pendingActions.filter(pa => pa.text !== action)
        };
      });
      
      // Fallback: just remove from UI for now
      setActions(prev => prev.filter(a => a !== action));
    }
  }

  function handleDecision(action: string, accepted: boolean, feedback?: string) {
    if (accepted) {
      handleAccept(action);
    } else {
      if (feedback) {
        handleDeclineWithRefinement(action, feedback);
      } else {
        // If no feedback provided, just remove the action from both pending and new actions
        setData(prev => {
          if (!prev) return prev;
          return {
            ...prev,
            pendingActions: prev.pendingActions.filter(pa => pa.text !== action)
          };
        });
        setActions(prev => prev.filter(a => a !== action));
      }
    }
  }

  // Handle decline with feedback and trigger re-analysis
  async function handleDeclineWithRefinement(action: string, feedback: string) {
    try {
      // Clear current summary and actions, show refinement loading
      setSummary(null);
      setActions([]);
      setIsRefining(true);

      // Call the refine API
      const res = await fetch("/api/compliance/refine", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contextId,
          previousActions: [action],
          feedback,
        }),
      });
      
      if (!res.ok) {
        throw new Error(`HTTP ${res.status}: ${res.statusText}`);
      }
      
      // Check if response is JSON
      const contentType = res.headers.get("content-type");
      if (contentType && contentType.includes("application/json")) {
        const result = await res.json();
        console.log("Refinement result:", result);
        
        // Set the refined summary and actions
        setSummary(result.summary || "");
        setActions(result.suggested_actions || []);
      }
      
    } catch (error) {
      console.error("Error refining with feedback:", error);
      console.log("Using fallback refinement behavior");
      
      // Fallback: simulate re-analysis with updated content
      await new Promise((res) => setTimeout(res, 1500));
      
      try {
        // Load the docSummary.json file for fallback
        const response = await fetch('/data/docSummary.json');
        const docData = await response.json();
        
        // Set refined summary with feedback context
        const refinedSummary = `Based on your feedback, here's an updated analysis: ${docData.summary_points.slice(0, 5).join(' ')} (Refined based on feedback - API not available)`;
        setSummary(refinedSummary);
        
        // Set refined actions (excluding the declined one and adding some new ones)
        const refinedActions = docData.actionable_steps
          .filter((step: any) => step.step !== action)
          .slice(0, 3)
          .map((step: any) => step.step);
        
        setActions(refinedActions);
        
      } catch (fallbackError) {
        console.error("Error in fallback refinement:", fallbackError);
        setSummary("Based on your feedback, we've refined our analysis. (Basic fallback - JSON not available)");
        setActions([
          "Implement enhanced trading controls based on feedback",
          "Establish improved compliance monitoring framework",
          "Deploy advanced risk assessment protocols",
        ]);
      }
    } finally {
      setIsRefining(false);
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
            actions={data.pendingActions.map(action => action.text)}
            onDecision={handleDecision}
            requireFeedbackOnDecline={false}
          />
        </section>
      )}

      {/* Upload + new summary/actions */}
      <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
        <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Upload Compliance PDF</h2>
        <UploadBox onFileSelected={analyzePdf} />
      </section>

      {/* Loading State for Initial Analysis */}
      {isAnalyzing && (
        <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-blue-900 font-medium">
              Generating Summary and Actionable Steps...
            </div>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <p className="text-gray-600 text-sm text-center">
              Please wait while we analyze your compliance document and generate tailored recommendations.
            </p>
          </div>
        </section>
      )}

      {/* Loading State for Refinement with Feedback */}
      {isRefining && (
        <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <div className="flex items-center justify-center space-x-3">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <div className="text-blue-900 font-medium">
              Generating Summary and Suggested Actions with Feedback Given...
            </div>
          </div>
          <div className="bg-blue-50/50 p-4 rounded-lg border border-blue-100">
            <p className="text-gray-600 text-sm text-center">
              We're refining our analysis based on your feedback to provide better recommendations.
            </p>
          </div>
        </section>
      )}

      {summary && (
        <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">Summary</h2>
          <p className="text-gray-700 leading-relaxed bg-blue-50/50 p-4 rounded-lg border border-blue-100">{summary}</p>
        </section>
      )}

      {actions.length > 0 && (
        <section className="financial-card p-8 mb-6 space-y-6 bg-gradient-to-br from-white to-blue-50 border border-blue-100 shadow-lg">
          <h2 className="text-xl font-semibold text-blue-900 border-b border-blue-200 pb-2">New Suggested Actions</h2>
          <ComplianceActions 
            actions={actions} 
            onDecision={handleDecision}
            requireFeedbackOnDecline={true}
          />
        </section>
      )}
      </div>
    </div>
  );
}
