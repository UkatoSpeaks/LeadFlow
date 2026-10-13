import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { api } from "@/lib/api";
import type { LeadCreateInput, LeadFilters, LeadStatus } from "@/lib/types";

// Every lead-related query key starts with "leads", so invalidating leadKeys.all
// refreshes the list and any open timeline together.
export const leadKeys = {
  all: ["leads"] as const,
  list: (filters: LeadFilters) => ["leads", "list", filters] as const,
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
