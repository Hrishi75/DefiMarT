"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Message, User } from "@/types/marketplace";
import MessageBubble from "./MessageBubble";
import Link from "next/link";

interface ChatViewProps {
  conversationId: string;
  otherUser: User;
}

export default function ChatView({ conversationId, otherUser }: ChatViewProps) {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [sending, setSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    fetchMessages();
    markRead();

    // Poll for new messages every 5 seconds
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [conversationId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function fetchMessages() {
    try {
      const res = await fetch(`/api/messages/${conversationId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(
          (data.messages || []).map((m: any) => ({
            ...m,
            createdAt: new Date(m.createdAt),
          }))
        );
      }
    } catch {
      // Silently fail on poll
    } finally {
      setLoading(false);
    }
  }

  async function markRead() {
    try {
      await fetch(`/api/messages/${conversationId}`, {
        method: "PATCH",
      });
    } catch {}
  }

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || sending) return;

    setSending(true);
    const messageContent = content.trim();
    setContent("");

    // Optimistic add
    const optimisticMsg: Message = {
      id: `temp-${Date.now()}`,
      conversationId,
      senderId: user?.id ?? "",
      content: messageContent,
      read: false,
      createdAt: new Date(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await fetch(`/api/messages/${conversationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: messageContent }),
      });

      if (res.ok) {
        const data = await res.json();
        setMessages((prev) =>
          prev.map((m) =>
            m.id === optimisticMsg.id
              ? { ...data.message, createdAt: new Date(data.message.createdAt) }
              : m
          )
        );
      }
    } catch {
      // Revert optimistic on failure
      setMessages((prev) => prev.filter((m) => m.id !== optimisticMsg.id));
      setContent(messageContent);
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Chat Header */}
      <div className="flex items-center gap-3 p-4 border-b border-white/10">
        <Link href={`/profile/${otherUser.id}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold">
            {otherUser.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        </Link>
        <div>
          <Link
            href={`/profile/${otherUser.id}`}
            className="font-medium hover:text-lime-400 transition"
          >
            {otherUser.displayName ?? "Unknown"}
          </Link>
          <p className="text-xs text-white/40">@{otherUser.username}</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {loading ? (
          <div className="flex items-center justify-center h-full">
            <div className="animate-spin w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full" />
          </div>
        ) : messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-white/30 text-sm">
            No messages yet. Say hello!
          </div>
        ) : (
          <>
            {messages.map((msg) => (
              <MessageBubble
                key={msg.id}
                message={msg}
                isOwnMessage={msg.senderId === user?.id}
              />
            ))}
            <div ref={messagesEndRef} />
          </>
        )}
      </div>

      {/* Input */}
      <form
        onSubmit={handleSend}
        className="p-4 border-t border-white/10 flex gap-3"
      >
        <input
          type="text"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 bg-neutral-800 border border-white/10 rounded-full px-4 py-2.5 text-sm text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
        />
        <button
          type="submit"
          disabled={sending || !content.trim()}
          className="px-5 py-2.5 bg-lime-400 text-neutral-950 rounded-full text-sm font-medium hover:bg-lime-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </form>
    </div>
  );
}
