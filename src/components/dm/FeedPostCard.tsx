"use client";

import { useState } from "react";
import Link from "next/link";
import { Post } from "@/types/marketplace";
import { Icons } from "./Icons";
import Verified from "./Verified";
import { PostType, TYPE_META, derivePostType, seedReposts } from "./feedMeta";
import CommentSection from "@/components/feed/CommentSection";

interface FeedPostCardProps {
  post: Post;
  liked: boolean;
  onLike: (postId: string) => void;
  currentUserId?: string;
  delay?: number;
}

function timeAgo(date: Date): string {
  const s = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (s < 60) return "now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}d`;
  return new Date(date).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

function Avatar({ user, size = 40 }: { user: Post["user"]; size?: number }) {
  if (user?.avatar) {
    return (
      <img
        src={user.avatar}
        alt={user.displayName ?? "avatar"}
        style={{ width: size, height: size, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
      />
    );
  }
  const name = user?.displayName || user?.username || "?";
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  return (
    <span
      className="dm-display"
      style={{
        display: "inline-flex", alignItems: "center", justifyContent: "center",
        width: size, height: size, borderRadius: "50%", flexShrink: 0,
        background: "var(--grad)", color: "#0a0710", fontWeight: 700, fontSize: size * 0.36,
      }}
    >
      {initials}
    </span>
  );
}

function TypeBadge({ type }: { type: PostType }) {
  const m = TYPE_META[type];
  const base: React.CSSProperties = {
    fontSize: 9.5, fontWeight: 700, letterSpacing: "0.14em", padding: "3px 9px", borderRadius: 999,
  };
  if (m.grad) {
    return <span className="dm-mono" style={{ ...base, background: "var(--grad)", color: "#0a0710" }}>{m.label}</span>;
  }
  return (
    <span
      className="dm-mono"
      style={{
        ...base, color: m.tint, border: `1px solid ${m.tint}`, opacity: 0.95,
        background: `color-mix(in oklab, ${m.tint} 12%, transparent)`,
      }}
    >
      {m.label}
    </span>
  );
}

export default function FeedPostCard({ post, liked, onLike, currentUserId, delay = 0 }: FeedPostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [reposted, setReposted] = useState(false);
  const [following, setFollowing] = useState(false);

  const type = derivePostType(post);
  const m = TYPE_META[type];
  const isOwn = !!currentUserId && post.user?.id === currentUserId;

  const likeN = post.likes + (liked ? 1 : 0);
  const repostN = seedReposts(post) + (reposted ? 1 : 0);
  const media = post.images?.[0];

  return (
    <div
      className="dm-grad-border dm-rise"
      style={{ borderRadius: "var(--r-lg)", breakInside: "avoid", marginBottom: 20, animationDelay: `${delay}s` }}
    >
      <div style={{ borderRadius: "var(--r-lg)", overflow: "hidden", background: "var(--bg-1)", border: "1px solid var(--line)" }}>
        {/* header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "15px 16px 12px", gap: 10 }}>
          <Link href={`/profile/${post.user?.id}`} style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
            <Avatar user={post.user} />
            <div style={{ minWidth: 0 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                <span style={{ fontWeight: 700, fontSize: 14.5, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {post.user?.displayName ?? "Unknown"}
                </span>
                {post.user?.verified && <Verified size={13} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--faint)", marginTop: 1 }}>
                <span className="dm-mono" style={{ color: "var(--muted)" }}>@{post.user?.username ?? "unknown"}</span>
                <span>·</span><span>{timeAgo(post.createdAt)}</span>
              </div>
            </div>
          </Link>
          {!isOwn && (
            <button
              onClick={() => setFollowing((f) => !f)}
              style={{
                height: 30, padding: "0 13px", borderRadius: 999, flexShrink: 0, fontSize: 12.5, fontWeight: 700,
                cursor: "pointer", transition: "all .2s ease",
                ...(following
                  ? { background: "rgba(255,255,255,0.05)", border: "1px solid var(--line-2)", color: "var(--muted)" }
                  : { background: "var(--grad)", color: "#0a0710", border: "none" }),
              }}
            >
              {following ? "Following" : "Follow"}
            </button>
          )}
        </div>

        {/* action line + caption */}
        <div style={{ padding: "0 16px 13px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 9, flexWrap: "wrap" }}>
            <TypeBadge type={type} />
            <span style={{ fontSize: 12, color: "var(--faint)" }}>{m.verb}</span>
            {post.event && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12 }}>
                <span style={{ color: "var(--ghost)" }}>·</span>
                <span style={{ width: 7, height: 7, borderRadius: "50%", background: "var(--cyan)" }} />
                <span className="dm-mono" style={{ color: "var(--cyan)", fontSize: 11 }}>{post.event.name}</span>
              </span>
            )}
          </div>
          <p style={{ fontSize: 14.5, lineHeight: 1.5, color: "var(--text)", whiteSpace: "pre-wrap" }}>{post.content}</p>
        </div>

        {/* media */}
        {media && (
          <div style={{ position: "relative", margin: "0 16px", borderRadius: "var(--r)", overflow: "hidden", aspectRatio: "1 / 1", background: "var(--bg-2)" }}>
            <img src={media} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            {type === "mint" && (
              <span
                className="dm-mono"
                style={{ position: "absolute", top: 10, left: 10, fontSize: 9, fontWeight: 700, letterSpacing: "0.12em", padding: "4px 9px", borderRadius: 999, background: "var(--grad)", color: "#0a0710" }}
              >
                cNFT
              </span>
            )}
          </div>
        )}

        {/* attached listing chip */}
        {post.linkedItem && (
          <Link
            href={`/marketplace/${post.linkedItem.id}`}
            style={{
              display: "flex", justifyContent: "space-between", alignItems: "center",
              margin: "13px 16px 0", padding: "10px 12px",
              background: "var(--bg-2)", border: "1px solid var(--line)", borderRadius: 14, gap: 10,
            }}
          >
            <span style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
              <span style={{ width: 38, height: 38, borderRadius: 10, overflow: "hidden", flexShrink: 0, background: "var(--bg-3)" }}>
                {post.linkedItem.images?.[0] && (
                  <img src={post.linkedItem.images[0]} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                )}
              </span>
              <span style={{ minWidth: 0 }}>
                <span className="dm-eyebrow" style={{ fontSize: 9.5, letterSpacing: "0.18em", display: "block" }}>
                  {type === "score" ? "Traded" : "Listing"}
                </span>
                <span style={{ display: "block", fontWeight: 600, fontSize: 13, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis", maxWidth: 180 }}>
                  {post.linkedItem.title}
                </span>
              </span>
            </span>
            <span style={{ display: "flex", alignItems: "center", gap: 6, flexShrink: 0 }}>
              <span className="dm-mono" style={{ fontSize: 14, fontWeight: 700 }}>
                {post.linkedItem.price}
                <span style={{ color: "var(--cyan)", fontSize: 11, marginLeft: 3 }}>{post.linkedItem.currency}</span>
              </span>
              <Icons.arrowR size={15} />
            </span>
          </Link>
        )}

        {/* footer actions */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "13px 16px 14px" }}>
          <div style={{ display: "flex", gap: 18 }}>
            <button
              onClick={() => onLike(post.id)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: liked ? "var(--magenta)" : "var(--muted)", transition: "color .2s" }}
            >
              <Icons.heart size={17} fill={liked ? "currentColor" : "none"} /> {likeN}
            </button>
            <button
              onClick={() => setShowComments((s) => !s)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: showComments ? "var(--cyan)" : "var(--muted)", transition: "color .2s" }}
            >
              <Icons.msg size={17} /> {commentCount}
            </button>
            <button
              onClick={() => setReposted((r) => !r)}
              style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, cursor: "pointer", color: reposted ? "var(--cyan)" : "var(--muted)", transition: "color .2s" }}
            >
              <Icons.refresh size={16} /> {repostN}
            </button>
          </div>
          <button style={{ display: "flex", alignItems: "center", color: "var(--muted)", cursor: "pointer" }}>
            <Icons.share size={16} />
          </button>
        </div>

        {/* comments (real backend) */}
        {showComments && (
          <div style={{ padding: "0 16px 14px" }}>
            <CommentSection
              postId={post.id}
              commentCount={commentCount}
              onCommentCountChange={(delta) => setCommentCount((prev) => prev + delta)}
            />
          </div>
        )}
      </div>
    </div>
  );
}
