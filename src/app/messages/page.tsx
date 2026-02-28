"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Conversation } from "@/types/marketplace";
import ConversationList from "@/components/messages/ConversationList";
import ChatView from "@/components/messages/ChatView";
import Tag from "@/components/Tag";

export default function MessagesPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
      </div>
    }>
      <MessagesPageInner />
    </Suspense>
  );
}

function MessagesPageInner() {
  const searchParams = useSearchParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(
    searchParams.get("conversation")
  );

  useEffect(() => {
    if (isAuthenticated) {
      fetchConversations();
    }
  }, [isAuthenticated]);

  useEffect(() => {
    const convoParam = searchParams.get("conversation");
    if (convoParam) {
      setActiveConversationId(convoParam);
    }
  }, [searchParams]);

  async function fetchConversations() {
    setLoading(true);
    try {
      const res = await fetch("/api/messages");
      if (res.ok) {
        const data = await res.json();
        setConversations(
          (data.conversations || []).map((c: any) => ({
            ...c,
            lastMessageAt: new Date(c.lastMessageAt),
            createdAt: new Date(c.createdAt),
            lastMessage: c.lastMessage
              ? { ...c.lastMessage, createdAt: new Date(c.lastMessage.createdAt) }
              : undefined,
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch conversations:", err);
    } finally {
      setLoading(false);
    }
  }

  const activeConversation = conversations.find(
    (c) => c.id === activeConversationId
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">💬</div>
          <h2 className="text-2xl font-medium mb-2">Messages</h2>
          <p className="text-white/50">Connect your wallet to view messages.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-0">
      <div className="container max-w-6xl">
        <div className="flex justify-center mb-6">
          <Tag>Messages</Tag>
        </div>
        <h1 className="text-3xl font-bold text-center mb-8">Direct Messages</h1>

        <div className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden" style={{ height: "calc(100vh - 250px)" }}>
          <div className="flex h-full">
            {/* Conversation List */}
            <div className={`w-full md:w-80 border-r border-white/10 overflow-y-auto flex-shrink-0 ${
              activeConversationId ? "hidden md:block" : ""
            }`}>
              <div className="p-4 border-b border-white/10">
                <h2 className="font-medium text-sm text-white/50">Conversations</h2>
              </div>
              {loading ? (
                <div className="p-6 space-y-4">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="flex gap-3 animate-pulse">
                      <div className="w-10 h-10 rounded-full bg-neutral-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-neutral-800 rounded w-24" />
                        <div className="h-3 bg-neutral-800 rounded w-32" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <ConversationList
                  conversations={conversations}
                  activeConversationId={activeConversationId ?? undefined}
                  onSelect={(id) => setActiveConversationId(id)}
                />
              )}
            </div>

            {/* Chat Area */}
            <div className={`flex-1 flex flex-col ${
              !activeConversationId ? "hidden md:flex" : ""
            }`}>
              {activeConversation ? (
                <>
                  {/* Mobile back button */}
                  <div className="md:hidden p-2 border-b border-white/10">
                    <button
                      onClick={() => setActiveConversationId(null)}
                      className="flex items-center gap-2 text-sm text-white/50 hover:text-white transition"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                      Back
                    </button>
                  </div>
                  <ChatView
                    conversationId={activeConversation.id}
                    otherUser={activeConversation.otherUser}
                  />
                </>
              ) : (
                <div className="flex-1 flex items-center justify-center text-white/30">
                  <div className="text-center">
                    <div className="text-5xl mb-4">💬</div>
                    <p>Select a conversation to start messaging</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
