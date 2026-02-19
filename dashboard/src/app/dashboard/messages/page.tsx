"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Clock, CheckCircle, MessageCircle } from "lucide-react";
import { api, Message } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import { formatDate, formatRelativeDate, getStatusColor } from "@/lib/utils";

function MessagesContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const initialTab = searchParams.get("tab") || "upcoming";

  const [tab, setTab] = useState<"upcoming" | "sent" | "replies">(
    initialTab as "upcoming" | "sent" | "replies"
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [editModal, setEditModal] = useState<Message | null>(null);
  const [editText, setEditText] = useState("");
  const [saving, setSaving] = useState(false);
  const [cancelModal, setCancelModal] = useState<Message | null>(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    const fetchMessages = async () => {
      setLoading(true);
      let status: string | undefined;
      if (tab === "upcoming") status = "scheduled";
      else if (tab === "sent") status = "sent";

      const { data } = await api.messages.list({ status, limit: 100 });
      if (data) {
        let filtered = data.messages || [];
        if (tab === "replies") {
          filtered = filtered.filter((m) => m.reply_text);
        }
        setMessages(filtered);
      }
      setLoading(false);
    };
    fetchMessages();
  }, [tab]);

  const handleSave = async () => {
    if (!editModal) return;
    setSaving(true);
    const { error } = await api.messages.update(editModal.id, { message_text: editText });
    setSaving(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Message updated");
      setMessages((prev) =>
        prev.map((m) => (m.id === editModal.id ? { ...m, message_text: editText } : m))
      );
      setEditModal(null);
    }
  };

  const handleCancel = async () => {
    if (!cancelModal) return;
    setCancelling(true);
    const { error } = await api.messages.cancel(cancelModal.id);
    setCancelling(false);
    if (error) {
      toast("error", error);
    } else {
      toast("success", "Message cancelled");
      setMessages((prev) => prev.filter((m) => m.id !== cancelModal.id));
      setCancelModal(null);
    }
  };

  const groupByWeek = (msgs: Message[]) => {
    const groups: Record<string, Message[]> = {};
    const now = new Date();
    const thisWeekEnd = new Date(now);
    thisWeekEnd.setDate(now.getDate() + (7 - now.getDay()));
    const nextWeekEnd = new Date(thisWeekEnd);
    nextWeekEnd.setDate(thisWeekEnd.getDate() + 7);

    msgs.forEach((msg) => {
      const date = new Date(msg.scheduled_date);
      let group: string;
      if (date <= thisWeekEnd) group = "This Week";
      else if (date <= nextWeekEnd) group = "Next Week";
      else group = formatDate(msg.scheduled_date);

      if (!groups[group]) groups[group] = [];
      groups[group].push(msg);
    });
    return groups;
  };

  const tabs = [
    { key: "upcoming" as const, label: "Upcoming", icon: Clock },
    { key: "sent" as const, label: "Sent", icon: CheckCircle },
    { key: "replies" as const, label: "Replies", icon: MessageCircle },
  ];

  const unreadReplies = messages.filter((m) => m.reply_text && !m.reply_read).length;

  return (
    <div>
      <Header title="Messages" />

      <div className="mb-6 flex gap-1 rounded-lg bg-gray-100 p-1">
        {tabs.map((t) => {
          const Icon = t.icon;
          return (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                tab === t.key ? "bg-white text-gray-900 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <Icon className="h-4 w-4" />
              {t.label}
              {t.key === "replies" && unreadReplies > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                  {unreadReplies}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading messages..." />
      ) : messages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <EmptyState
            icon={<MessageSquare className="h-16 w-16" />}
            title={
              tab === "upcoming"
                ? "No upcoming messages"
                : tab === "sent"
                ? "No sent messages yet"
                : "No replies yet"
            }
            description={
              tab === "upcoming"
                ? "Messages will appear here when clients are added"
                : tab === "sent"
                ? "Sent messages will appear here"
                : "Client replies will appear here"
            }
          />
        </div>
      ) : tab === "upcoming" ? (
        <div className="space-y-6">
          {Object.entries(groupByWeek(messages)).map(([group, msgs]) => (
            <div key={group}>
              <h3 className="mb-3 text-sm font-semibold text-gray-500 uppercase">{group}</h3>
              <div className="space-y-2">
                {msgs.map((msg) => (
                  <div
                    key={msg.id}
                    className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <button
                          onClick={() => router.push(`/dashboard/clients/${msg.client_id}`)}
                          className="text-sm font-medium text-primary hover:underline"
                        >
                          {msg.client_first_name} {msg.client_last_name}
                        </button>
                        <p className="mt-1 text-sm text-gray-600 line-clamp-2">
                          {msg.message_text}
                        </p>
                        <p className="mt-2 text-xs text-gray-400">
                          Scheduled {formatDate(msg.scheduled_date)} ({formatRelativeDate(msg.scheduled_date)})
                        </p>
                      </div>
                      <div className="flex items-center gap-2 ml-4">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setEditModal(msg);
                            setEditText(msg.message_text);
                          }}
                        >
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setCancelModal(msg)}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : tab === "sent" ? (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => router.push(`/dashboard/clients/${msg.client_id}`)}
                      className="text-sm font-medium text-primary hover:underline"
                    >
                      {msg.client_first_name} {msg.client_last_name}
                    </button>
                    <Badge className={getStatusColor(msg.status)}>{msg.status}</Badge>
                  </div>
                  <p className="mt-1 text-sm text-gray-600 whitespace-pre-wrap">
                    {msg.message_text}
                  </p>
                  <p className="mt-2 text-xs text-gray-400">
                    Sent {formatDate(msg.sent_at || msg.scheduled_date)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <button
                    onClick={() => router.push(`/dashboard/clients/${msg.client_id}`)}
                    className="text-sm font-medium text-primary hover:underline"
                  >
                    {msg.client_first_name} {msg.client_last_name}
                  </button>
                  <div className="mt-2 rounded-lg bg-gray-50 p-3 text-sm text-gray-600">
                    <p className="text-xs font-medium text-gray-400 mb-1">Your message:</p>
                    {msg.message_text}
                  </div>
                  <div className="mt-2 rounded-lg bg-green-50 border border-green-100 p-3">
                    <p className="text-xs font-medium text-green-700 mb-1">Client replied:</p>
                    <p className="text-sm text-green-800">{msg.reply_text}</p>
                    <p className="mt-1 text-xs text-green-600">
                      {msg.reply_at ? formatDate(msg.reply_at) : ""}
                    </p>
                  </div>
                </div>
                {!msg.reply_read && (
                  <Badge className="bg-blue-100 text-blue-700 ml-2">New</Badge>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={!!editModal} onClose={() => setEditModal(null)} title="Edit Message">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Message Text</label>
            <textarea
              value={editText}
              onChange={(e) => setEditText(e.target.value)}
              rows={4}
              maxLength={160}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm"
            />
            <p className="mt-1 text-xs text-gray-400 text-right">
              {editText.length}/160 characters
            </p>
          </div>
          <div className="rounded-lg bg-gray-50 p-3">
            <p className="text-xs font-medium text-gray-500 mb-1">SMS Preview</p>
            <div className="rounded-lg bg-green-100 p-3 text-sm text-gray-800 max-w-[250px]">
              {editText || "..."}
            </div>
          </div>
          <div className="flex justify-end gap-3">
            <Button variant="ghost" onClick={() => setEditModal(null)}>Cancel</Button>
            <Button loading={saving} onClick={handleSave}>Save</Button>
          </div>
        </div>
      </Modal>

      <Modal open={!!cancelModal} onClose={() => setCancelModal(null)} title="Cancel Message">
        <p className="text-sm text-gray-600">
          Are you sure you want to cancel this message to{" "}
          <strong>
            {cancelModal?.client_first_name} {cancelModal?.client_last_name}
          </strong>
          ?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <Button variant="ghost" onClick={() => setCancelModal(null)}>Keep Message</Button>
          <Button variant="danger" loading={cancelling} onClick={handleCancel}>Cancel Message</Button>
        </div>
      </Modal>
    </div>
  );
}

export default function MessagesPage() {
  return (
    <Suspense fallback={<LoadingSpinner text="Loading messages..." />}>
      <MessagesContent />
    </Suspense>
  );
}
