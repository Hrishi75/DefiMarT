"use client";

import { useState } from "react";
import { Post } from "@/types/marketplace";
import Image from "next/image";
import Link from "next/link";
import Tag from "@/components/Tag";
import CommentSection from "./CommentSection";

interface PostCardProps {
  post: Post;
  onLike?: (postId: string) => void;
}

export default function PostCard({ post, onLike }: PostCardProps) {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [liked, setLiked] = useState(false);
  const [showCopied, setShowCopied] = useState(false);

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-3xl p-6 hover:border-white/20 transition">
      {/* User Header */}
      <Link href={`/profile/${post.user.id}`}>
        <div className="flex items-center gap-3 mb-4 group cursor-pointer">
          <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-lg font-bold">
            {post.user?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <span className="font-medium group-hover:text-lime-400 transition">
                {post.user?.displayName ?? "Unknown"}
              </span>
              {post.user?.verified && (
                <svg
                  className="w-4 h-4 text-lime-400"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
            </div>
            <div className="text-sm text-white/50">
              @{post.user?.username ?? "unknown"} ·{" "}
              {new Date(post.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      </Link>

      {/* Content */}
      <p className="text-white/90 mb-4 leading-relaxed">{post.content}</p>

      {/* Images */}
      {post.images && post.images.length > 0 && (
        <div className="mb-4 rounded-2xl overflow-hidden">
          <div className="relative aspect-video">
            <Image
              src={post.images[0]}
              alt="Post image"
              fill
              className="object-cover"
            />
          </div>
        </div>
      )}

      {/* Linked Item */}
      {post.linkedItem && (
        <Link href={`/marketplace/${post.linkedItem.id}`}>
          <div className="bg-neutral-800 border border-white/10 rounded-2xl p-4 mb-4 hover:border-lime-400 transition cursor-pointer">
            <div className="flex gap-4">
              <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0">
                <Image
                  src={post.linkedItem.images[0]}
                  alt={post.linkedItem.title}
                  fill
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-lime-400 mb-1">
                  {post.linkedItem.event?.name}
                </div>
                <h4 className="font-medium text-sm mb-1 truncate">
                  {post.linkedItem.title}
                </h4>
                <div className="text-lime-400 font-bold">
                  {post.linkedItem.price} {post.linkedItem.currency}
                </div>
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
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="text-xs text-white/50 hover:text-lime-400 cursor-pointer"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-6 pt-4 border-t border-white/10">
        <button
          onClick={() => {
            setLiked((prev) => !prev);
            onLike?.(post.id);
          }}
          className={`flex items-center gap-2 transition ${
            liked ? "text-red-500" : "text-white/50 hover:text-red-400"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill={liked ? "currentColor" : "none"}
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
            />
          </svg>
          <span className="text-sm">{post.likes}</span>
        </button>
        <button
          onClick={() => setShowComments((prev) => !prev)}
          className={`flex items-center gap-2 transition ${
            showComments
              ? "text-lime-400"
              : "text-white/50 hover:text-lime-400"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="text-sm">{commentCount}</span>
        </button>
        <button
          onClick={() => {
            const url = `${window.location.origin}/feed?post=${post.id}`;
            navigator.clipboard.writeText(url);
            setShowCopied(true);
            setTimeout(() => setShowCopied(false), 2000);
          }}
          className={`flex items-center gap-2 transition ${
            showCopied ? "text-lime-400" : "text-white/50 hover:text-lime-400"
          }`}
        >
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
            />
          </svg>
          <span className="text-sm">{showCopied ? "Link copied!" : post.shares}</span>
        </button>
      </div>

      {/* Comment Section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          commentCount={commentCount}
          onCommentCountChange={(delta) =>
            setCommentCount((prev) => prev + delta)
          }
        />
      )}
    </div>
  );
}
