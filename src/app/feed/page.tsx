"use client";

import { useState, useEffect, useRef } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { getPosts, transformPost } from "@/lib/supabase/queries/posts";
import { getRecentPosts } from "@/lib/mockData";
import { Post } from "@/types/marketplace";
import { Icons } from "@/components/dm/Icons";
import EclipseMark from "@/components/dm/EclipseMark";
import FeedPostCard from "@/components/dm/FeedPostCard";
import { derivePostType, typeMatchesTab } from "@/components/dm/feedMeta";

const TABS = [
  { k: "foryou", label: "For you" },
  { k: "following", label: "Following" },
  { k: "drops", label: "Drops" },
  { k: "trades", label: "Trades" },
  { k: "showcases", label: "Showcases" },
] as const;

type TabKey = (typeof TABS)[number]["k"];

// design-only tabs (drops/trades/showcases) filter client-side over the 'all' feed
const backendFilter = (tab: TabKey): "all" | "following" =>
  tab === "following" ? "following" : "all";

export default function FeedPage() {
  const supabase = useSupabase();
  const { user, isAuthenticated } = useAuth();

  const [tab, setTab] = useState<TabKey>("foryou");
  const [posts, setPosts] = useState<Post[]>([]);
  const [liked, setLiked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);

  const [postContent, setPostContent] = useState("");
  const [posting, setPosting] = useState(false);
  const [focus, setFocus] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 12;

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tab]);

  async function fetchPosts(pageNum = 0, reset = false) {
    if (reset) setLoading(true);
    else setLoadingMore(true);
    try {
      const result = await getPosts(supabase, backendFilter(tab), pageNum, PAGE_SIZE, user?.id);
      const newPosts = result.posts;
      setPosts((prev) => (reset ? newPosts : [...prev, ...newPosts]));
      setHasMore(newPosts.length === PAGE_SIZE);
    } catch {
      if (reset) {
        setPosts(getRecentPosts(20));
        setHasMore(false);
      }
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }

  // infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const next = page + 1;
          setPage(next);
          fetchPosts(next);
        }
      },
      { threshold: 0.1 }
    );
    observer.observe(observerRef.current);
    return () => observer.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hasMore, loadingMore, loading, page]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 4) return;
    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    imagePreviews.forEach((url) => URL.revokeObjectURL(url));
    setImagePreviews(newFiles.map((f) => URL.createObjectURL(f)));
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleCreatePost() {
    if (!postContent.trim() || !user) return;
    setPosting(true);
    try {
      const imageUrls: string[] = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("bucket", "post-images");
        const res = await fetch("/api/upload", { method: "POST", body: formData });
        if (res.ok) {
          const { url } = await res.json();
          imageUrls.push(url);
        }
      }
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          content: postContent.trim(),
          images: imageUrls,
          tags: postContent.match(/#(\w+)/g)?.map((t) => t.slice(1)) ?? [],
        }),
      });
      if (res.ok) {
        const { post } = await res.json();
        setPosts((prev) => [transformPost(post), ...prev]);
        setPostContent("");
        setFocus(false);
        setImageFiles([]);
        imagePreviews.forEach((url) => URL.revokeObjectURL(url));
        setImagePreviews([]);
      } else {
        console.error("Failed to create post:", await res.json());
      }
    } catch (err) {
      console.error("Failed to create post:", err);
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId: string) {
    if (!user) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: "POST" });
      if (res.ok) {
        setLiked((prev) => {
          const n = new Set(prev);
          n.has(postId) ? n.delete(postId) : n.add(postId);
          return n;
        });
      }
    } catch (err) {
      console.error("Failed to toggle like:", err);
    }
  }

  const visible = posts.filter((p) => typeMatchesTab(derivePostType(p), tab));
  const canPost = !!postContent.trim();

  return (
    <div className="dm-container" style={{ paddingTop: 28, paddingBottom: 80, position: "relative" }}>
      {/* bg blob */}
      <div style={{ position: "absolute", width: 600, height: 600, borderRadius: "50%", filter: "blur(80px)", background: "rgba(155,92,255,0.10)", left: "-12%", top: "-8%", pointerEvents: "none" }} />

      {/* header */}
      <div style={{ position: "relative", marginBottom: 26 }}>
        <span className="dm-eyebrow">The Feed</span>
        <h1 className="dm-display dm-page-title" style={{ fontSize: 52, fontWeight: 500, marginTop: 12 }}>
          The floor, <span className="dm-grad-text">live</span>
        </h1>
        <p style={{ color: "var(--muted)", fontSize: 17, marginTop: 12, maxWidth: 540 }}>
          Drops, trades, mints, and showcases from collectors across every verified event.
        </p>
      </div>

      <div style={{ position: "relative", maxWidth: 1240 }}>
        {/* composer */}
        {isAuthenticated && user ? (
          <div className="dm-panel" style={{ padding: 16, marginBottom: 24 }}>
            <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
              <span
                className="dm-display"
                style={{ display: "inline-flex", alignItems: "center", justifyContent: "center", width: 42, height: 42, borderRadius: "50%", flexShrink: 0, background: "var(--grad)", color: "#0a0710", fontWeight: 700, fontSize: 16 }}
              >
                {user.display_name?.[0]?.toUpperCase() ?? "U"}
              </span>
              <div style={{ flex: 1 }}>
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  onFocus={() => setFocus(true)}
                  placeholder="Share a drop, trade, or showcase…"
                  rows={focus || postContent ? 3 : 1}
                  style={{ width: "100%", resize: "none", background: "transparent", border: "none", outline: "none", color: "var(--text)", fontSize: 15.5, lineHeight: 1.5, paddingTop: 9, fontFamily: "inherit" }}
                />

                {imagePreviews.length > 0 && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10, marginBottom: 4 }}>
                    {imagePreviews.map((preview, i) => (
                      <div key={i} style={{ position: "relative", width: 76, height: 76, borderRadius: 12, overflow: "hidden" }}>
                        <img src={preview} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          style={{ position: "absolute", top: 4, right: 4, width: 20, height: 20, borderRadius: "50%", background: "rgba(4,3,8,0.7)", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", border: "none" }}
                        >
                          <Icons.close size={12} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 8 }}>
                  <div style={{ display: "flex", gap: 4 }}>
                    <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleImageSelect} style={{ display: "none" }} />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      title="Add image"
                      style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 999, color: "var(--cyan)", background: "transparent", border: "none", cursor: "pointer" }}
                    >
                      <Icons.tag size={17} />
                    </button>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 999, color: "var(--cyan)" }}><Icons.eye size={17} /></span>
                    <span style={{ display: "flex", alignItems: "center", justifyContent: "center", width: 34, height: 34, borderRadius: 999, color: "var(--cyan)" }}><Icons.spark size={17} /></span>
                  </div>
                  <button
                    onClick={handleCreatePost}
                    disabled={posting || !canPost}
                    style={{ height: 38, padding: "0 18px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, border: "none", background: "var(--grad)", color: "#0a0710", cursor: canPost && !posting ? "pointer" : "default", opacity: canPost && !posting ? 1 : 0.4, transition: "opacity .2s" }}
                  >
                    {posting ? "Posting…" : "Post"}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="dm-panel" style={{ padding: 18, marginBottom: 24, textAlign: "center" }}>
            <p style={{ color: "var(--muted)" }}>Connect your wallet to post and interact with the floor.</p>
          </div>
        )}

        {/* sticky tab bar */}
        <div
          className="dm-glass"
          style={{ position: "sticky", top: 86, zIndex: 20, display: "flex", padding: 5, gap: 3, borderRadius: 999, marginBottom: 22, width: "fit-content", maxWidth: "100%", overflowX: "auto" }}
        >
          {TABS.map((t) => (
            <button
              key={t.k}
              onClick={() => setTab(t.k)}
              style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                height: 38, padding: "0 18px", borderRadius: 999, fontSize: 13.5, fontWeight: 700, whiteSpace: "nowrap", cursor: "pointer", border: "none", transition: "all .2s ease",
                ...(tab === t.k ? { background: "var(--grad)", color: "#0a0710" } : { color: "var(--muted)", background: "transparent" }),
              }}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* feed */}
        {loading ? (
          <div style={{ columns: "320px", columnGap: 20 }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="dm-panel" style={{ height: 220, marginBottom: 20, breakInside: "avoid", opacity: 0.5, animation: "dm-pulseGlow 1.4s ease-in-out infinite" }} />
            ))}
          </div>
        ) : visible.length === 0 ? (
          <div className="dm-panel" style={{ padding: 70, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "center" }}><EclipseMark size={48} /></div>
            <h3 className="dm-display" style={{ fontSize: 22, marginTop: 16 }}>Nothing here yet</h3>
            <p style={{ color: "var(--muted)", marginTop: 6, maxWidth: 360, marginInline: "auto" }}>
              {tab === "following"
                ? "Follow a few collectors and their drops will land here."
                : "Check back soon — the floor never sleeps."}
            </p>
            {tab === "following" && (
              <button
                onClick={() => setTab("foryou")}
                style={{ marginTop: 18, height: 40, padding: "0 18px", borderRadius: 999, fontSize: 14, fontWeight: 600, background: "rgba(255,255,255,0.04)", border: "1px solid var(--line-2)", color: "var(--text)", cursor: "pointer" }}
              >
                Discover collectors
              </button>
            )}
          </div>
        ) : (
          <div style={{ columns: "320px", columnGap: 20 }}>
            {visible.map((p, i) => (
              <FeedPostCard
                key={p.id}
                post={p}
                liked={liked.has(p.id)}
                onLike={handleLike}
                currentUserId={user?.id}
                delay={Math.min(i, 8) * 0.04}
              />
            ))}
          </div>
        )}

        {/* load more trigger */}
        {!loading && hasMore && (
          <div ref={observerRef} style={{ padding: "32px 0", display: "flex", justifyContent: "center" }}>
            {loadingMore && (
              <div style={{ width: 24, height: 24, borderRadius: "50%", border: "2px solid var(--line-2)", borderTopColor: "var(--violet)", animation: "dm-spinSlow .9s linear infinite" }} />
            )}
          </div>
        )}

        {!loading && !hasMore && visible.length > 0 && (
          <div style={{ textAlign: "center", padding: "32px 0", color: "var(--faint)", fontSize: 13 }}>
            You&apos;ve reached the end
          </div>
        )}
      </div>
    </div>
  );
}
