"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";

interface FollowButtonProps {
  targetUserId: string;
  className?: string;
}

export default function FollowButton({ targetUserId, className }: FollowButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [following, setFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  const isOwnProfile = user?.id === targetUserId;

  useEffect(() => {
    if (isAuthenticated && !isOwnProfile) {
      checkFollowStatus();
    } else {
      setLoading(false);
    }
  }, [isAuthenticated, targetUserId]);

  async function checkFollowStatus() {
    try {
      const res = await fetch(`/api/follows?userId=${targetUserId}`);
      if (res.ok) {
        const data = await res.json();
        setFollowing(data.following);
      }
    } catch (err) {
      console.warn("Failed to check follow status:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggle() {
    if (!isAuthenticated || isOwnProfile || toggling) return;

    setToggling(true);
    // Optimistic update
    setFollowing((prev) => !prev);

    try {
      const res = await fetch("/api/follows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId }),
      });

      if (res.ok) {
        const data = await res.json();
        setFollowing(data.followed);
      } else {
        // Revert on error
        setFollowing((prev) => !prev);
      }
    } catch {
      setFollowing((prev) => !prev);
    } finally {
      setToggling(false);
    }
  }

  if (isOwnProfile || !isAuthenticated) return null;

  return (
    <button
      onClick={handleToggle}
      disabled={loading || toggling}
      className={`px-6 py-2.5 rounded-full font-medium text-sm transition ${
        following
          ? "bg-neutral-900 border border-white/10 text-white hover:border-red-400 hover:text-red-400"
          : "bg-lime-400 text-neutral-950 hover:bg-lime-300"
      } disabled:opacity-50 ${className ?? ""}`}
    >
      {loading ? "..." : following ? "Following" : "Follow"}
    </button>
  );
}
