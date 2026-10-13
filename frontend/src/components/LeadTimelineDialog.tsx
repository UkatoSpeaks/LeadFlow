"use client";

import { useId, useRef } from "react";

import Dialog from "@/components/Dialog";
import DiscussionForm from "@/components/DiscussionForm";
import DiscussionTimeline from "@/components/DiscussionTimeline";
import FollowUpTag from "@/components/FollowUpTag";
import FormError from "@/components/FormError";
import StatusSelect from "@/components/StatusSelect";
import { useLead, useUpdateLeadStatus } from "@/hooks/useLeads";
import type { Lead } from "@/lib/types";

interface LeadTimelineDialogProps {
  /** The row that was clicked; the dialog then keeps its own fresh copy. */
  lead: Lead;
  now: Date;
  onClose: () => void;
}

export default function LeadTimelineDialog({ lead: clickedLead, now, onClose }: LeadTimelineDialogProps) {
  const { data: lead = clickedLead } = useLead(clickedLead);
  const updateStatus = useUpdateLeadStatus(lead.id);
  const statusId = useId();
  const timeline = useRef<HTMLDivElement>(null);

  const contact = [lead.company, lead.phone].filter(Boolean).join(" · ");

  // The newest discussion is added at the top, so bring the top of the timeline into view:
  // scroll the timeline itself (wide screens) and the dialog around it (small screens).
  function showLatestDiscussion() {
    timeline.current?.scrollTo({ top: 0, behavior: "smooth" });
    timeline.current?.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  return (
    <Dialog eyebrow="Lead timeline" title={lead.name} size="lg" onClose={onClose}>
      <div className="grid shrink-0 gap-4 border-b border-line bg-canvas px-6 py-4 sm:grid-cols-[1fr_auto_auto] sm:items-start sm:gap-8">
        <div className="min-w-0">
          <p className="label text-muted">Contact</p>
          <p className="mt-1.5 truncate text-sm text-ink">{contact || "No company or phone"}</p>
        </div>
        <div>
          <p className="label text-muted">Next follow-up</p>
          <div className="mt-1.5">
            <FollowUpTag followUpAt={lead.next_follow_up_at} now={now} />
          </div>
        </div>
        <div className="sm:w-44">
          <label htmlFor={statusId} className="label text-muted">
            Status
          </label>
          <div className="mt-1.5">
            <StatusSelect
              id={statusId}
              value={lead.status}
              disabled={updateStatus.isPending}
              onChange={(status) => updateStatus.mutate(status)}
            />
          </div>
        </div>
        {updateStatus.error && (
          <div className="sm:col-span-3">
            <FormError message={`Could not update the status. ${updateStatus.error.message}`} />
          </div>
        )}
      </div>

      {/* On small screens the whole dialog scrolls; from "sm" up only the timeline does, keeping the form pinned. */}
      <div ref={timeline} className="shrink-0 px-6 py-6 sm:min-h-40 sm:flex-1 sm:shrink sm:overflow-y-auto">
        <DiscussionTimeline leadId={lead.id} now={now} />
      </div>

      <div className="shrink-0 border-t border-line bg-surface px-6 py-5">
        <DiscussionForm leadId={lead.id} onSaved={showLatestDiscussion} />
      </div>
    </Dialog>
  );
}
