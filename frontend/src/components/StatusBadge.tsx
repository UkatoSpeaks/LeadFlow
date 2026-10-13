import { STATUS_LABELS, type LeadStatus } from "@/lib/types";

const STATUS_STYLES: Record<LeadStatus, { badge: string; dot: string }> = {
  new: { badge: "border-line-strong bg-surface text-body", dot: "bg-muted" },
  contacted: { badge: "border-amber/25 bg-amber-tint text-amber", dot: "bg-amber" },
  qualified: { badge: "border-sky/25 bg-sky-tint text-sky", dot: "bg-sky" },
  proposal_sent: { badge: "border-forest/25 bg-mint text-forest", dot: "bg-forest-600" },
  won: { badge: "border-forest bg-forest text-lime", dot: "bg-lime" },
  lost: { badge: "border-line bg-canvas text-muted line-through", dot: "bg-line-strong" },
};

export default function StatusBadge({ status }: { status: LeadStatus }) {
  const styles = STATUS_STYLES[status];

  return (
    <span className={`label inline-flex items-center gap-1.5 whitespace-nowrap border px-2 py-1 ${styles.badge}`}>
      <span aria-hidden className={`size-1.5 ${styles.dot}`} />
      {STATUS_LABELS[status]}
    </span>
  );
}
