"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types/marketplace";
import Link from "next/link";

const notificationIcons: Record<string, { icon: string; color: string }> = {
  sale:     { icon: "💰", color: "bg-lime-400/20" },
  purchase: { icon: "🛒", color: "bg-blue-400/20" },
  follow:   { icon: "👤", color: "bg-purple-400/20" },
  like:     { icon: "❤️", color: "bg-pink-400/20" },
  comment:  { icon: "💬", color: "bg-cyan-400/20" },
  message:  { icon: "✉️", color: "bg-yellow-400/20" },
  review:   { icon: "⭐", color: "bg-orange-400/20" },
};

function formatTime(date: Date) {
  const d = date instanceof Date ? date : new Date(date);
  const diff = Date.now() - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return d.toLocaleDateString();
}

export default function NotificationBell() {
  const { isAuthenticated } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Poll unread count every 30s
  useEffect(() => {
    if (!isAuthenticated) {
      setUnreadCount(0);
      return;
    }
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 30000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    if (open) document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  async function fetchUnreadCount() {
    try {
      const res = await fetch("/api/notifications?countOnly=true");
      if (res.ok) {
        const data = await res.json();
        setUnreadCount(data.unreadCount ?? 0);
      }
    } catch {
      // Silently fail
    }
  }

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications?limit=6");
      if (res.ok) {
        const data = await res.json();
        setNotifications(
          (data.notifications || []).map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
        );
      }
    } catch {
      // Silently fail
    } finally {
      setLoading(false);
    }
  }

  async function markAsRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch {
      // Silently fail
    }
  }

  async function markAllAsRead() {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      // Silently fail
    }
  }

  function handleToggle() {
    if (!open) {
      fetchNotifications();
    }
    setOpen((v) => !v);
  }

  if (!isAuthenticated) return null;

  return (
    <div ref={ref} className="relative">
      {/* Bell button */}
      <button
        onClick={handleToggle}
        className="relative p-2 rounded-full hover:bg-white/5 transition"
        aria-label="Notifications"
      >
        <svg
          className="w-5 h-5 text-white/70 hover:text-white transition"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-80 bg-neutral-900 border border-white/10 rounded-2xl shadow-xl z-50 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
            <span className="font-medium text-sm">Notifications</span>
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="text-xs text-lime-400 hover:text-lime-300 transition"
              >
                Mark all read
              </button>
            )}
          </div>

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <div className="p-4 space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex gap-3 animate-pulse">
                    <div className="w-9 h-9 rounded-full bg-neutral-800 flex-shrink-0" />
                    <div className="flex-1 space-y-1.5">
                      <div className="h-3 bg-neutral-800 rounded w-3/4" />
                      <div className="h-2.5 bg-neutral-800 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center text-white/30 text-sm">
                No notifications yet
              </div>
            ) : (
              <div>
                {notifications.map((n) => {
                  const cfg = notificationIcons[n.type] ?? { icon: "📌", color: "bg-white/10" };
                  const inner = (
                    <div
                      onClick={() => { if (!n.read) markAsRead(n.id); }}
                      className={`flex items-start gap-3 px-4 py-3 transition cursor-pointer ${
                        n.read
                          ? "opacity-60 hover:opacity-80"
                          : "hover:bg-white/5"
                      }`}
                    >
                      <div className={`w-9 h-9 rounded-full ${cfg.color} flex items-center justify-center flex-shrink-0 text-sm`}>
                        {cfg.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className={`text-sm leading-snug truncate ${n.read ? "text-white/50" : "text-white"}`}>
                          {n.title}
                        </p>
                        {n.message && (
                          <p className="text-xs text-white/40 truncate mt-0.5">{n.message}</p>
                        )}
                        <p className="text-[10px] text-white/30 mt-1">{formatTime(n.createdAt)}</p>
                      </div>
                      {!n.read && (
                        <div className="w-2 h-2 rounded-full bg-lime-400 flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                  );

                  return n.link ? (
                    <Link key={n.id} href={n.link} onClick={() => setOpen(false)}>
                      {inner}
                    </Link>
                  ) : (
                    <div key={n.id}>{inner}</div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/10 px-4 py-2.5">
            <Link
              href="/notifications"
              onClick={() => setOpen(false)}
              className="block text-center text-xs text-lime-400 hover:text-lime-300 transition"
            >
              View all notifications
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
