import { useId } from "react";

// Shared by every text input, textarea and select so the form controls match.
export const inputClass =
  "w-full border border-line-strong bg-surface px-3 py-2.5 text-sm text-ink placeholder:text-muted focus:border-forest focus:outline-2 focus:outline-offset-0 focus:outline-forest/25 aria-invalid:border-danger aria-invalid:focus:outline-danger/25 disabled:opacity-60";

interface FieldProps {
  label: string;
  optional?: boolean;
  error?: string;
  /** Receives the ids to wire the control to its label and error message. */
  children: (control: { id: string; "aria-invalid": boolean; "aria-describedby": string | undefined }) => React.ReactNode;
}

export default function Field({ label, optional = false, error, children }: FieldProps) {
  const id = useId();
  const errorId = `${id}-error`;

  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={id} className="label flex items-center justify-between text-body">
        {label}
        {optional && <span className="text-muted">Optional</span>}
      </label>
      {children({ id, "aria-invalid": Boolean(error), "aria-describedby": error ? errorId : undefined })}
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
