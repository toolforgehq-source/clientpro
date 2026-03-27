"use client";

import { useState } from "react";
import { MessageSquare, Clock, Send, MessageCircle } from "lucide-react";
import { useDemo } from "@/context/DemoContext";
import { DEMO_MESSAGES_SENT, DEMO_MESSAGES_UPCOMING } from "@/lib/demoData";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import { formatDate, getStatusColor } from "@/lib/utils";

type Tab = "upcoming" | "sent" | "replies";

export default function DemoMessagesPage() {
  const { triggerCTA } = useDemo();
  const [activeTab, setActiveTab] = useState<Tab>("upcoming");

  const replies = DEMO_MESSAGES_SENT.filter((m) => m.reply_text);

  const tabs: { key: Tab; label: string; icon: React.ReactNode; count: number }[] = [
    {
      key: "upcoming",
      label: "Upcoming",
      icon: <Clock className="h-4 w-4" />,
      count: DEMO_MESSAGES_UPCOMING.length,
    },
    {
      key: "sent",
      label: "Sent",
      icon: <Send className="h-4 w-4" />,
      count: DEMO_MESSAGES_SENT.length,
    },
    {
      key: "replies",
      label: "Replies",
      icon: <MessageCircle className="h-4 w-4" />,
      count: replies.length,
    },
  ];

  return (
    <div>
      <Header
        title="Messages"
        actions={
          <Button onClick={() => triggerCTA("send a custom message")}>
            <MessageSquare className="mr-2 h-4 w-4" /> Send Custom Message
          </Button>
        }
      />

      <div className="mb-6 flex gap-2 border-b border-gray-200">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.key
                ? "border-primary text-primary"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {tab.icon}
            {tab.label}
            <span
              className={`ml-1 rounded-full px-2 py-0.5 text-xs ${
                activeTab === tab.key ? "bg-primary/10 text-primary" : "bg-gray-100 text-gray-500"
              }`}
            >
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {activeTab === "upcoming" && (
        <div className="space-y-3">
          {DEMO_MESSAGES_UPCOMING.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-gray-900">
                      {msg.client_first_name} {msg.client_last_name}
                    </span>
                    <Badge className={getStatusColor(msg.status)}>{msg.status}</Badge>
                    <span className="text-xs text-gray-500">{msg.message_type}</span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{msg.message_text}</p>
                  <p className="text-xs text-gray-400">
                    Scheduled for {formatDate(msg.scheduled_for)}
                  </p>
                </div>
                <div className="ml-4 flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => triggerCTA("edit this message")}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => triggerCTA("cancel this message")}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === "sent" && (
        <div className="space-y-3">
          {[...DEMO_MESSAGES_SENT]
            .sort((a, b) => new Date(b.sent_at || b.scheduled_for).getTime() - new Date(a.sent_at || a.scheduled_for).getTime())
            .map((msg) => (
              <div
                key={msg.id}
                className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {msg.client_first_name} {msg.client_last_name}
                      </span>
                      <Badge className={getStatusColor(msg.status)}>{msg.status}</Badge>
                      <span className="text-xs text-gray-500">{msg.message_type}</span>
                    </div>
                    <p className="text-sm text-gray-600 mb-2">{msg.message_text}</p>
                    <p className="text-xs text-gray-400">
                      Sent {formatDate(msg.sent_at || msg.scheduled_for)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
        </div>
      )}

      {activeTab === "replies" && (
        <div className="space-y-3">
          {replies.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center">
              <MessageCircle className="mx-auto h-12 w-12 text-gray-300" />
              <p className="mt-2 text-gray-500">No replies yet</p>
            </div>
          ) : (
            replies
              .sort((a, b) => new Date(b.reply_at || "").getTime() - new Date(a.reply_at || "").getTime())
              .map((msg) => (
                <div
                  key={msg.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-gray-900">
                        {msg.client_first_name} {msg.client_last_name}
                      </span>
                      {!msg.reply_read && (
                        <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700">
                          New
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="space-y-2 rounded-lg bg-gray-50 p-3">
                    <div className="flex justify-end">
                      <div className="max-w-[80%] rounded-xl rounded-br-sm bg-primary px-3 py-2 text-sm text-white">
                        {msg.message_text}
                      </div>
                    </div>
                    <div className="flex justify-start">
                      <div className="max-w-[80%] rounded-xl rounded-bl-sm bg-white border border-gray-200 px-3 py-2 text-sm text-gray-900">
                        {msg.reply_text}
                      </div>
                    </div>
                  </div>
                  <p className="mt-2 text-xs text-gray-400">
                    Replied {formatDate(msg.reply_at || "")}
                  </p>
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
