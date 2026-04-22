"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import { api } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import Modal from "@/components/ui/Modal";
import InstallInstructions from "@/components/pwa/InstallInstructions";
import FubIntegrationCard from "@/components/integrations/FubIntegrationCard";
import { TIER_LABELS, TIER_PRICES, TIER_CLIENT_LIMITS, formatPhone, toE164 } from "@/lib/utils";

function SettingsContent() {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("tab") || "profile";
  const { user, usage, updateProfile } = useAuth();
  const { toast } = useToast();
  const [tab, setTab] = useState<"profile" | "billing" | "app" | "integrations">(
    initialTab as "profile" | "billing" | "app" | "integrations"
  );

  const [profileForm, setProfileForm] = useState({
    first_name: user?.first_name || "",
    last_name: user?.last_name || "",
    phone_number: user?.phone_number ? formatPhone(user.phone_number) : "",
    company_name: user?.company_name || "",
  });
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingAI, setSavingAI] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });

  const [cancelModal, setCancelModal] = useState(false);
  const [upgradeLoading, setUpgradeLoading] = useState<string | null>(null);

  const handleProfileSave = async () => {
    setSavingProfile(true);
    const error = await updateProfile({
      first_name: profileForm.first_name,
      last_name: profileForm.last_name,
      phone_number: toE164(profileForm.phone_number),
      company_name: profileForm.company_name,
    });
    setSavingProfile(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Profile updated");
    }
  };

  const handleAIToggle = async (next: boolean) => {
    setSavingAI(true);
    const error = await updateProfile({ use_ai_personalization: next });
    setSavingAI(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", next ? "AI personalization on" : "AI personalization off");
    }
  };

  const handleUpgrade = async (tier: string) => {
    setUpgradeLoading(tier);
    const { data, error } = await api.billing.createCheckout(tier);
    setUpgradeLoading(null);
    if (error) {
      toast("error", error);
    } else if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const handlePortal = async () => {
    const { data, error } = await api.billing.portal();
    if (error) {
      toast("error", error);
    } else if (data?.url) {
      window.open(data.url, "_blank");
    }
  };

  const currentTier = user?.subscription_tier || "starter";
  const tiers = ["starter", "professional", "elite", "team", "brokerage"];
  const currentIndex = tiers.indexOf(currentTier);
  const upgradeTiers = tiers.filter((_, i) => i > currentIndex);
  const clientsUsed = usage?.clients_count ?? 0;
  const clientsLimit = TIER_CLIENT_LIMITS[currentTier];
  const usagePercent =
    typeof clientsLimit === "number" ? Math.min((clientsUsed / clientsLimit) * 100, 100) : 0;

  return (
    <div>
      <Header title="Settings" />

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        <button
          onClick={() => setTab("profile")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "profile" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Profile
        </button>
        <button
          onClick={() => setTab("billing")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "billing" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Billing
        </button>
        <button
          onClick={() => setTab("integrations")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "integrations" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Integrations
        </button>
        <button
          onClick={() => setTab("app")}
          className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
            tab === "app" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Install App
        </button>
      </div>

      {tab === "integrations" ? (
        <div className="max-w-2xl space-y-8">
          <FubIntegrationCard />
        </div>
      ) : tab === "app" ? (
        <div className="max-w-2xl space-y-8">
          <InstallInstructions />
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Why install?</h2>
            <ul className="space-y-2 text-sm text-gray-600">
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Quick access from your home screen — no need to open a browser</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Full-screen experience — looks and feels like a native app</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Faster loading — pages are cached for instant access</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-primary" />
                <span>Works on iPhone, Android, and desktop</span>
              </li>
            </ul>
          </div>
        </div>
      ) : tab === "profile" ? (
        <div className="max-w-2xl space-y-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Account Information</h2>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input
                  id="first_name"
                  label="First Name"
                  value={profileForm.first_name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, first_name: e.target.value }))}
                />
                <Input
                  id="last_name"
                  label="Last Name"
                  value={profileForm.last_name}
                  onChange={(e) => setProfileForm((f) => ({ ...f, last_name: e.target.value }))}
                />
              </div>
              <div>
                <Input id="email" label="Email" value={user?.email || ""} disabled />
                <p className="mt-1 text-xs text-gray-400">Email cannot be changed</p>
              </div>
              <Input
                id="phone"
                label="Phone Number"
                value={profileForm.phone_number}
                onChange={(e) =>
                  setProfileForm((f) => ({ ...f, phone_number: formatPhone(e.target.value) }))
                }
              />
              <Input
                id="company"
                label="Company Name"
                value={profileForm.company_name}
                onChange={(e) => setProfileForm((f) => ({ ...f, company_name: e.target.value }))}
              />
              <Button loading={savingProfile} onClick={handleProfileSave}>
                Save Changes
              </Button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <div className="mb-4 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  AI-personalized messages{" "}
                  <span className="ml-1 rounded-full bg-primary-100 px-2 py-0.5 text-xs font-medium text-primary-700">
                    Beta
                  </span>
                </h2>
                <p className="mt-1 text-sm text-gray-600">
                  Rewrite scheduled messages in your voice using each client&apos;s property and
                  local market context. Messages newly scheduled after you turn this on will use AI;
                  existing scheduled messages stay as-is until you regenerate them.
                </p>
                {user?.ai_available === false && (
                  <p className="mt-2 text-xs text-gray-500">
                    AI personalization isn&apos;t configured on this deployment yet — toggle is
                    safe to flip but messages will continue using the template fallback until the
                    server has an AI key.
                  </p>
                )}
              </div>
              <button
                type="button"
                onClick={() => handleAIToggle(!user?.use_ai_personalization)}
                disabled={savingAI}
                aria-pressed={user?.use_ai_personalization === true}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${
                  user?.use_ai_personalization ? "bg-primary" : "bg-gray-300"
                }`}
              >
                <span
                  className={`inline-block h-5 w-5 transform rounded-full bg-white shadow transition-transform ${
                    user?.use_ai_personalization ? "translate-x-5" : "translate-x-0.5"
                  }`}
                />
              </button>
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Password</h2>
            <div className="space-y-4">
              <Input
                id="current_password"
                label="Current Password"
                type="password"
                value={passwordForm.current_password}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, current_password: e.target.value }))
                }
              />
              <Input
                id="new_password"
                label="New Password"
                type="password"
                value={passwordForm.new_password}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, new_password: e.target.value }))
                }
              />
              <Input
                id="confirm_password"
                label="Confirm New Password"
                type="password"
                value={passwordForm.confirm_password}
                onChange={(e) =>
                  setPasswordForm((f) => ({ ...f, confirm_password: e.target.value }))
                }
              />
              <Button
                onClick={() => {
                  toast("info", "Password update requires the forgot-password flow for now.");
                }}
              >
                Update Password
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div className="max-w-2xl space-y-8">
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Current Plan</h2>
            <div className="rounded-lg border border-primary-200 bg-primary-50 p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-lg font-bold text-primary-800">
                    {TIER_LABELS[currentTier]} Plan
                  </p>
                  <p className="text-sm text-primary-600">
                    ${TIER_PRICES[currentTier]?.monthly}/month
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-primary-700">
                    {clientsUsed} of {clientsLimit} clients
                  </p>
                </div>
              </div>
              <div className="mt-3">
                <div className="h-2 w-full rounded-full bg-primary-200">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${usagePercent}%` }}
                  />
                </div>
              </div>
            </div>

            <div className="mt-4 flex gap-3">
              {upgradeTiers.length > 0 && (
                <Button onClick={() => handleUpgrade(upgradeTiers[0])}>
                  Upgrade to {TIER_LABELS[upgradeTiers[0]]}
                </Button>
              )}
              <Button variant="secondary" onClick={handlePortal}>
                Manage Billing
              </Button>
            </div>
          </div>

          {upgradeTiers.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
              <h2 className="mb-4 text-lg font-semibold text-gray-900">Available Upgrades</h2>
              <div className="space-y-3">
                {upgradeTiers.map((tier) => (
                  <div
                    key={tier}
                    className="flex items-center justify-between rounded-lg border border-gray-200 p-4"
                  >
                    <div>
                      <p className="font-medium text-gray-900">{TIER_LABELS[tier]}</p>
                      <p className="text-sm text-gray-500">
                        ${TIER_PRICES[tier]?.monthly}/mo - Up to {TIER_CLIENT_LIMITS[tier]} clients
                      </p>
                    </div>
                    <Button
                      size="sm"
                      loading={upgradeLoading === tier}
                      onClick={() => handleUpgrade(tier)}
                    >
                      Upgrade
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-gray-900">Payment Method</h2>
            <p className="text-sm text-gray-500 mb-4">Managed through Stripe</p>
            <Button variant="secondary" onClick={handlePortal}>
              Update Payment Method
            </Button>
          </div>

          <div className="rounded-xl border border-red-200 bg-white p-6 shadow-sm">
            <h2 className="mb-2 text-lg font-semibold text-red-700">Danger Zone</h2>
            <p className="text-sm text-gray-600 mb-4">
              Cancel your subscription. You&apos;ll retain access until the end of your billing
              period.
            </p>
            <Button variant="danger" onClick={() => setCancelModal(true)}>
              Cancel Subscription
            </Button>
          </div>
        </div>
      )}

      <Modal open={cancelModal} onClose={() => setCancelModal(false)} title="Cancel Subscription">
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel your subscription? You&apos;ll retain access until the end of
          your current billing period. Your clients and messages will be preserved.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setCancelModal(false)}>Keep Subscription</Button>
          <Button
            variant="danger"
            onClick={() => {
              handlePortal();
              setCancelModal(false);
            }}
          >
            Cancel Subscription
          </Button>
        </div>
      </Modal>
    </div>
  );
}

export default function SettingsPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading settings..." />}>
      <SettingsContent />
    </Suspense>
  );
}
