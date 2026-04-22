const API_BASE = process.env.NEXT_PUBLIC_API_URL || "https://clientpro-api.onrender.com";

interface ApiResponse<T = unknown> {
  data: T | null;
  error: string | null;
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<ApiResponse<T>> {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  if (!(options.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      if (typeof window !== "undefined") {
        localStorage.removeItem("token");
        window.location.href = "/login";
      }
      return { data: null, error: "Session expired" };
    }

    const data = await response.json();

    if (!response.ok) {
      const errorMsg = data?.error?.message || data?.message || "Something went wrong";
      return { data: null, error: errorMsg };
    }

    return { data, error: null };
  } catch (err) {
    return { data: null, error: err instanceof Error ? err.message : "Network error" };
  }
}

function GET<T>(endpoint: string, params?: Record<string, string | number | undefined>) {
  const searchParams = new URLSearchParams();
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== "") {
        searchParams.append(key, String(value));
      }
    });
  }
  const query = searchParams.toString();
  return request<T>(`${endpoint}${query ? `?${query}` : ""}`);
}

function POST<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, {
    method: "POST",
    body: body instanceof FormData ? body : JSON.stringify(body),
  });
}

function PUT<T>(endpoint: string, body?: unknown) {
  return request<T>(endpoint, {
    method: "PUT",
    body: JSON.stringify(body),
  });
}

function DELETE<T>(endpoint: string) {
  return request<T>(endpoint, { method: "DELETE" });
}

export const api = {
  auth: {
    register: (data: {
      email: string;
      password: string;
      first_name: string;
      last_name: string;
      phone_number: string;
      company_name?: string;
      tier?: string;
      billing_cycle?: string;
    }) => POST<{ token: string; user: User; checkout_url?: string }>("/api/auth/register", data),
    login: (data: { email: string; password: string }) =>
      POST<{ token: string; user: User }>("/api/auth/login", data),
    me: () => GET<{ user: User; usage: Usage }>("/api/auth/me"),
    updateProfile: (data: Partial<User>) => PUT<{ user: User }>("/api/auth/profile", data),
    completeOnboarding: () =>
      POST<{ onboarding_completed_at: string | null }>("/api/auth/onboarding/complete"),
    forgotPassword: (data: { email: string }) =>
      POST<{ message: string }>("/api/auth/forgot-password", data),
    resetPassword: (data: { token: string; new_password: string }) =>
      POST<{ message: string }>("/api/auth/reset-password", data),
  },
  clients: {
    list: (params?: { page?: number; limit?: number; search?: string }) =>
      GET<{ clients: Client[]; total: number; page: number; total_pages: number }>("/api/clients", params as Record<string, string | number>),
    get: (id: string) =>
      GET<{ client: Client; messages: Message[]; referrals: Referral[] }>(`/api/clients/${id}`),
    create: (data: Partial<Client>) =>
      POST<{ client: Client; messages_scheduled: number }>("/api/clients", data),
    update: (id: string, data: Partial<Client>) =>
      PUT<{ client: Client }>(`/api/clients/${id}`, data),
    delete: (id: string) => DELETE<{ message: string }>(`/api/clients/${id}`),
    import: (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      return POST<{ success_count: number; error_count: number; errors: Array<{ row: number; error: string }> }>("/api/clients/import", formData);
    },
  },
  messages: {
    list: (params?: { status?: string; page?: number; limit?: number }) =>
      GET<{ messages: Message[]; total: number }>("/api/messages", params as Record<string, string | number>),
    update: (id: string, data: { message_text: string }) =>
      PUT<{ message: Message }>(`/api/messages/${id}`, data),
    cancel: (id: string) => DELETE<{ message: string }>(`/api/messages/${id}`),
    sendCustom: (data: { message_text: string; client_ids?: string[]; send_to_all?: boolean }) =>
      POST<{ message: string; count: number }>("/api/messages/custom", data),
    replies: () =>
      GET<{ replies: Message[]; total: number }>("/api/messages/replies"),
    conversation: (clientId: string) =>
      GET<{ client: { id: string; first_name: string; last_name: string; phone_number: string }; messages: Message[] }>(`/api/messages/conversation/${clientId}`),
    previewAI: (data: {
      client_id: string;
      template_text?: string;
      template_name?: string;
      trigger_days_after_closing?: number;
    }) =>
      POST<{
        preview: string;
        mail_merge_preview: string;
        ai_generated: boolean;
        model: string | null;
        fallback_reason: string | null;
        market_context: {
          source: string;
          city: string;
          state: string;
          zip: string | null;
          property_type_label: string;
          years_since_closing: number;
          quarter_change_pct: number;
          direction: "up" | "down" | "flat";
          median_days_on_market: number;
          typical_equity_gain_pct: number;
        };
      }>("/api/messages/preview-ai", data),
    regenerateAI: (id: string) =>
      POST<{
        message: Message;
        ai_generated: boolean;
        model: string | null;
        fallback_reason: string | null;
      }>(`/api/messages/${id}/regenerate-ai`),
    reply: (data: { client_id: string; message_text: string }) =>
      POST<{ message: Message }>("/api/messages/reply", data),
  },
  referrals: {
    list: (params?: { page?: number; limit?: number }) =>
      GET<{ referrals: Referral[]; total: number }>("/api/referrals", params as Record<string, string | number>),
    create: (data: Partial<Referral>) => POST<{ referral: Referral }>("/api/referrals", data),
    update: (id: string, data: Partial<Referral>) =>
      PUT<{ referral: Referral }>(`/api/referrals/${id}`, data),
  },
  push: {
    vapidKey: () => GET<{ vapidPublicKey: string }>("/api/push/vapid-key"),
    subscribe: (subscription: Record<string, unknown>) =>
      POST<{ message: string }>("/api/push/subscribe", { subscription }),
    unsubscribe: (endpoint: string) =>
      POST<{ message: string }>("/api/push/unsubscribe", { endpoint }),
  },
  billing: {
    createCheckout: (tier: string, billing_cycle?: string) =>
      POST<{ url: string }>("/api/billing/create-checkout-session", { tier, billing_cycle: billing_cycle || "monthly" }),
    portal: () => GET<{ url: string }>("/api/billing/portal"),
  },
  analytics: {
    dashboard: () => GET<AnalyticsData>("/api/analytics/dashboard"),
  },
  fub: {
    status: () => GET<FubStatus>("/api/fub/status"),
    connect: (data: { api_key: string }) => POST<FubStatus>("/api/fub/connect", data),
    disconnect: () => DELETE<FubStatus>("/api/fub/disconnect"),
    preview: () =>
      GET<{ total: number; sample_size: number; people: FubPreviewPerson[] }>("/api/fub/preview"),
    import: (data?: { limit?: number; default_closing_date?: string }) =>
      POST<FubImportResult>("/api/fub/import", data || {}),
  },
  team: {
    members: () => GET<{ members: TeamMember[] }>("/api/team/members"),
    invite: (data: { email: string; role: string }) =>
      POST<{ message: string }>("/api/team/invite", data),
    remove: (userId: string) =>
      POST<{ message: string }>("/api/team/remove", { user_id: userId }),
  },
};

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  phone_number?: string;
  company_name?: string;
  subscription_tier: string;
  subscription_status?: string;
  twilio_phone_number?: string;
  user_role?: string;
  use_ai_personalization?: boolean;
  ai_available?: boolean;
  onboarding_completed_at?: string | null;
  fub_connected?: boolean;
  fub_identity_name?: string | null;
  fub_last_sync_at?: string | null;
  fub_last_sync_count?: number | null;
}

export interface FubStatus {
  connected: boolean;
  identity: { id: number | null; name: string | null } | null;
  last_sync_at: string | null;
  last_sync_count: number | null;
}

export interface FubPreviewPerson {
  fub_person_id: number | null;
  ok: boolean;
  reason: string | null;
  client: {
    first_name: string;
    last_name: string;
    phone_number: string;
    city: string | null;
    state: string | null;
  } | null;
}

export interface FubImportResult {
  requested: number;
  considered: number;
  imported: number;
  skipped_duplicates: number;
  skipped_invalid: number;
  errors: { fub_person_id: number | null; reason: string }[];
  fub_fetched: number;
  capped_by_tier: boolean;
}

export interface Usage {
  clients_count: number;
  clients_limit: number | "unlimited";
  messages_sent_this_month: number;
}

export interface Client {
  id: string;
  agent_id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  email?: string;
  property_address?: string;
  city?: string;
  state?: string;
  zip?: string;
  property_type?: string;
  closing_date: string;
  birthday?: string;
  anniversary_date?: string;
  spouse_name?: string;
  engagement_score: number;
  notes?: string;
  is_active: boolean;
  created_at: string;
}

export interface Message {
  id: string;
  client_id: string;
  agent_id: string;
  message_text: string;
  message_type: string;
  status: string;
  scheduled_for: string;
  sent_at?: string;
  client_first_name?: string;
  client_last_name?: string;
  client_phone_number?: string;
  reply_text?: string;
  reply_at?: string;
  is_read?: boolean;
}

export interface Referral {
  id: string;
  agent_id: string;
  referred_by_client_id: string;
  referral_first_name: string;
  referral_last_name: string;
  referral_phone?: string;
  referral_email?: string;
  status: string;
  notes?: string;
  created_at: string;
  referring_client_name?: string;
}

export interface AnalyticsData {
  total_clients: number;
  messages_sent_this_month: number;
  reply_rate: number;
  referrals_this_year: number;
  top_engaged: Client[];
  low_engaged: Client[];
  average_engagement: number;
}

export interface TeamMember {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  user_role: string;
  clients_count?: number;
  messages_sent?: number;
  is_active: boolean;
}
