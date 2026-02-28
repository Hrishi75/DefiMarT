"use client";

import { Message } from "@/types/marketplace";

interface MessageBubbleProps {
  message: Message;
  isOwnMessage: boolean;
}

export default function MessageBubble({ message, isOwnMessage }: MessageBubbleProps) {
  function formatTime(date: Date) {
    const d = date instanceof Date ? date : new Date(date);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  }

  return (
    <div className={`flex ${isOwnMessage ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isOwnMessage
            ? "bg-lime-400/20 text-white rounded-br-md"
            : "bg-neutral-800 text-white rounded-bl-md"
        }`}
      >
        <p className="text-sm leading-relaxed">{message.content}</p>
        <p className={`text-[10px] mt-1 ${isOwnMessage ? "text-lime-400/50" : "text-white/30"}`}>
          {formatTime(message.createdAt)}
        </p>
      </div>
    </div>
  );
}
