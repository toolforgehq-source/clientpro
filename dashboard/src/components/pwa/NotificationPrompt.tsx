"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { usePushNotifications } from "@/hooks/usePushNotifications";

export default function NotificationPrompt() {
  const { user } = useAuth();
  const { permission, isSubscribed, loading, subscribe } = usePushNotifications(user?.id);
  const [dismissed, setDismissed] = useState(false);
  const [subscribing, setSubscribing] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (loading || !user) return;
    if (permission === "unsupported" || permission === "denied") return;
    if (isSubscribed) return;

    // Check if user previously dismissed
    const dismissedAt = localStorage.getItem("push_prompt_dismissed");
    if (dismissedAt) {
      const daysSince = (Date.now() - parseInt(dismissedAt, 10)) / (1000 * 60 * 60 * 24);
      if (daysSince < 7) return;
    }

    // Show prompt after a short delay so it doesn't appear immediately on page load
    const timer = setTimeout(() => setShow(true), 3000);
    return () => clearTimeout(timer);
  }, [loading, user, permission, isSubscribed]);

  if (!show || dismissed || isSubscribed) return null;

  const handleEnable = async () => {
    setSubscribing(true);
    await subscribe();
    setSubscribing(false);
    setShow(false);
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShow(false);
    localStorage.setItem("push_prompt_dismissed", Date.now().toString());
  };

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 mx-auto max-w-md animate-in slide-in-from-bottom-4 duration-300 lg:left-auto lg:right-6 lg:ml-64">
      <div className="rounded-xl border border-blue-200 bg-white p-4 shadow-lg">
        <div className="flex items-start gap-3">
          <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-blue-100">
            <svg className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75v-.7V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0" />
            </svg>
          </div>
          <div className="flex-1">
            <p className="text-sm font-semibold text-gray-900">
              Enable notifications
            </p>
            <p className="mt-1 text-xs text-gray-500">
              Get instant alerts when your clients reply to messages — even when the app is closed.
            </p>
            <div className="mt-3 flex gap-2">
              <button
                onClick={handleEnable}
                disabled={subscribing}
                className="rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50"
              >
                {subscribing ? "Enabling..." : "Enable"}
              </button>
              <button
                onClick={handleDismiss}
                className="rounded-lg px-3 py-1.5 text-xs font-medium text-gray-500 hover:text-gray-700"
              >
                Not now
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
