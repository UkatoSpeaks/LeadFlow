interface ListStateProps {
  title: string;
  message: string;
  tone?: "neutral" | "error";
  action?: { label: string; onClick: () => void };
}

/** Placeholder shown instead of the list: nothing to show, or the request failed. */
export default function ListState({ title, message, tone = "neutral", action }: ListStateProps) {
  const error = tone === "error";

  return (
    <div
      role={error ? "alert" : "status"}
      className={`flex flex-col items-center gap-2 border px-6 py-14 text-center ${
        error ? "border-danger/30 bg-danger-tint" : "border-dashed border-line-strong bg-surface"
      }`}
    >
      <p className={`text-lg font-semibold ${error ? "text-danger" : "text-ink"}`}>{title}</p>
      <p className="max-w-md text-sm text-body">{message}</p>
      {action && (
        <button
          type="button"
          onClick={action.onClick}
          className="label mt-3 cursor-pointer border border-forest bg-surface px-4 py-2.5 text-forest transition-colors hover:bg-forest hover:text-lime focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest"
        >
          {action.label}
        </button>
      )}
    </div>
  );
}

export function ListSkeleton({ rows = 5 }: { rows?: number }) {
  return (
    <div role="status" aria-label="Loading leads" className="divide-y divide-line border border-line bg-surface">
      {Array.from({ length: rows }, (_, index) => (
        <div key={index} className="flex animate-pulse items-center gap-5 px-5 py-5">
          <div className="h-4 w-40 bg-line" />
          <div className="h-4 w-24 bg-line" />
          <div className="hidden h-4 flex-1 bg-line md:block" />
          <div className="hidden h-4 w-28 bg-line md:block" />
        </div>
      ))}
    </div>
  );
}
