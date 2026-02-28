"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { getPosts, transformPost } from "@/lib/supabase/queries/posts";
import { getRecentPosts } from "@/lib/mockData";
import { Post } from "@/types/marketplace";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import PostCard from "@/components/feed/PostCard";

export default function FeedPage() {
  const supabase = useSupabase();
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [page, setPage] = useState(0);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const PAGE_SIZE = 10;

  useEffect(() => {
    setPage(0);
    setHasMore(true);
    fetchPosts(0, true);
  }, [activeFilter]);

  async function fetchPosts(pageNum: number = 0, reset: boolean = false) {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const result = await getPosts(supabase, activeFilter, pageNum, PAGE_SIZE, user?.id);
      const newPosts = result.posts;

      if (reset) {
        setPosts(newPosts);
      } else {
        setPosts(prev => [...prev, ...newPosts]);
      }
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

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasMore && !loadingMore && !loading) {
          const nextPage = page + 1;
          setPage(nextPage);
          fetchPosts(nextPage);
        }
      },
      { threshold: 0.1 }
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasMore, loadingMore, loading, page]);

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    if (files.length + imageFiles.length > 4) return;

    const newFiles = [...imageFiles, ...files];
    setImageFiles(newFiles);
    imagePreviews.forEach(url => URL.revokeObjectURL(url));
    setImagePreviews(newFiles.map(f => URL.createObjectURL(f)));
  }

  function removeImage(index: number) {
    URL.revokeObjectURL(imagePreviews[index]);
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  }

  async function handleCreatePost() {
    if (!postContent.trim() || !user) return;
    setPosting(true);
    try {
      // Upload images if any
      let imageUrls: string[] = [];
      for (const file of imageFiles) {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('bucket', 'post-images');
        const res = await fetch('/api/upload', { method: 'POST', body: formData });
        if (res.ok) {
          const { url } = await res.json();
          imageUrls.push(url);
        }
      }

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          content: postContent.trim(),
          images: imageUrls.length > 0 ? imageUrls : [],
          tags: postContent.match(/#(\w+)/g)?.map(t => t.slice(1)) ?? [],
        }),
      });
      if (res.ok) {
        const { post } = await res.json();
        const newPost = transformPost(post);
        setPosts(prev => [newPost, ...prev]);
        setPostContent('');
        setImageFiles([]);
        imagePreviews.forEach(url => URL.revokeObjectURL(url));
        setImagePreviews([]);
      } else {
        const err = await res.json();
        console.error('Failed to create post:', err);
      }
    } catch (err) {
      console.error('Failed to create post:', err);
    } finally {
      setPosting(false);
    }
  }

  async function handleLike(postId: string) {
    if (!user) return;
    try {
      const res = await fetch(`/api/posts/${postId}/like`, { method: 'POST' });
      if (res.ok) {
        const { liked } = await res.json();
        setPosts(prev =>
          prev.map(p =>
            p.id === postId
              ? { ...p, likes: liked ? p.likes + 1 : p.likes - 1 }
              : p
          )
        );
      }
    } catch (err) {
      console.error('Failed to toggle like:', err);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <div className="container max-w-4xl">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-center mb-6">
            <Tag>Social Feed</Tag>
          </div>
          <h1 className="text-5xl md:text-6xl font-medium text-center mb-4">
            Event Culture <span className="text-lime-400">Unfolds</span>
          </h1>
          <p className="text-center text-white/50 text-lg">
            Share your event journey and discover what others are collecting
          </p>
        </div>

        {/* Create Post */}
        {isAuthenticated && user && (
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 mb-8">
            <div className="flex gap-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-r from-lime-400 to-green-400 flex items-center justify-center text-lg font-bold text-neutral-950">
                {user.display_name?.[0]?.toUpperCase() ?? 'U'}
              </div>
              <div className="flex-1">
                <textarea
                  value={postContent}
                  onChange={(e) => setPostContent(e.target.value)}
                  placeholder="Share your latest event finds..."
                  className="w-full bg-transparent border-none outline-none resize-none text-white placeholder:text-white/30"
                  rows={3}
                />

                {/* Image Previews */}
                {imagePreviews.length > 0 && (
                  <div className="flex gap-2 mt-3 mb-3">
                    {imagePreviews.map((preview, i) => (
                      <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden group">
                        <img src={preview} alt="" className="w-full h-full object-cover" />
                        <button
                          type="button"
                          onClick={() => removeImage(i)}
                          className="absolute top-1 right-1 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                  <div className="flex gap-2">
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-full hover:bg-white/5 transition"
                    >
                      <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageSelect}
                      className="hidden"
                    />
                    <button className="p-2 rounded-full hover:bg-white/5 transition">
                      <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                      </svg>
                    </button>
                  </div>
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={handleCreatePost}
                    disabled={posting || !postContent.trim()}
                  >
                    {posting ? 'Posting...' : 'Post'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Not signed in prompt */}
        {!isAuthenticated && (
          <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 mb-8 text-center">
            <p className="text-white/50">Connect your wallet to create posts and interact with the community</p>
          </div>
        )}

        {/* Filter Tabs */}
        <div className="flex gap-4 mb-8 bg-neutral-900 border border-white/10 rounded-full p-1">
          {(['all', 'following', 'trending'] as const).map(filter => (
            <button
              key={filter}
              onClick={() => setActiveFilter(filter)}
              className={`flex-1 py-2 px-4 rounded-full font-medium transition capitalize ${
                activeFilter === filter ? 'bg-lime-400 text-neutral-950' : 'text-white/50 hover:text-white'
              }`}
            >
              {filter === 'all' ? 'All Posts' : filter === 'following' ? 'Following' : 'Trending'}
            </button>
          ))}
        </div>

        {/* Posts Feed */}
        {loading ? (
          <div className="space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="bg-neutral-900 border border-white/10 rounded-3xl h-48 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map(post => (
              <PostCard key={post.id} post={post} onLike={handleLike} />
            ))}
          </div>
        )}

        {/* Load more trigger */}
        {!loading && hasMore && (
          <div ref={observerRef} className="py-8 flex justify-center">
            {loadingMore && (
              <div className="animate-spin w-6 h-6 border-2 border-lime-400 border-t-transparent rounded-full" />
            )}
          </div>
        )}

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-white/20 text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-medium mb-2">No posts yet</h3>
            <p className="text-white/50">Be the first to share something!</p>
          </div>
        )}

        {!loading && !hasMore && posts.length > 0 && (
          <div className="text-center py-8 text-white/30 text-sm">
            You&apos;ve reached the end
          </div>
        )}
      </div>
    </div>
  );
}
