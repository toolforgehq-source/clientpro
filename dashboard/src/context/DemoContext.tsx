"use client";

import { createContext, useContext, useState, ReactNode } from "react";
import { DEMO_USER, DEMO_USAGE } from "@/lib/demoData";
import { User, Usage } from "@/lib/api";

interface DemoContextType {
  user: User;
  usage: Usage;
  isDemo: true;
  showSignupCTA: boolean;
  setShowSignupCTA: (show: boolean) => void;
  triggerCTA: (action?: string) => void;
  ctaAction: string;
}

const DemoContext = createContext<DemoContextType | undefined>(undefined);

export function DemoProvider({ children }: { children: ReactNode }) {
  const [showSignupCTA, setShowSignupCTA] = useState(false);
  const [ctaAction, setCtaAction] = useState("");

  const triggerCTA = (action?: string) => {
    setCtaAction(action || "unlock this feature");
    setShowSignupCTA(true);
  };

  return (
    <DemoContext.Provider
      value={{
        user: DEMO_USER,
        usage: DEMO_USAGE,
        isDemo: true,
        showSignupCTA,
        setShowSignupCTA,
        triggerCTA,
        ctaAction,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (context === undefined) {
    throw new Error("useDemo must be used within a DemoProvider");
  }
  return context;
}
