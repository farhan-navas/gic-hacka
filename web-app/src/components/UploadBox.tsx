"use client";

import { useRef } from "react";

interface UploadBoxProps {
  onFileSelected: (file: File) => void;
}

export default function UploadBox({ onFileSelected }: UploadBoxProps) {
  const inputRef = useRef<HTMLInputElement | null>(null);

  function onChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (f && f.type === "application/pdf") {
      onFileSelected(f);
    } else {
      alert("Please select a PDF file.");
    }
  }

  return (
    <div
      className="border border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-surface"
      onClick={() => inputRef.current?.click()}
      role="button"
    >
      <p className="mb-2">Drag & drop or click to select a PDF</p>
      <p className="text-sm text-muted-foreground">PDF only • Max 10MB</p>
      <input
        ref={inputRef}
        type="file"
        accept="application/pdf"
        className="hidden"
        onChange={onChange}
      />
    </div>
  );
}
