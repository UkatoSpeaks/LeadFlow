import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { Lead, LeadCreateInput, LeadFilters, LeadStatus } from "@/lib/types";

// Every lead-related query key starts with "leads", so invalidating leadKeys.all
// refreshes the list and any open timeline together.
export const leadKeys = {
  all: ["leads"] as const,
  list: (filters: LeadFilters) => ["leads", "list", filters] as const,
  detail: (leadId: number) => ["leads", leadId, "detail"] as const,
  discussions: (leadId: number) => ["leads", leadId, "discussions"] as const,
};

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: leadKeys.list(filters),
    queryFn: () => api.listLeads(filters),
    // Keep showing the current rows while a new filter or search loads.
    placeholderData: keepPreviousData,
  });
}

/**
 * One lead, kept fresh independently of the list. The timeline dialog uses it so
 * the lead stays on screen even when a status change filters it out of the list.
 */
export function useLead(lead: Lead) {
  return useQuery({
    queryKey: leadKeys.detail(lead.id),
    queryFn: () => api.getLead(lead.id),
    // Show the row that was clicked straight away while the latest copy loads.
    placeholderData: lead,
  });
}

export function useCreateLead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: LeadCreateInput) => api.createLead(input),
    // Returning the promise keeps the mutation pending until the list has refreshed.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leadKeys.all }),
  });
}

export function useUpdateLeadStatus(leadId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: LeadStatus) => api.updateLeadStatus(leadId, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leadKeys.all }),
  });
}
