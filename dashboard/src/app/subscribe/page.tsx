"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { TIER_LABELS, TIER_PRICES } from "@/lib/utils";

const tiers = ["solo", "starter", "professional", "elite", "team", "brokerage"];

export default function SubscribePage() {
  const { user, loading, logout } = useAuth();
  const { toast } = useToast();
  const router = useRouter();
  const [checkoutLoading, setCheckoutLoading] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner size="lg" text="Loading..." />
      </div>
    );
  }

  if (!user) {
    router.push("/login");
    return null;
  }

  // If user already has an active subscription, redirect to dashboard
  if (user.subscription_status === "active") {
    router.push("/dashboard");
    return null;
  }

  const handleCheckout = async (tier: string) => {
    setCheckoutLoading(tier);
    const { data, error } = await api.billing.createCheckout(tier, "monthly");
    setCheckoutLoading(null);
    if (error) {
      toast("error", error);
    } else if (data?.url) {
      window.location.href = data.url;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4 py-12">
      <div className="max-w-2xl w-full text-center mb-8">
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-xl font-bold text-white">C</span>
          </div>
          <span className="text-2xl font-bold text-gray-900">ClientPro</span>
        </div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Complete Your Subscription
        </h1>
        <p className="text-gray-600">
          Hi {user.first_name}, choose a plan to activate your account and start automating client follow-up.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-4xl w-full">
        {tiers.map((tier) => {
          const label = TIER_LABELS[tier] || tier;
          const price = TIER_PRICES[tier];
          const isCurrentTier = tier === user.subscription_tier;
          return (
            <div
              key={tier}
              className={`rounded-xl border p-6 bg-white shadow-sm ${
                isCurrentTier ? "border-primary ring-2 ring-primary/20" : "border-gray-200"
              }`}
            >
              <h3 className="text-lg font-bold text-gray-900">{label}</h3>
              {price && (
                <p className="text-2xl font-bold text-gray-900 mt-1">
                  ${price.monthly}<span className="text-sm font-normal text-gray-500">/mo</span>
                </p>
              )}
              {isCurrentTier && (
                <span className="inline-block mt-2 text-xs font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">
                  Selected during signup
                </span>
              )}
              <Button
                className="w-full mt-4"
                loading={checkoutLoading === tier}
                onClick={() => handleCheckout(tier)}
              >
                {isCurrentTier ? "Subscribe Now" : `Choose ${label}`}
              </Button>
            </div>
          );
        })}
      </div>

      <div className="mt-8 text-center">
        <button
          onClick={logout}
          className="text-sm text-gray-500 hover:text-gray-700 underline"
        >
          Log out
        </button>
      </div>
    </div>
  );
}
