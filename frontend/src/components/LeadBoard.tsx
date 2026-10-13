"use client";

import { useState } from "react";

import AddLeadDialog from "@/components/AddLeadDialog";
import Button from "@/components/Button";
import Header from "@/components/Header";
import LeadList from "@/components/LeadList";
import LeadTimelineDialog from "@/components/LeadTimelineDialog";
import ListState, { ListSkeleton } from "@/components/ListState";
import SearchBar from "@/components/SearchBar";
import StatusFilter from "@/components/StatusFilter";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { useLeads } from "@/hooks/useLeads";
import { useNow } from "@/hooks/useNow";
import type { Lead, LeadStatus } from "@/lib/types";

/** The single screen of the app: toolbar, pinned follow-ups and the lead list. */
export default function LeadBoard() {
  const [status, setStatus] = useState<LeadStatus | undefined>();
  const [search, setSearch] = useState("");
  const [isAddingLead, setIsAddingLead] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const debouncedSearch = useDebouncedValue(search.trim());
  const now = useNow();

  const { data: leads, error, isPending, isPlaceholderData, refetch } = useLeads({
    status,
    search: debouncedSearch || undefined,
  });

  const isFiltered = Boolean(status || debouncedSearch);

  function clearFilters() {
    setStatus(undefined);
    setSearch("");
  }

  return (
    <>
      <Header>
        <Button onClick={() => setIsAddingLead(true)}>
          <span aria-hidden>+</span> Add lead
        </Button>
      </Header>

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6">
        <div>
          <p className="label text-forest-600">Your pipeline</p>
          <h1 className="mt-2 text-4xl font-semibold tracking-tight text-ink sm:text-5xl">Every lead, one screen.</h1>
          <p className="mt-3 max-w-2xl text-body">
            Track where each lead stands, log every discussion and never miss a follow-up.
          </p>
        </div>

        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <StatusFilter value={status} onChange={setStatus} />
          <SearchBar value={search} onChange={setSearch} />
        </div>

        {isPending || !now ? (
          <ListSkeleton />
        ) : error ? (
          <ListState
            tone="error"
            title="Could not load leads"
            message={error.message}
            action={{ label: "Try again", onClick: () => refetch() }}
          />
        ) : leads.length === 0 ? (
          isFiltered ? (
            <ListState
              title="No leads match"
              message="Nothing fits the current status filter and search."
              action={{ label: "Clear filters", onClick: clearFilters }}
            />
          ) : (
            <ListState
              title="No leads yet"
              message="Add your first lead to start tracking discussions."
              action={{ label: "Add lead", onClick: () => setIsAddingLead(true) }}
            />
          )
        ) : (
          // Dimmed while a new filter or search is loading over the previous results.
          <div className={isPlaceholderData ? "opacity-60 transition-opacity" : "transition-opacity"}>
            <LeadList leads={leads} now={now} onSelect={setSelectedLead} />
          </div>
        )}
      </main>

      {selectedLead && now && (
        // Keyed by lead so each one opens with a fresh form.
        <LeadTimelineDialog key={selectedLead.id} lead={selectedLead} now={now} onClose={() => setSelectedLead(null)} />
      )}

      {isAddingLead && (
        <AddLeadDialog
          onClose={() => setIsAddingLead(false)}
          onCreated={() => {
            // Clear the filters so the new lead is visible wherever the user was.
            clearFilters();
            setIsAddingLead(false);
          }}
        />
      )}
    </>
  );
}
