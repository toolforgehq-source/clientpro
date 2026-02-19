import { type ClassValue, clsx } from "@/lib/clsx";

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(" ");
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, "");
  if (digits.length === 0) return "";
  if (digits.length <= 1) return `+${digits}`;
  if (digits.length <= 4) return `+${digits.slice(0, 1)} (${digits.slice(1)}`;
  if (digits.length <= 7)
    return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4)}`;
  return `+${digits.slice(0, 1)} (${digits.slice(1, 4)}) ${digits.slice(4, 7)}-${digits.slice(7, 11)}`;
}

export function toE164(formatted: string): string {
  const digits = formatted.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) return `+${digits}`;
  if (digits.length === 10) return `+1${digits}`;
  return `+${digits}`;
}

export function formatDate(date: string | Date): string {
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export function formatRelativeDate(date: string | Date): string {
  const now = new Date();
  const target = new Date(date);
  const diffMs = target.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    const absDays = Math.abs(diffDays);
    if (absDays === 0) return "today";
    if (absDays === 1) return "yesterday";
    if (absDays < 7) return `${absDays} days ago`;
    if (absDays < 30) return `${Math.floor(absDays / 7)} weeks ago`;
    return formatDate(date);
  }

  if (diffDays === 0) return "today";
  if (diffDays === 1) return "tomorrow";
  if (diffDays < 7) return `in ${diffDays} days`;
  if (diffDays < 30) return `in ${Math.floor(diffDays / 7)} weeks`;
  return formatDate(date);
}

export function getEngagementColor(score: number): string {
  if (score >= 70) return "text-green-700 bg-green-100";
  if (score >= 40) return "text-yellow-700 bg-yellow-100";
  return "text-red-700 bg-red-100";
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "delivered":
    case "sent":
    case "converted":
      return "text-green-700 bg-green-100";
    case "scheduled":
    case "pending":
    case "new":
    case "contacted":
      return "text-blue-700 bg-blue-100";
    case "failed":
    case "lost":
      return "text-red-700 bg-red-100";
    case "qualified":
      return "text-purple-700 bg-purple-100";
    case "cancelled":
      return "text-gray-700 bg-gray-100";
    default:
      return "text-gray-700 bg-gray-100";
  }
}

export const US_STATES = [
  "AL","AK","AZ","AR","CA","CO","CT","DE","FL","GA",
  "HI","ID","IL","IN","IA","KS","KY","LA","ME","MD",
  "MA","MI","MN","MS","MO","MT","NE","NV","NH","NJ",
  "NM","NY","NC","ND","OH","OK","OR","PA","RI","SC",
  "SD","TN","TX","UT","VT","VA","WA","WV","WI","WY","DC",
];

export const PROPERTY_TYPES = [
  "single_family",
  "condo",
  "townhouse",
  "multi_family",
  "land",
  "other",
];

export const PROPERTY_TYPE_LABELS: Record<string, string> = {
  single_family: "Single Family",
  condo: "Condo",
  townhouse: "Townhouse",
  multi_family: "Multi-family",
  land: "Land",
  other: "Other",
};

export const TIER_LABELS: Record<string, string> = {
  starter: "Starter",
  professional: "Professional",
  elite: "Elite",
  team: "Team",
  brokerage: "Brokerage",
};

export const TIER_PRICES: Record<string, { monthly: number; annual: number }> = {
  starter: { monthly: 49, annual: 470 },
  professional: { monthly: 149, annual: 1490 },
  elite: { monthly: 299, annual: 2990 },
  team: { monthly: 799, annual: 7990 },
  brokerage: { monthly: 1499, annual: 14990 },
};

export const TIER_CLIENT_LIMITS: Record<string, number | string> = {
  starter: 20,
  professional: 100,
  elite: 500,
  team: 1000,
  brokerage: "Unlimited",
};
