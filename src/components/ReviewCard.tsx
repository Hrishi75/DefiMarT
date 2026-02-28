"use client";

import { Review } from "@/types/marketplace";
import StarRating from "./StarRating";
import Link from "next/link";

interface ReviewCardProps {
  review: Review;
}

export default function ReviewCard({ review }: ReviewCardProps) {
  function formatTime(date: Date) {
    const d = date instanceof Date ? date : new Date(date);
    const diff = Date.now() - d.getTime();
    const days = Math.floor(diff / 86400000);
    if (days < 1) return "Today";
    if (days < 7) return `${days}d ago`;
    if (days < 30) return `${Math.floor(days / 7)}w ago`;
    return d.toLocaleDateString();
  }

  return (
    <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
      <div className="flex items-start gap-3 mb-3">
        <Link href={`/profile/${review.reviewer?.id || review.reviewerId}`}>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {review.reviewer?.username?.[0]?.toUpperCase() ?? "?"}
          </div>
        </Link>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <Link
              href={`/profile/${review.reviewer?.id || review.reviewerId}`}
              className="font-medium hover:text-lime-400 transition text-sm"
            >
              {review.reviewer?.displayName ?? "Unknown"}
            </Link>
            <span className="text-xs text-white/30">{formatTime(review.createdAt)}</span>
          </div>
          <StarRating rating={review.rating} size="sm" />
        </div>
      </div>
      {review.content && (
        <p className="text-sm text-white/70 leading-relaxed">{review.content}</p>
      )}
    </div>
  );
}
