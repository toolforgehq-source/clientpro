"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Users, MessageSquare, MessageCircle, UserPlus, Calendar } from "lucide-react";
import { useAuth } from "@/context/AuthContext";
import { api, Message, Client } from "@/lib/api";
import Header from "@/components/dashboard/Header";
import StatCard from "@/components/dashboard/StatCard";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate, formatRelativeDate, TIER_CLIENT_LIMITS } from "@/lib/utils";

interface RecentActivity {
  type: "message_sent" | "client_added" | "referral";
  description: string;
  date: string;
  link: string;
}

export default function DashboardHome() {
  const { user, usage } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [recentClients, setRecentClients] = useState<Client[]>([]);
  const [replyCount, setReplyCount] = useState(0);
  const [referralCount, setReferralCount] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      const [messagesRes, clientsRes, referralsRes] = await Promise.all([
        api.messages.list({ status: "sent", limit: 10 }),
        api.clients.list({ limit: 5 }),
        api.referrals.list({ limit: 100 }),
      ]);

      if (messagesRes.data) {
        setRecentMessages(messagesRes.data.messages || []);
        const replies = (messagesRes.data.messages || []).filter(
          (m) => m.reply_text && !m.reply_read
        );
        setReplyCount(replies.length);
      }
      if (clientsRes.data) {
        setRecentClients(clientsRes.data.clients || []);
      }
      if (referralsRes.data) {
        const thisYear = new Date().getFullYear();
        const yearReferrals = (referralsRes.data.referrals || []).filter(
          (r) => new Date(r.created_at).getFullYear() === thisYear
        );
        setReferralCount(yearReferrals.length);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) return <LoadingSpinner size="lg" text="Loading dashboard..." />;

  const clientLimit = user ? TIER_CLIENT_LIMITS[user.subscription_tier] : 20;
  const activities: RecentActivity[] = [
    ...recentMessages.slice(0, 5).map((m) => ({
      type: "message_sent" as const,
      description: `Message sent to ${m.client_first_name} ${m.client_last_name} - ${m.message_type}`,
      date: m.sent_at || m.scheduled_date,
      link: `/clients/${m.client_id}`,
    })),
    ...recentClients.slice(0, 5).map((c) => ({
      type: "client_added" as const,
      description: `Client added: ${c.first_name} ${c.last_name}`,
      date: c.created_at,
      link: `/clients/${c.id}`,
    })),
  ]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div>
      <Header title={`Welcome back, ${user?.first_name}`} />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Clients"
          value={usage?.clients_count ?? 0}
          subtitle={`of ${clientLimit} limit`}
          icon={<Users className="h-6 w-6" />}
          href="/clients"
        />
        <StatCard
          title="Messages Sent"
          value={usage?.messages_sent_this_month ?? 0}
          subtitle="this month"
          icon={<MessageSquare className="h-6 w-6" />}
          href="/messages"
        />
        <StatCard
          title="Client Replies"
          value={`${replyCount} unread`}
          subtitle="responses from clients"
          icon={<MessageCircle className="h-6 w-6" />}
          href="/messages?tab=replies"
          badge={replyCount}
        />
        <StatCard
          title="Referrals"
          value={referralCount}
          subtitle="this year"
          icon={<UserPlus className="h-6 w-6" />}
          href="/referrals"
        />
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 md:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
          <div className="mt-4 space-y-3">
            <button
              onClick={() => router.push("/clients/new")}
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
              onClick={() => router.push("/messages")}
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
          {activities.length === 0 ? (
            <EmptyState
              icon={<MessageSquare className="h-12 w-12" />}
              title="No activity yet"
              description="Add your first client to get started"
              actionLabel="Add Client"
              onAction={() => router.push("/clients/new")}
            />
          ) : (
            <div className="mt-4 space-y-3">
              {activities.map((activity, i) => (
                <button
                  key={i}
                  onClick={() => router.push(activity.link)}
                  className="flex w-full items-start gap-3 rounded-lg p-2 text-left hover:bg-gray-50 transition-colors"
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
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
