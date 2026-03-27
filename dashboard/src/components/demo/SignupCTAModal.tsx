"use client";

import { X, Zap } from "lucide-react";
import { useDemo } from "@/context/DemoContext";

export default function SignupCTAModal() {
  const { showSignupCTA, setShowSignupCTA, ctaAction } = useDemo();

  if (!showSignupCTA) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center">
      <div
        className="fixed inset-0 bg-black/50"
        onClick={() => setShowSignupCTA(false)}
      />
      <div className="relative w-full max-w-md rounded-2xl bg-white p-8 shadow-2xl mx-4">
        <button
          onClick={() => setShowSignupCTA(false)}
          className="absolute right-4 top-4 rounded-lg p-1 text-gray-400 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        <div className="text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
            <Zap className="h-8 w-8 text-primary" />
          </div>
          <h3 className="text-xl font-bold text-gray-900">
            Ready to {ctaAction}?
          </h3>
          <p className="mt-2 text-gray-600">
            This is a demo. Sign up to start automating follow-up with your past
            clients and never miss another referral.
          </p>

          <a
            href="https://app.clientpro.io/register"
            className="mt-6 block w-full rounded-lg bg-primary py-3 text-center font-semibold text-white hover:bg-primary-dark transition-colors"
          >
            Start Getting Referrals &rarr;
          </a>
          <button
            onClick={() => setShowSignupCTA(false)}
            className="mt-3 text-sm text-gray-500 hover:text-gray-700"
          >
            Keep exploring demo
          </button>
        </div>
      </div>
    </div>
  );
}
