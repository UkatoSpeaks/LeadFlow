import FollowUpTag from "@/components/FollowUpTag";
import StatusBadge from "@/components/StatusBadge";
import { isOverdue, timeAgo } from "@/lib/dates";
import type { Lead } from "@/lib/types";

// Shared by the rows and the column header so the columns line up.
export const LEAD_GRID = "md:grid md:grid-cols-[minmax(0,1.3fr)_9.5rem_minmax(0,2fr)_6rem_11.5rem] md:items-center md:gap-5";

interface LeadRowProps {
  lead: Lead;
  now: Date;
  onSelect: (lead: Lead) => void;
}

export default function LeadRow({ lead, now, onSelect }: LeadRowProps) {
  const overdue = isOverdue(lead.next_follow_up_at, now);

  return (
    <li>
      <button
        type="button"
        onClick={() => onSelect(lead)}
        className={`flex w-full cursor-pointer flex-col gap-2.5 border-l-4 px-4 py-4 text-left transition-colors hover:bg-mint/60 focus-visible:bg-mint/60 focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-forest ${LEAD_GRID} ${
          overdue ? "border-l-danger" : "border-l-transparent"
        }`}
      >
        <span className="flex items-start justify-between gap-3 md:block">
          <span className="min-w-0">
            <span className="block truncate font-semibold text-ink">{lead.name}</span>
            <span className="block truncate text-sm text-muted">{lead.company ?? "No company"}</span>
          </span>
          <span className="md:hidden">
            <StatusBadge status={lead.status} />
          </span>
        </span>

        <span className="hidden md:block">
          <StatusBadge status={lead.status} />
        </span>

        <span className={`line-clamp-2 text-sm ${lead.last_note ? "text-body" : "text-muted italic"}`}>
          {lead.last_note ?? "No discussions yet"}
        </span>

        <span className="label text-muted">
          {lead.last_discussion_at ? (
            <time dateTime={lead.last_discussion_at}>{timeAgo(lead.last_discussion_at, now)}</time>
          ) : (
            <span className="hidden md:inline">—</span>
          )}
        </span>

        <FollowUpTag followUpAt={lead.next_follow_up_at} now={now} />
      </button>
    </li>
  );
}
