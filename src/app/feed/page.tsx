"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { getPosts, createPost as createPostDb, toggleLike } from "@/lib/supabase/queries/posts";
import { getRecentPosts } from "@/lib/mockData";
import { Post } from "@/types/marketplace";
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/Tag";
import Button from "@/components/Button";

function PostCard({ post, onLike }: { post: Post; onLike?: (postId: string) => void }) {
  return (
    <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition">
      {/* User Header */}
      <Link href={`/profile/${post.user.id}`}>
        <div className="flex items-center gap-3 mb-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-lg font-bold">
            {post.user?.username?.[0]?.toUpperCase() ?? '?'}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium group-hover:text-lime-400 transition">{post.user?.displayName ?? 'Unknown'}</span>
              {post.user?.verified && (
                <svg className="w-4 h-4 text-lime-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <div className="text-sm text-white/50">@{post.user?.username ?? 'unknown'} · {new Date(post.createdAt).toLocaleDateString()}</div>
          </div>
        </div>
      </Link>

      {/* Content */}
      <p className="text-white/90 mb-4 leading-relaxed">{post.content}</p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4 rounded-2xl overflow-hidden">
          <div className="relative aspect-video">
            <Image src={post.images[0]} alt="Post image" fill className="object-cover" />
          </div>
        </div>
      )}

      {/* Linked Item */}
      {post.linkedItem && (
        <Link href={`/marketplace/${post.linkedItem.id}`}>
          <div className="bg-neutral-800 border border-white/10 rounded-2xl p-4 mb-4 hover:border-lime-400 transition cursor-pointer">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image src={post.linkedItem.images[0]} alt={post.linkedItem.title} fill className="object-cover" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-lime-400 mb-1">{post.linkedItem.event?.name}</div>
                <h4 className="font-medium text-sm mb-1 truncate">{post.linkedItem.title}</h4>
                <div className="text-lime-400 font-bold">{post.linkedItem.price} SOL</div>
              </div>
            </div>
          </div>
        </Link>
      )}

      {/* Event Tag */}
      {post.event && (
        <div className="mb-4">
          <Tag>{post.event.name}</Tag>
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {post.tags.map(tag => (
            <span key={tag} className="text-xs text-white/50 hover:text-lime-400 cursor-pointer">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-white/10">
        <button
          onClick={() => onLike?.(post.id)}
          className="flex items-center gap-2 text-white/50 hover:text-lime-400 transition"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <span className="text-sm">{post.likes}</span>
        </button>
        <button className="flex items-center gap-2 text-white/50 hover:text-lime-400 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <span className="text-sm">{post.comments}</span>
        </button>
        <button className="flex items-center gap-2 text-white/50 hover:text-lime-400 transition">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
          </svg>
          <span className="text-sm">{post.shares}</span>
        </button>
      </div>
    </div>
  );
}

export default function FeedPage() {
  const supabase = useSupabase();
  const { user, isAuthenticated } = useAuth();
  const [activeFilter, setActiveFilter] = useState<'all' | 'following' | 'trending'>('all');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [postContent, setPostContent] = useState('');
  const [posting, setPosting] = useState(false);

  useEffect(() => {
    fetchPosts();
  }, [activeFilter]);

  async function fetchPosts() {
    setLoading(true);
    try {
      const result = await getPosts(supabase, activeFilter);
      setPosts(result.posts);
    } catch {
      setPosts(getRecentPosts(20));
    } finally {
      setLoading(false);
    }
  }

  async function handleCreatePost() {
    if (!postContent.trim() || !user) return;
    setPosting(true);
    try {
      const newPost = await createPostDb(supabase, {
        user_id: user.id,
        content: postContent.trim(),
        tags: postContent.match(/#(\w+)/g)?.map(t => t.slice(1)) ?? [],
      });
      if (newPost) {
        setPosts(prev => [newPost, ...prev]);
        setPostContent('');
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
      const liked = await toggleLike(supabase, user.id, postId);
      setPosts(prev =>
        prev.map(p =>
          p.id === postId
            ? { ...p, likes: liked ? p.likes + 1 : p.likes - 1 }
            : p
        )
      );
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
                <div className="flex items-center justify-between pt-4 border-t border-white/10 mt-4">
                  <div className="flex gap-2">
                    <button className="p-2 rounded-full hover:bg-white/5 transition">
                      <svg className="w-5 h-5 text-white/50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </button>
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

        {!loading && posts.length === 0 && (
          <div className="text-center py-20">
            <div className="text-white/20 text-6xl mb-4">📝</div>
            <h3 className="text-2xl font-medium mb-2">No posts yet</h3>
            <p className="text-white/50">Be the first to share something!</p>
          </div>
        )}
      </div>
    </div>
  );
}
