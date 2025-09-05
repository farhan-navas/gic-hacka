"use client";

import Modal from "./Modal";

interface AcceptDialogProps {
  open: boolean;
  actionText: string;
  onClose: () => void;
  onConfirm: () => void;
}

export default function AcceptDialog({ open, actionText, onClose, onConfirm }: AcceptDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Action Accepted"
      footer={
        <>
          <button
            className="px-3 py-1.5 rounded-md bg-success text-success-foreground text-sm font-medium hover:opacity-90"
            onClick={onConfirm}
          >
            Confirm
          </button>
          <button
            className="px-3 py-1.5 rounded-md bg-secondary text-foreground text-sm font-medium hover:opacity-90"
            onClick={onClose}
          >
            Close
          </button>
        </>
      }
    >
      <p className="text-muted-foreground">You accepted:</p>
      <p className="mt-2 font-medium">{actionText}</p>
      <p className="mt-3 text-sm text-muted-foreground">
        This will be stored as an active guideline (e.g., <em>tradingLimit</em> updated).
      </p>
    </Modal>
  );
}
