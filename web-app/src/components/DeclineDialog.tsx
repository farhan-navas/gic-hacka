"use client";

import { useState } from "react";
import Modal from "./Modal";

interface DeclineDialogProps {
  open: boolean;
  actionText: string;
  onClose: () => void;
  onSubmit: (feedback: string) => void;
}

export default function DeclineDialog({ open, actionText, onClose, onSubmit }: DeclineDialogProps) {
  const [feedback, setFeedback] = useState("");

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Decline Action"
      footer={
        <>
          <button
            className="px-3 py-1.5 rounded-md bg-danger text-danger-foreground text-sm font-medium hover:opacity-90"
            onClick={() => onSubmit(feedback.trim())}
          >
            Submit Feedback
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-sm font-medium hover:opacity-90"
            onClick={onClose}
          >
            Cancel
          </button>
        </>
      }
    >
      <p className="text-muted-foreground">You are declining:</p>
      <p className="mt-2 font-medium">{actionText}</p>

      <label className="block mt-4 text-sm font-medium">Feedback (required)</label>
      <textarea
        className="mt-2 w-full rounded-md border border-border bg-surface px-3 py-2 outline-none focus:ring-2 focus:ring-ring"
        rows={4}
        placeholder="Explain why this suggestion should be improved…"
        value={feedback}
        onChange={(e) => setFeedback(e.target.value)}
      />
    </Modal>
  );
}
