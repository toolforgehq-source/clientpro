"use client";

import { useEffect, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { MessageSquare, Clock, CheckCircle, MessageCircle, Send } from "lucide-react";
import { api, Message } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Header from "@/components/dashboard/Header";
import Button from "@/components/ui/Button";
import Badge from "@/components/ui/Badge";
import Modal from "@/components/ui/Modal";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import EmptyState from "@/components/ui/EmptyState";
import CustomMessageModal from "@/components/dashboard/CustomMessageModal";
import ConversationThread from "@/components/dashboard/ConversationThread";
import { formatDate, formatRelativeDate, getStatusColor } from "@/lib/utils";

interface ConversationPreview {
  client_id: string;
  client_first_name: string;
  client_last_name: string;
  latest_reply_text: string;
  latest_reply_at: string;
  has_unread: boolean;
  reply_count: number;
}

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
  const [customMessageOpen, setCustomMessageOpen] = useState(false);
  const [conversations, setConversations] = useState<ConversationPreview[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);

  const fetchMessages = useCallback(async () => {
    setLoading(true);
    if (tab === "replies") {
      const { data } = await api.messages.replies();
      if (data) {
        const clientMap = new Map<string, ConversationPreview>();
        for (const msg of data.replies) {
          const key = msg.client_id;
          const existing = clientMap.get(key);
          if (!existing) {
            clientMap.set(key, {
              client_id: msg.client_id,
              client_first_name: msg.client_first_name || "",
              client_last_name: msg.client_last_name || "",
              latest_reply_text: msg.reply_text || "",
              latest_reply_at: msg.reply_at || "",
              has_unread: !msg.is_read,
              reply_count: 1,
            });
          } else {
            existing.reply_count++;
            if (!msg.is_read) existing.has_unread = true;
          }
        }
        setConversations(Array.from(clientMap.values()));
      }
      setLoading(false);
    } else {
      let status: string | undefined;
      if (tab === "upcoming") status = "scheduled";
      else if (tab === "sent") status = "sent";

      const { data } = await api.messages.list({ status, limit: 100 });
      if (data) {
        setMessages(data.messages || []);
      }
      setLoading(false);
    }
  }, [tab]);

  useEffect(() => {
    setActiveConversation(null);
    fetchMessages();
  }, [fetchMessages]);

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
      const date = new Date(msg.scheduled_for);
      let group: string;
      if (date <= thisWeekEnd) group = "This Week";
      else if (date <= nextWeekEnd) group = "Next Week";
      else group = formatDate(msg.scheduled_for);

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

  const unreadConversations = conversations.filter((c) => c.has_unread).length;

  return (
    <div>
      <Header title="Messages" />

      <div className="mb-4 flex justify-end">
        <Button onClick={() => setCustomMessageOpen(true)}>
          <Send className="mr-2 h-4 w-4" />
          Send Custom Message
        </Button>
      </div>

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
              {t.key === "replies" && unreadConversations > 0 && (
                <span className="rounded-full bg-red-500 px-1.5 py-0.5 text-xs text-white">
                  {unreadConversations}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading messages..." />
      ) : tab === "replies" ? (
        activeConversation ? (
          <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <ConversationThread
              clientId={activeConversation}
              onBack={() => {
                setActiveConversation(null);
                fetchMessages();
              }}
            />
          </div>
        ) : conversations.length === 0 ? (
          <div className="rounded-xl border border-gray-200 bg-white p-8">
            <EmptyState
              icon={<MessageCircle className="h-16 w-16" />}
              title="No replies yet"
              description="When clients reply to your messages, conversations will appear here. You can reply back directly from the dashboard."
            />
          </div>
        ) : (
          <div className="space-y-2">
            {conversations.map((convo) => (
              <button
                key={convo.client_id}
                onClick={() => setActiveConversation(convo.client_id)}
                className="w-full rounded-xl border border-gray-200 bg-white p-4 shadow-sm text-left hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-start gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                    {convo.client_first_name[0]}{convo.client_last_name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-semibold text-gray-900">
                        {convo.client_first_name} {convo.client_last_name}
                      </span>
                      <span className="text-xs text-gray-400">
                        {convo.latest_reply_at ? formatRelativeDate(convo.latest_reply_at) : ""}
                      </span>
                    </div>
                    <p className="mt-0.5 text-sm text-gray-500 truncate">
                      {convo.latest_reply_text}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {convo.has_unread && (
                      <span className="h-2.5 w-2.5 rounded-full bg-primary" />
                    )}
                    {convo.reply_count > 1 && (
                      <Badge className="bg-gray-100 text-gray-600">{convo.reply_count}</Badge>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )
      ) : (tab === "upcoming" || tab === "sent") && messages.length === 0 ? (
        <div className="rounded-xl border border-gray-200 bg-white p-8">
          <EmptyState
            icon={<MessageSquare className="h-16 w-16" />}
            title={
              tab === "upcoming"
                ? "No upcoming messages"
                : "No sent messages yet"
            }
            description={
              tab === "upcoming"
                ? "Messages will appear here when clients are added"
                : "Sent messages will appear here"
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
                          Scheduled {formatDate(msg.scheduled_for)} ({formatRelativeDate(msg.scheduled_for)})
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
      ) : (
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
                    Sent {formatDate(msg.sent_at || msg.scheduled_for)}
                  </p>
                </div>
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

      <CustomMessageModal
        open={customMessageOpen}
        onClose={() => setCustomMessageOpen(false)}
        onSent={() => {
          fetchMessages();
        }}
      />
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
