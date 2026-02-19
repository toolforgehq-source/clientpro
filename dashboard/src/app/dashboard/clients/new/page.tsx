"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Info } from "lucide-react";
import { api } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Modal from "@/components/ui/Modal";
import { formatPhone, toE164, US_STATES, PROPERTY_TYPES, PROPERTY_TYPE_LABELS, TIER_LABELS } from "@/lib/utils";

const schema = z.object({
  first_name: z.string().min(1, "First name required"),
  last_name: z.string().min(1, "Last name required"),
  phone_number: z.string().min(1, "Phone number required"),
  email: z.string().email("Invalid email").or(z.literal("")).optional(),
  property_address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zip: z.string().optional(),
  property_type: z.string().min(1, "Property type required"),
  closing_date: z.string().min(1, "Closing date required"),
  notes: z.string().optional(),
});

type FormData = z.infer<typeof schema>;

export default function NewClientPage() {
  const router = useRouter();
  const { user, refreshUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [limitModal, setLimitModal] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { property_type: "" },
  });

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setValue("phone_number", formatted, { shouldValidate: true });
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    const { data: result, error } = await api.clients.create({
      ...data,
      phone_number: toE164(data.phone_number),
      email: data.email || undefined,
    });
    setLoading(false);
    if (error) {
      if (error.toLowerCase().includes("limit")) {
        setLimitModal(true);
      } else {
        toast("error", error);
      }
    } else {
      toast("success", `Client added! ${result?.messages_scheduled || 4} messages scheduled.`);
      refreshUser();
      router.push("/dashboard/clients");
    }
  };

  const nextTier = (() => {
    const tiers = ["starter", "professional", "elite", "team", "brokerage"];
    const currentIndex = tiers.indexOf(user?.subscription_tier || "starter");
    return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
  })();

  return (
    <div>
      <Header
        title="Add Client"
        breadcrumbs={[
          { label: "Clients", href: "/dashboard/clients" },
          { label: "Add Client" },
        ]}
      />

      <div className="mx-auto max-w-2xl">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Client Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="first_name"
                  label="First Name *"
                  placeholder="John"
                  error={errors.first_name?.message}
                  {...register("first_name")}
                />
                <Input
                  id="last_name"
                  label="Last Name *"
                  placeholder="Smith"
                  error={errors.last_name?.message}
                  {...register("last_name")}
                />
              </div>
              <Input
                id="phone_number"
                label="Phone Number *"
                type="tel"
                placeholder="+1 (555) 123-4567"
                error={errors.phone_number?.message}
                {...register("phone_number", { onChange: handlePhoneChange })}
              />
              <Input
                id="email"
                label="Email (optional)"
                type="email"
                placeholder="john@example.com"
                error={errors.email?.message}
                {...register("email")}
              />
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Property Details</h2>
            <div className="space-y-4">
              <Input
                id="property_address"
                label="Property Address"
                placeholder="123 Main St"
                {...register("property_address")}
              />
              <div className="grid grid-cols-3 gap-4">
                <Input id="city" label="City" placeholder="Austin" {...register("city")} />
                <div>
                  <label htmlFor="state" className="block text-sm font-medium text-gray-700 mb-1">
                    State
                  </label>
                  <select
                    id="state"
                    {...register("state")}
                    className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
                  >
                    <option value="">Select</option>
                    {US_STATES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
                <Input id="zip" label="ZIP" placeholder="78701" {...register("zip")} />
              </div>
              <div>
                <label htmlFor="property_type" className="block text-sm font-medium text-gray-700 mb-1">
                  Property Type *
                </label>
                <select
                  id="property_type"
                  {...register("property_type")}
                  className={`w-full rounded-lg border ${
                    errors.property_type ? "border-red-300" : "border-gray-300"
                  } px-3 py-2 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20`}
                >
                  <option value="">Select type</option>
                  {PROPERTY_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {PROPERTY_TYPE_LABELS[t]}
                    </option>
                  ))}
                </select>
                {errors.property_type && (
                  <p className="mt-1 text-sm text-red-600">{errors.property_type.message}</p>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Closing Information</h2>
            <Input
              id="closing_date"
              label="Closing Date *"
              type="date"
              max={new Date().toISOString().split("T")[0]}
              error={errors.closing_date?.message}
              {...register("closing_date")}
            />
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Notes</h2>
            <textarea
              id="notes"
              placeholder="Any important details about this client..."
              rows={3}
              {...register("notes")}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <div className="rounded-lg bg-blue-50 border border-blue-200 p-4 flex items-start gap-3">
            <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-700">
              We&apos;ll automatically schedule 4 personalized messages over the next year to keep you top-of-mind with this client.
            </p>
          </div>

          <div className="flex justify-end gap-3">
            <Button variant="secondary" type="button" onClick={() => router.push("/dashboard/clients")}>
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Add Client
            </Button>
          </div>
        </form>
      </div>

      <Modal open={limitModal} onClose={() => setLimitModal(false)} title="Client Limit Reached">
        <p className="text-sm text-gray-600">
          You&apos;ve reached your client limit on the{" "}
          <strong>{TIER_LABELS[user?.subscription_tier || "starter"]}</strong> plan.
        </p>
        {nextTier && (
          <p className="mt-2 text-sm text-gray-600">
            Upgrade to <strong>{TIER_LABELS[nextTier]}</strong> to add more clients.
          </p>
        )}
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setLimitModal(false)}>
            Cancel
          </Button>
          <Button onClick={() => router.push("/dashboard/settings?tab=billing")}>View Pricing</Button>
        </div>
      </Modal>
    </div>
  );
}
