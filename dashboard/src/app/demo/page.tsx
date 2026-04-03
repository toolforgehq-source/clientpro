"use client";

import { useRouter } from "next/navigation";
import { Users, MessageSquare, MessageCircle, UserPlus, Calendar } from "lucide-react";
import { useDemo } from "@/context/DemoContext";
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import { DEMO_CLIENTS, DEMO_MESSAGES_SENT, DEMO_REFERRALS } from "@/lib/demoData";
import { formatRelativeDate } from "@/lib/utils";

interface RecentActivity {
  type: "message_sent" | "client_added" | "referral";
  description: string;
  date: string;
}

export default function DemoDashboard() {
  const { user, usage, triggerCTA } = useDemo();
  const router = useRouter();

  const unreadReplies = DEMO_MESSAGES_SENT.filter(
    (m) => m.reply_text && !m.is_read
  ).length;

  const thisYearReferrals = DEMO_REFERRALS.length;

  const activities: RecentActivity[] = [
    ...DEMO_MESSAGES_SENT.slice(-5).map((m) => ({
      type: "message_sent" as const,
      description: `Message sent to ${m.client_first_name} ${m.client_last_name} - ${m.message_type}`,
      date: m.sent_at || m.scheduled_for,
    })),
    ...DEMO_CLIENTS.slice(-3).map((c) => ({
      type: "client_added" as const,
      description: `Client added: ${c.first_name} ${c.last_name}`,
      date: c.created_at,
    })),
    ...DEMO_REFERRALS.map((r) => ({
      type: "referral" as const,
      description: `Referral from ${r.referring_client_name}: ${r.referral_first_name} ${r.referral_last_name}`,
      date: r.created_at,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 8);

  return (
    <div>
      <Header title={`Welcome back, ${user.first_name}`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={usage.clients_count}
          subtitle="of 100 limit"
          icon={<Users className="h-6 w-6" />}
          href="/demo/clients"
        />
        <StatCard
          title="Messages Sent"
          value={usage.messages_sent_this_month}
          subtitle="this month"
          icon={<MessageSquare className="h-6 w-6" />}
          href="/demo/messages"
        />
        <StatCard
          title="Client Replies"
          value={`${unreadReplies} unread`}
          subtitle="responses from clients"
          icon={<MessageCircle className="h-6 w-6" />}
          href="/demo/messages"
          badge={unreadReplies}
        />
        <StatCard
          title="Referrals"
          value={thisYearReferrals}
          subtitle="this year"
          icon={<UserPlus className="h-6 w-6" />}
          href="/demo/referrals"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            <button
              onClick={() => triggerCTA("add your first client")}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="rounded-lg bg-primary-50 p-2">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900">Add New Client</p>
                <p className="text-sm text-gray-500">Start automating follow-up</p>
              </div>
            </button>
            <button
              onClick={() => router.push("/demo/messages")}
              className="flex w-full items-center gap-3 rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50 transition-colors"
            >
              <div className="rounded-lg bg-primary-50 p-2">
                <Calendar className="h-5 w-5 text-primary" />
              </div>
              <div>
                <p className="font-medium text-gray-900">View Message Schedule</p>
                <p className="text-sm text-gray-500">See upcoming automated messages</p>
              </div>
            </button>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <div className="mt-4 space-y-3">
            {activities.map((activity, i) => (
              <div
                key={i}
                className="flex items-start gap-3 rounded-lg p-2"
              >
                <div className="mt-0.5 rounded-full bg-gray-100 p-1.5">
                  {activity.type === "message_sent" ? (
                    <MessageSquare className="h-3.5 w-3.5 text-gray-500" />
                  ) : activity.type === "client_added" ? (
                    <Users className="h-3.5 w-3.5 text-gray-500" />
                  ) : (
                    <UserPlus className="h-3.5 w-3.5 text-gray-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="truncate text-sm text-gray-900">{activity.description}</p>
                  <p className="text-xs text-gray-500">{formatRelativeDate(activity.date)}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
