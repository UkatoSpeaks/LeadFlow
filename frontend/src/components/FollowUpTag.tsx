import { formatFollowUp, isDueToday, isOverdue } from "@/lib/dates";

interface FollowUpTagProps {
  followUpAt: string | null;
  now: Date;
}

/** The lead's next follow-up: red once overdue, green while due today, plain otherwise. */
export default function FollowUpTag({ followUpAt, now }: FollowUpTagProps) {
  if (!followUpAt) {
    return <span className="text-sm text-muted">No follow-up</span>;
  }

  const overdue = isOverdue(followUpAt, now);
  const dueToday = isDueToday(followUpAt, now);
  const tone = overdue ? "text-danger" : dueToday ? "text-forest" : "text-body";

  return (
    <span className={`inline-flex flex-col items-start gap-1 text-sm font-medium ${tone}`}>
      {overdue && <span className="label border border-danger/30 bg-danger-tint px-1.5 py-0.5">Overdue</span>}
      <time dateTime={followUpAt}>{formatFollowUp(followUpAt, now)}</time>
    </span>
  );
}
