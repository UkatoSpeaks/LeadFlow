import LeadRow, { LEAD_GRID } from "@/components/LeadRow";
import { isDueToday } from "@/lib/dates";
import type { Lead } from "@/lib/types";

interface LeadListProps {
  leads: Lead[];
  now: Date;
  onSelect: (lead: Lead) => void;
}

/** Splits leads into those with a follow-up due today (soonest first) and the rest. */
function pinTodaysFollowUps(leads: Lead[], now: Date): { today: Lead[]; rest: Lead[] } {
  const today: Lead[] = [];
  const rest: Lead[] = [];
  for (const lead of leads) {
    (isDueToday(lead.next_follow_up_at, now) ? today : rest).push(lead);
  }
  today.sort((a, b) => Date.parse(a.next_follow_up_at!) - Date.parse(b.next_follow_up_at!));
  return { today, rest };
}

function ColumnHeader() {
  return (
    <div className={`label hidden border-b border-line bg-canvas px-4 py-2.5 text-muted ${LEAD_GRID} border-l-4 border-l-transparent`}>
      <span>Lead</span>
      <span>Status</span>
      <span>Last discussion</span>
      <span>When</span>
      <span>Follow-up</span>
    </div>
  );
}

export default function LeadList({ leads, now, onSelect }: LeadListProps) {
  const { today, rest } = pinTodaysFollowUps(leads, now);

  return (
    <div className="flex flex-col gap-8">
      {today.length > 0 && (
        <section aria-labelledby="todays-follow-ups">
          <h2 id="todays-follow-ups" className="label mb-3 flex items-center gap-2 text-forest">
            <span aria-hidden className="size-2 border border-forest bg-lime" />
            Today&apos;s follow-ups
            <span className="text-muted">· {today.length}</span>
          </h2>
          <ul className="divide-y divide-mint-strong border border-forest bg-mint/50 shadow-offset">
            {today.map((lead) => (
              <LeadRow key={lead.id} lead={lead} now={now} onSelect={onSelect} />
            ))}
          </ul>
        </section>
      )}

      {rest.length > 0 && (
        <section aria-labelledby="all-leads">
          <h2 id="all-leads" className="label mb-3 flex items-center gap-2 text-muted">
            <span aria-hidden className="size-2 bg-forest" />
            {today.length > 0 ? "Other leads" : "Leads"}
            <span>· {rest.length}</span>
          </h2>
          <div className="border border-line bg-surface">
            <ColumnHeader />
            <ul className="divide-y divide-line">
              {rest.map((lead) => (
                <LeadRow key={lead.id} lead={lead} now={now} onSelect={onSelect} />
              ))}
            </ul>
          </div>
        </section>
      )}
    </div>
  );
}
