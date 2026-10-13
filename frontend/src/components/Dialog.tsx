"use client";

import { useEffect, useId, useRef } from "react";

interface DialogProps {
  eyebrow: string;
  title: string;
  onClose: () => void;
  size?: "md" | "lg";
  children: React.ReactNode;
}

const SIZES = { md: "max-w-md", lg: "max-w-2xl" };

/**
 * A modal built on the native <dialog>, which provides the focus trap, Escape
 * to close and the backdrop. Mount it to open it, unmount it to close it.
 */
export default function Dialog({ eyebrow, title, onClose, size = "md", children }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (dialog && !dialog.open) dialog.showModal();
    return () => dialog?.close();
  }, []);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      // Escape fires "cancel"; route it through onClose so the parent stays the owner of the open state.
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      // A click that lands on the dialog element itself is a click on the backdrop.
      onClick={(event) => {
        if (event.target === ref.current) onClose();
      }}
      className={`m-auto w-[calc(100%-2rem)] ${SIZES[size]} max-h-[calc(100dvh-2rem)] border border-forest bg-surface p-0 text-body shadow-offset backdrop:bg-ink/55`}
    >
      <div className="flex max-h-[calc(100dvh-2rem)] flex-col">
        <div className="flex items-start justify-between gap-4 border-b border-line px-6 py-5">
          <div className="min-w-0">
            <p className="label text-forest-600">{eyebrow}</p>
            <h2 id={titleId} className="mt-1.5 truncate text-2xl font-semibold tracking-tight text-ink">
              {title}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="-mr-2 -mt-1 grid size-9 shrink-0 cursor-pointer place-items-center text-muted transition-colors hover:bg-mint hover:text-forest focus-visible:outline-2 focus-visible:outline-forest"
          >
            <svg aria-hidden viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.8" className="size-4">
              <path d="M4 4l12 12M16 4L4 16" strokeLinecap="square" />
            </svg>
          </button>
        </div>
        <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">{children}</div>
      </div>
    </dialog>
  );
}
