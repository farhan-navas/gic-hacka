"use client";

import { useEffect, useState } from "react";

interface Props {
  actions: string[];
  onDecision: (action: string, accepted: boolean) => void;
}

export default function ComplianceActions({ actions, onDecision }: Props) {
  // modal state
  const [acceptOpen, setAcceptOpen] = useState(false);
  const [declineOpen, setDeclineOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<string>("");
  const [feedback, setFeedback] = useState("");

  // close on ESC
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setAcceptOpen(false);
        setDeclineOpen(false);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function openAccept(action: string) {
    setCurrentAction(action);
    setAcceptOpen(true);
  }
  function openDecline(action: string) {
    setCurrentAction(action);
    setFeedback("");
    setDeclineOpen(true);
  }

  return (
    <>
      <ul className="space-y-3">
        {actions.map((action, idx) => (
          <li
            key={idx}
            className="flex items-center justify-between border border-border rounded-lg p-4 bg-surface"
          >
            <span>{action}</span>
            <div className="flex gap-3">
              <button
                onClick={() => openAccept(action)}
                className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 cursor-pointer transition"
              >
                Accept
              </button>
              <button
                onClick={() => openDecline(action)}
                className="px-3 py-1.5 rounded-md bg-red-600 text-white text-sm font-medium hover:bg-red-700 cursor-pointer transition"
              >
                Decline
              </button>
            </div>
          </li>
        ))}
      </ul>

      {/* ===== Accept Modal ===== */}
      {acceptOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          onClick={() => setAcceptOpen(false)}
        >
          <div
            className="financial-card w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-lg font-semibold">Action Accepted</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-muted-foreground">You accepted:</p>
              <p className="mt-2 font-medium">{currentAction}</p>
              <p className="mt-3 text-sm text-muted-foreground">
                This will be stored as an active guideline.
              </p>
            </div>
            <div className="border-t border-border px-5 py-4 flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700"
                onClick={() => {
                  setAcceptOpen(false);
                  onDecision(currentAction, true);
                }}
              >
                Confirm
              </button>
              <button
                className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-900 text-sm font-medium hover:bg-gray-300"
                onClick={() => setAcceptOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ===== Decline Modal (with feedback) ===== */}
      {declineOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
          role="dialog"
          aria-modal="true"
          onClick={() => setDeclineOpen(false)}
        >
          <div
            className="financial-card w-full max-w-lg overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="border-b border-border px-5 py-4">
              <h3 className="text-lg font-semibold">Decline Action</h3>
            </div>
            <div className="px-5 py-4">
              <p className="text-muted-foreground">You are declining:</p>
              <p className="mt-2 font-medium">{currentAction}</p>

              <label className="block mt-4 text-sm font-medium">
                Feedback (required)
              </label>
              <textarea
                className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
                rows={4}
                placeholder="Explain why this suggestion should be improved…"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />
            </div>
            <div className="border-t border-border px-5 py-4 flex justify-end gap-2">
              <button
                className="px-3 py-1.5 rounded-md bg-green-600 text-white text-sm font-medium hover:bg-green-700 disabled:opacity-50"
                disabled={!feedback.trim()}
                onClick={() => {
                  // If you later extend onDecision to accept feedback, pass it there.
                  // For now we just call the existing signature and you can persist feedback elsewhere.
                  setDeclineOpen(false);
                  onDecision(currentAction, false);
                  // Optional: dispatch a custom event with feedback for a parent listener
                  // window.dispatchEvent(new CustomEvent("compliance:declineFeedback", { detail: { action: currentAction, feedback: feedback.trim() }}));
                }}
              >
                Submit Feedback
              </button>
              <button
                className="px-3 py-1.5 rounded-md bg-gray-200 text-gray-900 text-sm font-medium hover:bg-gray-300"
                onClick={() => setDeclineOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
