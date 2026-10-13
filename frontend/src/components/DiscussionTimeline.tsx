import { useDiscussions } from "@/hooks/useDiscussions";
import { formatDateTime, formatFollowUp, timeAgo } from "@/lib/dates";
import type { Discussion } from "@/lib/types";

interface DiscussionTimelineProps {
  leadId: number;
  now: Date;
}

function TimelineItem({ discussion, now, latest }: { discussion: Discussion; now: Date; latest: boolean }) {
  return (
    <li className="group relative pb-6 pl-6 last:pb-0">
      {/* The rail joining one entry to the next. */}
      <span aria-hidden className="absolute left-[3px] top-2 h-full w-px bg-line group-last:hidden" />
      <span
        aria-hidden
        className={`absolute left-0 top-1.5 size-[7px] border border-forest ${latest ? "bg-lime" : "bg-surface"}`}
      />
      <p className="label text-muted">
        <time dateTime={discussion.created_at}>{formatDateTime(discussion.created_at)}</time>
        <span aria-hidden> · </span>
        {timeAgo(discussion.created_at, now)}
      </p>
      <p className="mt-1.5 whitespace-pre-wrap break-words text-sm text-ink">{discussion.note}</p>
      {discussion.follow_up_at && (
        <p className="label mt-2 inline-block border border-forest/25 bg-mint px-2 py-1 text-forest">
          Follow-up set · {formatFollowUp(discussion.follow_up_at, now)}
        </p>
      )}
    </li>
  );
}

/** A lead's discussions, newest first (the API returns them in that order). */
export default function DiscussionTimeline({ leadId, now }: DiscussionTimelineProps) {
  const { data: discussions, error, isPending, refetch } = useDiscussions(leadId);

  if (isPending) {
    return (
      <div role="status" aria-label="Loading discussions" className="flex animate-pulse flex-col gap-5">
        {[0, 1, 2].map((row) => (
          <div key={row} className="flex flex-col gap-2 pl-6">
            <div className="h-3 w-44 bg-line" />
            <div className="h-4 w-full bg-line" />
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div role="alert" className="border border-danger/30 bg-danger-tint px-4 py-3 text-sm text-danger">
        <p>Could not load discussions. {error.message}</p>
        <button type="button" onClick={() => refetch()} className="label mt-2 cursor-pointer underline underline-offset-4">
          Try again
        </button>
      </div>
    );
  }

  if (discussions.length === 0) {
    return (
      <p className="border border-dashed border-line-strong px-4 py-8 text-center text-sm text-muted">
        No discussions yet. Log the first one below.
      </p>
    );
  }

  return (
    <ol>
      {discussions.map((discussion, index) => (
        <TimelineItem key={discussion.id} discussion={discussion} now={now} latest={index === 0} />
      ))}
    </ol>
  );
}
