"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowRight, CheckCircle2, Sparkles, Users, MessageSquare, Loader2 } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, Client } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS, US_STATES, formatPhone, toE164 } from "@/lib/utils";

type Step = 1 | 2 | 3;

interface QuickClient {
  first_name: string;
  last_name: string;
  phone_number: string;
  city: string;
  state: string;
  zip: string;
  property_type: string;
  closing_date: string;
}

interface PreviewRow {
  template_name: string;
  trigger_days_after_closing: number;
  template_text: string;
  preview: string;
  mail_merge_preview: string;
  ai_generated: boolean;
  fallback_reason: string | null;
}

const SAMPLE_TEMPLATES: Array<Pick<PreviewRow, "template_name" | "trigger_days_after_closing" | "template_text">> = [
  {
    template_name: "Month 3 Check-in",
    trigger_days_after_closing: 90,
    template_text:
      "How's the {{property_type}} treating you, {{first_name}}? Any questions about the neighborhood?",
  },
  {
    template_name: "Year 1 Anniversary",
    trigger_days_after_closing: 365,
    template_text:
      "Happy house-iversary {{first_name}}! Can you believe it's been a year? Hope you're loving {{city}}!",
  },
  {
    template_name: "Month 18 Market Update",
    trigger_days_after_closing: 540,
    template_text:
      "Hi {{first_name}}! Quick market update: {{city}} real estate is staying strong. Great news for your investment! Let me know if you ever have questions.",
  },
];

const emptyClient: QuickClient = {
  first_name: "",
  last_name: "",
  phone_number: "",
  city: "",
  state: "",
  zip: "",
  property_type: "single_family",
  closing_date: new Date().toISOString().slice(0, 10),
};

export default function OnboardingPage() {
  const router = useRouter();
  const { user, usage, updateProfile, refreshUser } = useAuth();
  const { toast } = useToast();

  const [step, setStep] = useState<Step>(1);
  const [firstClient, setFirstClient] = useState<Client | null>(null);
  const [quickClient, setQuickClient] = useState<QuickClient>(emptyClient);
  const [savingClient, setSavingClient] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const [previews, setPreviews] = useState<PreviewRow[]>([]);
  const [loadingPreviews, setLoadingPreviews] = useState(false);

  const [togglingAI, setTogglingAI] = useState(false);
  const [finishing, setFinishing] = useState(false);

  // If the agent already has clients and no onboarding flag, we still let them
  // finish the wizard but preload their first client as the preview target.
  useEffect(() => {
    if (step !== 2) return;
    if (firstClient) return;
    if ((usage?.clients_count ?? 0) === 0) return;
    (async () => {
      const { data } = await api.clients.list({ limit: 1 });
      if (data?.clients?.length) {
        setFirstClient(data.clients[0]);
      }
    })();
  }, [step, firstClient, usage?.clients_count]);

  const handleAdvanceFromStep2 = () => {
    if (!firstClient) {
      setFormError("Add one client before previewing sample messages.");
      return;
    }
    setStep(3);
  };

  const handleCreateClient = async () => {
    setFormError(null);
    if (!quickClient.first_name || !quickClient.last_name || !quickClient.phone_number || !quickClient.closing_date) {
      setFormError("First name, last name, phone, and closing date are required.");
      return;
    }
    setSavingClient(true);
    const { data, error } = await api.clients.create({
      first_name: quickClient.first_name,
      last_name: quickClient.last_name,
      phone_number: toE164(quickClient.phone_number),
      city: quickClient.city || undefined,
      state: quickClient.state || undefined,
      zip: quickClient.zip || undefined,
      property_type: quickClient.property_type,
      closing_date: quickClient.closing_date,
    });
    setSavingClient(false);
    if (error || !data?.client) {
      setFormError(error || "Could not save client.");
      return;
    }
    setFirstClient(data.client);
    await refreshUser();
    toast("success", `Client added. ${data.messages_scheduled ?? 22} messages scheduled.`);
  };

  const loadPreviews = useCallback(async () => {
    if (!firstClient) return;
    setLoadingPreviews(true);
    const rows = await Promise.all(
      SAMPLE_TEMPLATES.map(async (sample) => {
        const { data, error } = await api.messages.previewAI({
          client_id: firstClient.id,
          template_text: sample.template_text,
          template_name: sample.template_name,
          trigger_days_after_closing: sample.trigger_days_after_closing,
        });
        if (error || !data) {
          return {
            ...sample,
            preview: sample.template_text,
            mail_merge_preview: sample.template_text,
            ai_generated: false,
            fallback_reason: error || "preview_failed",
          } as PreviewRow;
        }
        return {
          ...sample,
          preview: data.preview,
          mail_merge_preview: data.mail_merge_preview,
          ai_generated: data.ai_generated,
          fallback_reason: data.fallback_reason,
        } as PreviewRow;
      })
    );
    setPreviews(rows);
    setLoadingPreviews(false);
  }, [firstClient]);

  useEffect(() => {
    if (step === 3) {
      loadPreviews();
    }
  }, [step, loadPreviews, user?.use_ai_personalization]);

  const handleAIToggle = async (next: boolean) => {
    setTogglingAI(true);
    const error = await updateProfile({ use_ai_personalization: next });
    setTogglingAI(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", next ? "AI personalization on" : "AI personalization off");
    }
  };

  const handleFinish = async () => {
    setFinishing(true);
    const { error } = await api.auth.completeOnboarding();
    if (error) {
      setFinishing(false);
      toast("error", error);
      return;
    }
    await refreshUser();
    router.replace("/dashboard");
  };

  const handleSkip = async () => {
    const { error } = await api.auth.completeOnboarding();
    if (error) {
      toast("error", error);
      return;
    }
    await refreshUser();
    router.replace("/dashboard");
  };

  if (!user) {
    return <LoadingSpinner size="lg" text="Loading..." />;
  }

  return (
    <div className="mx-auto max-w-3xl py-4">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome to ClientPro</h1>
          <p className="mt-1 text-sm text-gray-500">
            A three-step setup. Takes about two minutes.
          </p>
        </div>
        <button
          type="button"
          onClick={handleSkip}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Skip for now
        </button>
      </div>

      <div className="mb-8">
        <StepIndicator step={step} />
      </div>

      {step === 1 && <StepOne user={user} onNext={() => setStep(2)} />}

      {step === 2 && (
        <StepTwo
          client={firstClient}
          quickClient={quickClient}
          onChange={setQuickClient}
          onSave={handleCreateClient}
          saving={savingClient}
          error={formError}
          onBack={() => setStep(1)}
          onNext={handleAdvanceFromStep2}
        />
      )}

      {step === 3 && (
        <StepThree
          client={firstClient}
          previews={previews}
          loading={loadingPreviews}
          aiAvailable={user.ai_available === true}
          aiEnabled={user.use_ai_personalization === true}
          onToggleAI={handleAIToggle}
          toggling={togglingAI}
          onRefresh={loadPreviews}
          onBack={() => setStep(2)}
          onFinish={handleFinish}
          finishing={finishing}
        />
      )}
    </div>
  );
}

function StepIndicator({ step }: { step: Step }) {
  const steps: Array<{ n: Step; label: string }> = [
    { n: 1, label: "Welcome" },
    { n: 2, label: "First client" },
    { n: 3, label: "Preview messages" },
  ];
  return (
    <ol className="flex items-center gap-4">
      {steps.map((s, idx) => {
        const isComplete = step > s.n;
        const isActive = step === s.n;
        return (
          <li key={s.n} className="flex items-center gap-2">
            <span
              className={`flex h-7 w-7 items-center justify-center rounded-full text-xs font-semibold ${
                isComplete
                  ? "bg-primary text-white"
                  : isActive
                    ? "bg-primary/10 text-primary ring-2 ring-primary"
                    : "bg-gray-100 text-gray-500"
              }`}
            >
              {isComplete ? <CheckCircle2 className="h-4 w-4" /> : s.n}
            </span>
            <span
              className={`text-sm ${
                isActive ? "font-semibold text-gray-900" : "text-gray-500"
              }`}
            >
              {s.label}
            </span>
            {idx < steps.length - 1 && <span className="ml-2 h-px w-8 bg-gray-200" />}
          </li>
        );
      })}
    </ol>
  );
}

function StepOne({ user, onNext }: { user: NonNullable<ReturnType<typeof useAuth>["user"]>; onNext: () => void }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">
          Hi {user.first_name}, let&apos;s get your first client set up.
        </h2>
      </div>
      <p className="mt-4 text-gray-600">
        ClientPro schedules a 10-year follow-up cadence — 22 personalized texts per
        client, sent from a dedicated number in their area code. You stay top-of-mind
        without the manual work.
      </p>
      <p className="mt-4 text-gray-600">
        In the next two steps we&apos;ll add your first client and preview how their
        messages will look — including the AI-personalized version if you have that
        feature configured.
      </p>
      <div className="mt-8 flex justify-end">
        <Button onClick={onNext}>
          Add first client
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepTwo({
  client,
  quickClient,
  onChange,
  onSave,
  saving,
  error,
  onBack,
  onNext,
}: {
  client: Client | null;
  quickClient: QuickClient;
  onChange: (c: QuickClient) => void;
  onSave: () => void;
  saving: boolean;
  error: string | null;
  onBack: () => void;
  onNext: () => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <Users className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Add your first client</h2>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        This is enough to schedule all 22 messages over the next 10 years. You can
        import more clients from CSV or your CRM later.
      </p>

      {client ? (
        <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="font-medium text-green-900">
              {client.first_name} {client.last_name} added
            </p>
          </div>
          <p className="mt-1 text-sm text-green-800">
            22 messages scheduled. You&apos;ll preview a few of them in the next step.
          </p>
        </div>
      ) : (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <Input
              id="first_name"
              label="First name"
              placeholder="Sarah"
              value={quickClient.first_name}
              onChange={(e) => onChange({ ...quickClient, first_name: e.target.value })}
            />
            <Input
              id="last_name"
              label="Last name"
              placeholder="Taylor"
              value={quickClient.last_name}
              onChange={(e) => onChange({ ...quickClient, last_name: e.target.value })}
            />
          </div>
          <Input
            id="phone_number"
            label="Phone"
            type="tel"
            placeholder="+1 (512) 555-0110"
            value={quickClient.phone_number}
            onChange={(e) =>
              onChange({ ...quickClient, phone_number: formatPhone(e.target.value) })
            }
          />
          <div className="grid grid-cols-3 gap-4">
            <Input
              id="city"
              label="City"
              placeholder="Austin"
              value={quickClient.city}
              onChange={(e) => onChange({ ...quickClient, city: e.target.value })}
            />
            <div className="w-full">
              <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                State
              </label>
              <select
                id="state"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                value={quickClient.state}
                onChange={(e) => onChange({ ...quickClient, state: e.target.value })}
              >
                <option value="">—</option>
                {US_STATES.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <Input
              id="zip"
              label="ZIP"
              placeholder="78704"
              value={quickClient.zip}
              onChange={(e) => onChange({ ...quickClient, zip: e.target.value })}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="w-full">
              <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                Property type
              </label>
              <select
                id="property_type"
                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-20"
                value={quickClient.property_type}
                onChange={(e) => onChange({ ...quickClient, property_type: e.target.value })}
              >
                {PROPERTY_TYPES.map((t) => (
                  <option key={t} value={t}>{PROPERTY_TYPE_LABELS[t]}</option>
                ))}
              </select>
            </div>
            <Input
              id="closing_date"
              label="Closing date"
              type="date"
              value={quickClient.closing_date}
              onChange={(e) => onChange({ ...quickClient, closing_date: e.target.value })}
            />
          </div>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <div className="flex items-center justify-end gap-3">
            <Button onClick={onSave} loading={saving}>
              Save client
            </Button>
          </div>
        </div>
      )}

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <Button onClick={onNext} disabled={!client}>
          Preview messages
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

function StepThree({
  client,
  previews,
  loading,
  aiAvailable,
  aiEnabled,
  onToggleAI,
  toggling,
  onRefresh,
  onBack,
  onFinish,
  finishing,
}: {
  client: Client | null;
  previews: PreviewRow[];
  loading: boolean;
  aiAvailable: boolean;
  aiEnabled: boolean;
  onToggleAI: (next: boolean) => void;
  toggling: boolean;
  onRefresh: () => void;
  onBack: () => void;
  onFinish: () => void;
  finishing: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
      <div className="flex items-center gap-3">
        <div className="rounded-lg bg-primary/10 p-2">
          <MessageSquare className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900">Preview sample messages</h2>
      </div>
      <p className="mt-3 text-sm text-gray-600">
        These are three of the 22 messages that will go out to{" "}
        <span className="font-semibold text-gray-900">
          {client ? `${client.first_name} ${client.last_name}` : "your client"}
        </span>{" "}
        over the next ten years. You can edit each one before it sends.
      </p>

      <div className="mt-6 rounded-lg border border-gray-200 bg-gray-50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" />
              <p className="text-sm font-semibold text-gray-900">AI personalization</p>
              <span className="rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                Beta
              </span>
            </div>
            <p className="mt-1 text-xs text-gray-600">
              When on, ClientPro rewrites each message using the client&apos;s property
              and local market context. When off, the template is used verbatim.
            </p>
            {!aiAvailable && (
              <p className="mt-2 text-xs text-amber-700">
                AI isn&apos;t configured on this deployment yet, so the preview below
                uses the template fallback. Flip this on anytime — messages will start
                using AI automatically once it&apos;s configured.
              </p>
            )}
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={aiEnabled}
            onClick={() => onToggleAI(!aiEnabled)}
            disabled={toggling}
            className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors disabled:opacity-50 ${
              aiEnabled ? "bg-primary" : "bg-gray-300"
            }`}
          >
            <span
              className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform ${
                aiEnabled ? "translate-x-5" : "translate-x-0.5"
              }`}
            />
          </button>
        </div>
      </div>

      <div className="mt-6 space-y-4">
        {loading && (
          <div className="flex items-center justify-center py-10">
            <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
            <span className="ml-2 text-sm text-gray-500">Generating previews…</span>
          </div>
        )}
        {!loading &&
          previews.map((p) => (
            <div key={p.template_name} className="rounded-lg border border-gray-200 p-4">
              <div className="flex items-center justify-between gap-2">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {p.template_name} · day {p.trigger_days_after_closing}
                </p>
                {p.ai_generated ? (
                  <span className="inline-flex items-center gap-1 rounded bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
                    <Sparkles className="h-3 w-3" /> AI
                  </span>
                ) : (
                  <span className="rounded bg-gray-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-gray-500">
                    Template
                  </span>
                )}
              </div>
              <p className="mt-2 text-sm text-gray-900">{p.preview}</p>
              {p.ai_generated && p.mail_merge_preview !== p.preview && (
                <details className="mt-3 text-xs text-gray-500">
                  <summary className="cursor-pointer select-none">
                    Show template fallback
                  </summary>
                  <p className="mt-1 rounded bg-gray-50 p-2 text-gray-700">
                    {p.mail_merge_preview}
                  </p>
                </details>
              )}
            </div>
          ))}
      </div>

      <div className="mt-8 flex items-center justify-between">
        <Button variant="ghost" onClick={onBack}>Back</Button>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={onRefresh} disabled={loading}>
            Refresh previews
          </Button>
          <Button onClick={onFinish} loading={finishing}>
            Finish setup
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
