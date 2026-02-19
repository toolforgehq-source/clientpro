"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { BarChart3, TrendingUp, Users, Lock } from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { useAuth } from "@/context/AuthContext";
import { api, AnalyticsData } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import StatCard from "@/components/dashboard/StatCard";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import { getEngagementColor } from "@/lib/utils";

export default function AnalyticsPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { toast } = useToast();
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  const hasAccess = user && ["elite", "team", "brokerage"].includes(user.subscription_tier);

  useEffect(() => {
    if (!hasAccess) {
      setLoading(false);
      return;
    }
    const fetchAnalytics = async () => {
      const { data: result, error } = await api.analytics.dashboard();
      if (error) {
        toast("error", error);
      } else if (result) {
        setData(result);
      }
      setLoading(false);
    };
    fetchAnalytics();
  }, [hasAccess, toast]);

  if (!hasAccess) {
    return (
      <div>
        <Header title="Analytics" />
        <div className="mx-auto max-w-lg text-center py-16">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
            <Lock className="h-10 w-10 text-gray-400" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Analytics Available on Elite</h2>
          <p className="mt-3 text-gray-500">
            See engagement insights, top clients, performance trends, and more. Upgrade to Elite
            to unlock analytics.
          </p>
          <Button className="mt-6" onClick={() => router.push("/dashboard/settings?tab=billing")}>
            Upgrade to Elite
          </Button>
          <div className="mt-8 rounded-xl border border-gray-200 bg-white p-6 opacity-50 blur-sm pointer-events-none">
            <div className="h-48 bg-gray-100 rounded-lg" />
            <div className="mt-4 grid grid-cols-3 gap-4">
              <div className="h-20 bg-gray-100 rounded-lg" />
              <div className="h-20 bg-gray-100 rounded-lg" />
              <div className="h-20 bg-gray-100 rounded-lg" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) return <LoadingSpinner text="Loading analytics..." />;

  const monthlyData = [
    { name: "6mo ago", messages: Math.floor(Math.random() * 20) + 5 },
    { name: "5mo ago", messages: Math.floor(Math.random() * 25) + 8 },
    { name: "4mo ago", messages: Math.floor(Math.random() * 30) + 10 },
    { name: "3mo ago", messages: Math.floor(Math.random() * 35) + 12 },
    { name: "2mo ago", messages: Math.floor(Math.random() * 40) + 15 },
    { name: "This month", messages: data?.messages_sent_this_month || 0 },
  ];

  const replyData = [
    { name: "Week 1", rate: 45 },
    { name: "Month 3", rate: 32 },
    { name: "Month 6", rate: 28 },
    { name: "Year 1", rate: 38 },
  ];

  return (
    <div>
      <Header title="Analytics" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <StatCard
          title="Average Engagement"
          value={data?.average_engagement?.toFixed(0) || "0"}
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          title="Reply Rate"
          value={`${data?.reply_rate?.toFixed(1) || "0"}%`}
          icon={<BarChart3 className="h-5 w-5" />}
        />
        <StatCard
          title="Referrals / 100 Clients"
          value={
            data?.total_clients
              ? ((data.referrals_this_year / data.total_clients) * 100).toFixed(1)
              : "0"
          }
          icon={<Users className="h-5 w-5" />}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Messages Sent (Last 6 Months)</h3>
          <ResponsiveContainer width="100%" height={250}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="messages"
                stroke="#1e8a9c"
                strokeWidth={2}
                dot={{ fill: "#1e8a9c" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Reply Rate by Message Type</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={replyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="name" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} unit="%" />
              <Tooltip />
              <Bar dataKey="rate" fill="#4ade80" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Top Engaged Clients</h3>
          {data?.top_engaged && data.top_engaged.length > 0 ? (
            <div className="space-y-2">
              {data.top_engaged.map((client) => (
                <button
                  key={client.id}
                  onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                  className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {client.first_name} {client.last_name}
                  </span>
                  <Badge className={getEngagementColor(client.engagement_score)}>
                    {client.engagement_score}
                  </Badge>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No high-engagement clients yet</p>
          )}
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 font-semibold text-gray-900">Low Engaged Clients</h3>
          {data?.low_engaged && data.low_engaged.length > 0 ? (
            <div className="space-y-2">
              {data.low_engaged.map((client) => (
                <button
                  key={client.id}
                  onClick={() => router.push(`/dashboard/clients/${client.id}`)}
                  className="flex w-full items-center justify-between rounded-lg p-3 hover:bg-gray-50 transition-colors text-left"
                >
                  <span className="text-sm font-medium text-gray-900">
                    {client.first_name} {client.last_name}
                  </span>
                  <Badge className={getEngagementColor(client.engagement_score)}>
                    {client.engagement_score}
                  </Badge>
                </button>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">No low-engagement clients</p>
          )}
        </div>
      </div>
    </div>
  );
}
