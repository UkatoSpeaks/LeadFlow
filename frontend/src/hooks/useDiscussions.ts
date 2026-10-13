import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { leadKeys } from "@/hooks/useLeads";
import { api } from "@/lib/api";
import type { DiscussionCreateInput } from "@/lib/types";

export function useDiscussions(leadId: number) {
  return useQuery({
    queryKey: leadKeys.discussions(leadId),
    queryFn: () => api.listDiscussions(leadId),
  });
}

export function useCreateDiscussion(leadId: number) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: DiscussionCreateInput) => api.createDiscussion(leadId, input),
    // A new discussion changes the timeline and the lead's last note, time ago and follow-up.
    onSuccess: () => queryClient.invalidateQueries({ queryKey: leadKeys.all }),
  });
}
