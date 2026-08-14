"use client";

import { useState, useTransition } from "react";
import type { ActionResult } from "@/lib/errors";

// Confirmation dialog with a validated decision-note field. The note length is
// checked client-side for usability only; the server re-validates every input.
export function ActionDialog({
  triggerLabel,
  title,
  description,
  confirmLabel,
  requireNote = true,
  noteLabel = "Decision note",
  tone = "primary",
  action,
  disabled = false,
  disabledReason,
}: {
  triggerLabel: string;
  title: string;
  description?: string;
  confirmLabel: string;
  requireNote?: boolean;
  noteLabel?: string;
  tone?: "primary" | "danger";
  action: (note: string) => Promise<ActionResult>;
  disabled?: boolean;
  disabledReason?: string;
}) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState("");
  const [result, setResult] = useState<ActionResult | null>(null);
  const [pending, startTransition] = useTransition();

  const noteTooShort = requireNote && note.trim().length < 10;

  function submit() {
    setResult(null);
    startTransition(async () => {
      const res = await action(note.trim());
      setResult(res);
      if (res.ok) {
        setOpen(false);
        setNote("");
      }
    });
  }

  const toneClass =
    tone === "danger"
      ? "bg-red-600 hover:bg-red-700 focus:ring-red-500"
      : "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500";

  return (
    <div className="inline-block">
      <button
        type="button"
        onClick={() => {
          setResult(null);
          setOpen(true);
        }}
        disabled={disabled}
        title={disabled ? disabledReason : undefined}
        className={`rounded-md px-3 py-1.5 text-sm font-medium text-white focus:ring-2 focus:ring-offset-1 focus:outline-none ${toneClass} disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500`}
      >
        {triggerLabel}
      </button>
      {disabled && disabledReason ? (
        <p className="mt-1 text-xs text-gray-500">{disabledReason}</p>
      ) : null}
      {result ? (
        <p
          role="status"
          className={`mt-1 text-xs ${result.ok ? "text-green-700" : "text-red-700"}`}
        >
          {result.ok ? result.message : result.error}
        </p>
      ) : null}
      {open ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={title}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
        >
          <div className="w-full max-w-md rounded-lg bg-white p-5 shadow-xl">
            <h2 className="text-base font-semibold text-gray-900">{title}</h2>
            {description ? <p className="mt-1 text-sm text-gray-600">{description}</p> : null}
            {requireNote ? (
              <div className="mt-3 flex flex-col gap-1">
                <label htmlFor="decision-note" className="text-xs font-medium text-gray-600">
                  {noteLabel} (minimum 10 characters)
                </label>
                <textarea
                  id="decision-note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  rows={3}
                  className="rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                {noteTooShort && note.length > 0 ? (
                  <p className="text-xs text-red-600">
                    A decision note of at least 10 characters is required.
                  </p>
                ) : null}
              </div>
            ) : null}
            {result && !result.ok ? (
              <p role="alert" className="mt-2 text-sm text-red-700">
                {result.error}
              </p>
            ) : null}
            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium text-gray-700 hover:bg-gray-50 focus:ring-2 focus:ring-gray-400 focus:outline-none"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={submit}
                disabled={pending || noteTooShort}
                className={`rounded-md px-3 py-1.5 text-sm font-medium text-white focus:ring-2 focus:ring-offset-1 focus:outline-none ${toneClass} disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500`}
              >
                {pending ? "Working…" : confirmLabel}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
