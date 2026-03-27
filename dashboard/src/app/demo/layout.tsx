"use client";

import { DemoProvider } from "@/context/DemoContext";
import DemoSidebar from "@/components/demo/DemoSidebar";
import SignupCTAModal from "@/components/demo/SignupCTAModal";

export default function DemoLayout({ children }: { children: React.ReactNode }) {
  return (
    <DemoProvider>
      <div className="min-h-screen bg-gray-50">
        {/* Demo Mode Banner */}
        <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-primary to-accent px-4 py-2 text-center text-sm font-medium text-white">
          <span className="mr-2">You&apos;re viewing a demo</span>
          <span className="hidden sm:inline mr-2">&mdash; this is what your dashboard looks like with real clients.</span>
          <a
            href="https://app.clientpro.io/register"
            className="inline-flex items-center rounded-full bg-white/20 px-3 py-0.5 text-xs font-semibold hover:bg-white/30 transition-colors"
          >
            Sign Up for Real &rarr;
          </a>
        </div>

        <div className="pt-10">
          <DemoSidebar />
          <main className="lg:pl-64">
            <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 pt-16 lg:pt-8">
              {children}
            </div>
          </main>
        </div>

        <SignupCTAModal />
      </div>
    </DemoProvider>
  );
}
