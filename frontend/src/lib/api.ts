import type {
  Discussion,
  DiscussionCreateInput,
  Lead,
  LeadCreateInput,
  LeadFilters,
  LeadStatus,
} from "@/lib/types";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8000").replace(/\/+$/, "");

export interface FieldError {
  field: string;
  message: string;
}

/** Any failed request, whether the API rejected it or it never arrived. */
export class ApiError extends Error {
  constructor(
    message: string,
    /** HTTP status, or 0 when the server could not be reached. */
    readonly status: number,
    readonly code: string,
    readonly fields: FieldError[] = [],
  ) {
    super(message);
    this.name = "ApiError";
  }
}

/**
 * Splits a failed request into messages for a form: one per field the API
 * rejected, or a single general message when the failure is not about a field.
 */
export function toFormErrors(error: unknown): { fields: Record<string, string>; general: string | null } {
  if (error instanceof ApiError && error.fields.length > 0) {
    return {
      fields: Object.fromEntries(error.fields.map(({ field, message }) => [field, message])),
      general: null,
    };
  }
  return {
    fields: {},
    general: error instanceof Error ? error.message : "Something went wrong. Please try again.",
  };
}

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers: { "Content-Type": "application/json", ...init?.headers },
    });
  } catch {
    throw new ApiError("Could not reach the server. Check that the API is running.", 0, "network_error");
  }

  if (!response.ok) {
    // The API always answers errors as { error: { code, message, fields? } }.
    const body = await response.json().catch(() => null);
    const error = body?.error;
    throw new ApiError(
      error?.message ?? `Request failed with status ${response.status}`,
      response.status,
      error?.code ?? "unknown_error",
      error?.fields ?? [],
    );
  }

  return response.json() as Promise<T>;
}

export const api = {
  listLeads(filters: LeadFilters = {}): Promise<Lead[]> {
    const params = new URLSearchParams();
    if (filters.status) params.set("status", filters.status);
    if (filters.search?.trim()) params.set("search", filters.search.trim());
    const query = params.toString();
    return request<Lead[]>(`/leads${query ? `?${query}` : ""}`);
  },

  createLead(input: LeadCreateInput): Promise<Lead> {
    return request<Lead>("/leads", { method: "POST", body: JSON.stringify(input) });
  },

  updateLeadStatus(leadId: number, status: LeadStatus): Promise<Lead> {
    return request<Lead>(`/leads/${leadId}`, { method: "PATCH", body: JSON.stringify({ status }) });
  },

  listDiscussions(leadId: number): Promise<Discussion[]> {
    return request<Discussion[]>(`/leads/${leadId}/discussions`);
  },

  createDiscussion(leadId: number, input: DiscussionCreateInput): Promise<Discussion> {
    return request<Discussion>(`/leads/${leadId}/discussions`, {
      method: "POST",
      body: JSON.stringify(input),
    });
  },
};
