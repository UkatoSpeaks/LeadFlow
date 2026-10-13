import { inputClass } from "@/components/Field";
import { LEAD_STATUSES, STATUS_LABELS, type LeadStatus } from "@/lib/types";

interface StatusSelectProps {
  id?: string;
  value: LeadStatus;
  disabled?: boolean;
  onChange: (status: LeadStatus) => void;
}

export default function StatusSelect({ id, value, disabled = false, onChange }: StatusSelectProps) {
  return (
    <select
      id={id}
      value={value}
      disabled={disabled}
      onChange={(event) => onChange(event.target.value as LeadStatus)}
      className={`${inputClass} cursor-pointer py-2 font-medium`}
    >
      {LEAD_STATUSES.map((status) => (
        <option key={status} value={status}>
          {STATUS_LABELS[status]}
        </option>
      ))}
    </select>
  );
}
