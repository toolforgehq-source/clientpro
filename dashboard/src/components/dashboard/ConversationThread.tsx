"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Send, ArrowLeft, Phone, Sparkles, RefreshCw } from "lucide-react";
import { api, Message } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/ui/LoadingSpinner";
import ReplyIntentBadge from "@/components/dashboard/ReplyIntentBadge";
import { formatDate } from "@/lib/utils";

interface ConversationClient {
  id: string;
  first_name: string;
  last_name: string;
  phone_number: string;
}

interface ConversationThreadProps {
  clientId: string;
  onBack: () => void;
}

export default function ConversationThread({ clientId, onBack }: ConversationThreadProps) {
  const { toast } = useToast();
  const [client, setClient] = useState<ConversationClient | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [sending, setSending] = useState(false);
  const [reclassifyingId, setReclassifyingId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const fetchConversation = useCallback(async () => {
    const { data, error } = await api.messages.conversation(clientId);
    if (error) {
      toast("error", error);
      return;
    }
    if (data) {
      setClient(data.client);
      setMessages(data.messages);
    }
    setLoading(false);
  }, [clientId, toast]);

  useEffect(() => {
    fetchConversation();
  }, [fetchConversation]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendReply = async () => {
    if (!replyText.trim() || sending) return;
    setSending(true);
    const { data, error } = await api.messages.reply({
      client_id: clientId,
      message_text: replyText.trim(),
    });
    setSending(false);

    if (error) {
      toast("error", error);
      return;
    }

    if (data) {
      setMessages((prev) => [...prev, data.message]);
      setReplyText("");
      toast("success", "Reply sent");
    }
  };

  const handleReclassify = async (messageId: string) => {
    setReclassifyingId(messageId);
    const { data, error } = await api.messages.reclassifyReply(messageId);
    setReclassifyingId(null);
    if (error) {
      toast("error", error);
      return;
    }
    if (data?.message) {
      setMessages((prev) =>
        prev.map((m) => (m.id === data.message.id ? { ...m, ...data.message } : m))
      );
    }
  };

  // Find the single most-recent replied message so we can show the draft
  // response nudge only once — above the input — rather than under every
  // reply bubble. Agents want one clear action, not six.
  const latestReply = [...messages]
    .reverse()
    .find((m) => m.status === "replied" && m.reply_text);

  if (loading) {
    return <LoadingSpinner text="Loading conversation..." />;
  }

  return (
    <div className="flex h-[calc(100vh-220px)] flex-col">
      {/* Header */}
      <div className="flex items-center gap-3 border-b border-gray-200 pb-4">
        <button
          onClick={onBack}
          className="rounded-lg p-2 text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
          {client?.first_name?.[0]}{client?.last_name?.[0]}
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-gray-900">
            {client?.first_name} {client?.last_name}
          </h3>
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <Phone className="h-3 w-3" />
            {client?.phone_number}
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-sm text-gray-400 py-8">No messages yet</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className="space-y-2">
              {/* Agent's outgoing message */}
              <div className="flex justify-end">
                <div className="max-w-[75%]">
                  <div className="rounded-2xl rounded-br-md bg-primary px-4 py-2.5 text-sm text-white">
                    {msg.message_text}
                  </div>
                  <p className="mt-1 text-right text-[11px] text-gray-400">
                    {formatDate(msg.sent_at || msg.scheduled_for)}
                  </p>
                </div>
              </div>

              {/* Client's reply (if any) */}
              {msg.reply_text && (
                <div className="flex justify-start">
                  <div className="max-w-[75%]">
                    <div className="rounded-2xl rounded-bl-md bg-gray-100 px-4 py-2.5 text-sm text-gray-800">
                      {msg.reply_text}
                    </div>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="text-[11px] text-gray-400">
                        {msg.reply_at ? formatDate(msg.reply_at) : ""}
                      </p>
                      <ReplyIntentBadge
                        intent={msg.reply_intent}
                        confidence={msg.reply_intent_confidence}
                        size="xs"
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* AI suggested draft (if classifier produced one) */}
      {latestReply?.reply_draft_response && !replyText && (
        <div className="mb-3 rounded-xl border border-primary/20 bg-primary/5 p-3">
          <div className="flex items-start gap-2">
            <Sparkles className="h-4 w-4 shrink-0 text-primary mt-0.5" aria-hidden />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-semibold uppercase tracking-wide text-primary">
                  Suggested draft
                </span>
                {latestReply.reply_intent && (
                  <ReplyIntentBadge
                    intent={latestReply.reply_intent}
                    confidence={latestReply.reply_intent_confidence}
                    size="xs"
                  />
                )}
              </div>
              <p className="mt-1 text-sm text-gray-800">
                {latestReply.reply_draft_response}
              </p>
              <div className="mt-2 flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setReplyText(latestReply.reply_draft_response || "")
                  }
                  className="rounded-lg bg-primary px-3 py-1 text-xs font-medium text-white hover:bg-primary/90"
                >
                  Use draft
                </button>
                <button
                  type="button"
                  onClick={() => handleReclassify(latestReply.id)}
                  disabled={reclassifyingId === latestReply.id}
                  className="inline-flex items-center gap-1 rounded-lg border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                >
                  <RefreshCw
                    className={`h-3 w-3 ${reclassifyingId === latestReply.id ? "animate-spin" : ""}`}
                    aria-hidden
                  />
                  Regenerate
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Reply input */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex gap-2">
          <div className="relative flex-1">
            <textarea
              value={replyText}
              onChange={(e) => setReplyText(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSendReply();
                }
              }}
              placeholder="Type your reply..."
              rows={2}
              maxLength={320}
              className="w-full resize-none rounded-xl border border-gray-300 px-4 py-3 pr-16 text-sm focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
            <span className="absolute bottom-2 right-3 text-[11px] text-gray-400">
              {replyText.length}/320
            </span>
          </div>
          <Button
            onClick={handleSendReply}
            disabled={!replyText.trim() || sending}
            loading={sending}
            className="self-end"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-1.5 text-[11px] text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
