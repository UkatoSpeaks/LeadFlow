import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/types";

interface StatusFilterProps {
  value: LeadStatus | undefined;
  onChange: (status: LeadStatus | undefined) => void;
}

const OPTIONS: { value: LeadStatus | undefined; label: string }[] = [
  { value: undefined, label: "All" },
  ...LEAD_STATUSES.map((status) => ({ value: status, label: STATUS_LABELS[status] })),
];

export default function StatusFilter({ value, onChange }: StatusFilterProps) {
  return (
    <div role="group" aria-label="Filter by status" className="flex flex-wrap gap-2">
      {OPTIONS.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.label}
            type="button"
            aria-pressed={active}
            onClick={() => onChange(option.value)}
            className={`label cursor-pointer border px-3 py-2 transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-forest ${
              active
                ? "border-forest bg-forest text-lime shadow-offset-sm"
                : "border-line bg-surface text-body hover:border-forest hover:text-forest"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
