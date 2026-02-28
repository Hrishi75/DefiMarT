"use client";

import { Conversation } from "@/types/marketplace";
import { twMerge } from "tailwind-merge";

interface ConversationListProps {
  conversations: Conversation[];
  activeConversationId?: string;
  onSelect: (conversationId: string) => void;
}

export default function ConversationList({
  conversations,
  activeConversationId,
  onSelect,
}: ConversationListProps) {
  function formatTime(date: Date) {
    const d = date instanceof Date ? date : new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d`;
    return d.toLocaleDateString();
  }

  if (conversations.length === 0) {
    return (
      <div className="p-6 text-center text-white/30 text-sm">
        No conversations yet
      </div>
    );
  }

  return (
    <div className="divide-y divide-white/5">
      {conversations.map((convo) => (
        <button
          key={convo.id}
          onClick={() => onSelect(convo.id)}
          className={twMerge(
            "w-full flex items-center gap-3 p-4 text-left transition hover:bg-white/5",
            activeConversationId === convo.id && "bg-white/5"
          )}
        >
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {convo.otherUser?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-2">
              <span className="font-medium text-sm truncate">
                {convo.otherUser?.displayName ?? "Unknown"}
              </span>
              <span className="text-xs text-white/30 flex-shrink-0">
                {formatTime(convo.lastMessageAt)}
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <p className="text-xs text-white/40 truncate">
                {convo.lastMessage?.content ?? "No messages yet"}
              </p>
              {convo.unreadCount > 0 && (
                <span className="w-5 h-5 bg-lime-400 text-neutral-950 text-[10px] font-bold rounded-full flex items-center justify-center flex-shrink-0">
                  {convo.unreadCount > 9 ? "9+" : convo.unreadCount}
                </span>
              )}
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}
