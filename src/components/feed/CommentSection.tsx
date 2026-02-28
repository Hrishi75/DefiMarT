"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Comment } from "@/types/marketplace";
import Link from "next/link";

interface CommentSectionProps {
  postId: string;
  commentCount: number;
  onCommentCountChange?: (delta: number) => void;
}

export default function CommentSection({
  postId,
  commentCount,
  onCommentCountChange,
}: CommentSectionProps) {
  const { user, isAuthenticated } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [replyTo, setReplyTo] = useState<string | null>(null);

  useEffect(() => {
    fetchComments();
  }, [postId]);

  async function fetchComments() {
    setLoading(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`);
      if (res.ok) {
        const data = await res.json();
        setComments(data.comments || []);
      }
    } catch (err) {
      console.warn("Failed to load comments:", err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!content.trim() || !user) return;

    setSubmitting(true);
    try {
      const res = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: content.trim(),
          parentCommentId: replyTo,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.comment) {
          // Ensure the comment has user data
          const newComment: Comment = {
            ...data.comment,
            createdAt: new Date(data.comment.createdAt),
            user: data.comment.user || {
              id: user.id,
              username: user.username,
              displayName: user.display_name,
              walletAddress: user.wallet_address,
              verified: user.verified,
            },
          };
          setComments((prev) => [...prev, newComment]);
          setContent("");
          setReplyTo(null);
          onCommentCountChange?.(1);
        }
      }
    } catch (err) {
      console.error("Failed to post comment:", err);
    } finally {
      setSubmitting(false);
    }
  }

  // Group comments: top-level and replies
  const topLevel = comments.filter((c) => !c.parentCommentId);
  const replies = comments.filter((c) => c.parentCommentId);

  function getReplies(commentId: string) {
    return replies.filter((r) => r.parentCommentId === commentId);
  }

  function formatTime(date: Date) {
    const d = date instanceof Date ? date : new Date(date);
    const diff = Date.now() - d.getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return "just now";
    if (mins < 60) return `${mins}m`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h`;
    const days = Math.floor(hours / 24);
    return `${days}d`;
  }

  return (
    <div className="border-t border-white/10 pt-4 mt-4">
      {/* Comments List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(Math.min(commentCount, 2))].map((_, i) => (
            <div key={i} className="flex gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-full bg-neutral-800" />
              <div className="flex-1 h-12 bg-neutral-800 rounded-lg" />
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <p className="text-sm text-white/30 mb-4">No comments yet. Be the first!</p>
      ) : (
        <div className="space-y-3 mb-4 max-h-80 overflow-y-auto">
          {topLevel.map((comment) => (
            <div key={comment.id}>
              {/* Top-level comment */}
              <CommentItem
                comment={comment}
                onReply={() => setReplyTo(comment.id)}
                formatTime={formatTime}
              />
              {/* Replies */}
              {getReplies(comment.id).map((reply) => (
                <div key={reply.id} className="ml-10 mt-2">
                  <CommentItem
                    comment={reply}
                    onReply={() => setReplyTo(comment.id)}
                    formatTime={formatTime}
                  />
                </div>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Reply indicator */}
      {replyTo && (
        <div className="flex items-center gap-2 text-xs text-white/40 mb-2">
          <span>Replying to comment</span>
          <button
            onClick={() => setReplyTo(null)}
            className="text-red-400 hover:text-red-300"
          >
            Cancel
          </button>
        </div>
      )}

      {/* Comment Input */}
      {isAuthenticated ? (
        <form onSubmit={handleSubmit} className="flex gap-3">
          <div className="w-8 h-8 rounded-full bg-gradient-to-r from-lime-400 to-green-400 flex items-center justify-center text-xs font-bold text-neutral-950 flex-shrink-0">
            {user?.display_name?.[0]?.toUpperCase() ?? "U"}
          </div>
          <div className="flex-1 flex gap-2">
            <input
              type="text"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Write a comment..."
              className="flex-1 bg-neutral-800 border border-white/10 rounded-full px-4 py-2 text-sm text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition"
            />
            <button
              type="submit"
              disabled={submitting || !content.trim()}
              className="px-4 py-2 bg-lime-400 text-neutral-950 rounded-full text-sm font-medium hover:bg-lime-300 transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? "..." : "Post"}
            </button>
          </div>
        </form>
      ) : (
        <p className="text-sm text-white/30">Connect your wallet to comment</p>
      )}
    </div>
  );
}

function CommentItem({
  comment,
  onReply,
  formatTime,
}: {
  comment: Comment;
  onReply: () => void;
  formatTime: (date: Date) => string;
}) {
  return (
    <div className="flex gap-3">
      <Link href={`/profile/${comment.user?.id || comment.userId}`}>
        <div className="w-8 h-8 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold flex-shrink-0">
          {comment.user?.username?.[0]?.toUpperCase() ?? "?"}
        </div>
      </Link>
      <div className="flex-1 min-w-0">
        <div className="bg-neutral-800 rounded-xl px-3 py-2">
          <div className="flex items-center gap-2 mb-0.5">
            <Link
              href={`/profile/${comment.user?.id || comment.userId}`}
              className="text-sm font-medium hover:text-lime-400 transition"
            >
              {comment.user?.displayName ?? "Unknown"}
            </Link>
            <span className="text-xs text-white/30">
              {formatTime(comment.createdAt)}
            </span>
          </div>
          <p className="text-sm text-white/80">{comment.content}</p>
        </div>
        <button
          onClick={onReply}
          className="text-xs text-white/30 hover:text-lime-400 transition mt-1 ml-3"
        >
          Reply
        </button>
      </div>
    </div>
  );
}
