"use client";

import { Flame, HelpCircle, Heart, Clock, AlertTriangle, HelpCircle as Unknown } from "lucide-react";
import type { ReplyIntent } from "@/lib/api";

interface IntentMeta {
  label: string;
  className: string;
  Icon: typeof Flame;
  description: string;
}

const META: Record<ReplyIntent, IntentMeta> = {
  hot: {
    label: "Hot",
    className: "bg-red-100 text-red-700 border border-red-200",
    Icon: Flame,
    description: "Transaction or referral signal — reply soon",
  },
  question: {
    label: "Question",
    className: "bg-blue-100 text-blue-700 border border-blue-200",
    Icon: HelpCircle,
    description: "Client asked something — needs an answer",
  },
  warm: {
    label: "Warm",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
    Icon: Heart,
    description: "Friendly engagement — reply when free",
  },
  cold: {
    label: "Cold",
    className: "bg-gray-100 text-gray-600 border border-gray-200",
    Icon: Clock,
    description: "Polite deflection — acknowledge only",
  },
  negative: {
    label: "Negative",
    className: "bg-rose-100 text-rose-700 border border-rose-200",
    Icon: AlertTriangle,
    description: "Frustration or opt-out — handle carefully",
  },
  unknown: {
    label: "Unclassified",
    className: "bg-gray-50 text-gray-500 border border-gray-200",
    Icon: Unknown,
    description: "Couldn't confidently classify",
  },
};

export const INTENT_ORDER: ReplyIntent[] = [
  "hot",
  "question",
  "warm",
  "cold",
  "negative",
  "unknown",
];

interface ReplyIntentBadgeProps {
  intent: ReplyIntent | null | undefined;
  confidence?: number | null;
  size?: "sm" | "xs";
  showTooltip?: boolean;
}

export default function ReplyIntentBadge({
  intent,
  confidence,
  size = "sm",
  showTooltip = true,
}: ReplyIntentBadgeProps) {
  if (!intent) return null;
  const meta = META[intent];
  if (!meta) return null;
  const { Icon, label, className, description } = meta;
  const px = size === "xs" ? "px-1.5 py-0.5 text-[10px]" : "px-2 py-0.5 text-xs";
  const iconSize = size === "xs" ? "h-3 w-3" : "h-3.5 w-3.5";
  const title =
    showTooltip && typeof confidence === "number"
      ? `${description} (confidence ${(confidence * 100).toFixed(0)}%)`
      : description;
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full font-medium ${px} ${className}`}
    >
      <Icon className={iconSize} aria-hidden />
      {label}
    </span>
  );
}

export { META as REPLY_INTENT_META };
