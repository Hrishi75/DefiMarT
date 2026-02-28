"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Notification } from "@/types/marketplace";
import Link from "next/link";
import Button from "@/components/Button";

const notificationIcons: Record<string, { icon: string; color: string }> = {
  sale: { icon: "💰", color: "bg-lime-400/20" },
  purchase: { icon: "🛒", color: "bg-blue-400/20" },
  follow: { icon: "👤", color: "bg-purple-400/20" },
  like: { icon: "❤️", color: "bg-pink-400/20" },
  comment: { icon: "💬", color: "bg-cyan-400/20" },
  message: { icon: "✉️", color: "bg-yellow-400/20" },
};

export default function NotificationsPage() {
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [markingAll, setMarkingAll] = useState(false);

  useEffect(() => {
    if (isAuthenticated) {
      fetchNotifications();
    }
  }, [isAuthenticated]);

  async function fetchNotifications() {
    setLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(
          (data.notifications || []).map((n: any) => ({
            ...n,
            createdAt: new Date(n.createdAt),
          }))
        );
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleMarkAsRead(id: string) {
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n.id === id ? { ...n, read: true } : n))
      );
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  }

  async function handleMarkAllAsRead() {
    setMarkingAll(true);
    try {
      await fetch("/api/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    } finally {
      setMarkingAll(false);
    }
  }

  function formatTime(date: Date) {
    const diff = Date.now() - date.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    if (days < 7) return `${days}d ago`;
    return date.toLocaleDateString();
  }

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
          <div className="text-6xl mb-4">🔔</div>
          <h2 className="text-2xl font-medium mb-2">Notifications</h2>
          <p className="text-white/50">
            Connect your wallet to view notifications.
          </p>
        </div>
      </div>
    );
  }

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <div className="container max-w-2xl">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Notifications</h1>
            {unreadCount > 0 && (
              <p className="text-sm text-white/50 mt-1">
                {unreadCount} unread
              </p>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllAsRead}
              disabled={markingAll}
              className="text-sm text-lime-400 hover:text-lime-300 transition disabled:opacity-50"
            >
              Mark all as read
            </button>
          )}
        </div>

        {/* Notifications List */}
        {loading ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div
                key={i}
                className="bg-neutral-900 border border-white/10 rounded-2xl h-20 animate-pulse"
              />
            ))}
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-white/20 text-6xl mb-4">🔔</div>
            <h3 className="text-2xl font-medium mb-2">No notifications</h3>
            <p className="text-white/50">
              You&apos;re all caught up! Notifications will appear here when
              someone interacts with your posts or listings.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {notifications.map((notification) => {
              const iconConfig = notificationIcons[notification.type] ?? {
                icon: "📌",
                color: "bg-white/10",
              };

              const content = (
                <div
                  className={`flex items-start gap-4 p-4 rounded-2xl transition ${
                    notification.read
                      ? "bg-neutral-900/50 border border-white/5"
                      : "bg-neutral-900 border border-white/10 hover:border-white/20"
                  }`}
                  onClick={() => {
                    if (!notification.read) handleMarkAsRead(notification.id);
                  }}
                >
                  <div
                    className={`w-10 h-10 rounded-full ${iconConfig.color} flex items-center justify-center flex-shrink-0`}
                  >
                    {iconConfig.icon}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p
                        className={`text-sm ${
                          notification.read ? "text-white/50" : "text-white"
                        }`}
                      >
                        <span className="font-medium">
                          {notification.title}
                        </span>
                      </p>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className="text-xs text-white/30">
                          {formatTime(notification.createdAt)}
                        </span>
                        {!notification.read && (
                          <div className="w-2 h-2 rounded-full bg-lime-400" />
                        )}
                      </div>
                    </div>
                    {notification.message && (
                      <p className="text-sm text-white/40 mt-0.5 truncate">
                        {notification.message}
                      </p>
                    )}
                  </div>
                </div>
              );

              return notification.link ? (
                <Link key={notification.id} href={notification.link}>
                  {content}
                </Link>
              ) : (
                <div key={notification.id} className="cursor-pointer">
                  {content}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
