"use client";

import { useState } from "react";
import StarRating from "./StarRating";
import Button from "./Button";

interface ReviewFormProps {
  transactionId: string;
  listingId: string;
  reviewedId: string;
  onSubmitted: () => void;
  onCancel: () => void;
}

export default function ReviewForm({
  transactionId,
  listingId,
  reviewedId,
  onSubmitted,
  onCancel,
}: ReviewFormProps) {
  const [rating, setRating] = useState(0);
  const [content, setContent] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (rating === 0) {
      setError("Please select a rating");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          transactionId,
          listingId,
          reviewedId,
          rating,
          content: content.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to submit review");
        return;
      }

      onSubmitted();
    } catch {
      setError("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onCancel} />

      <div className="relative bg-neutral-900 border border-white/10 rounded-3xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-white/10">
          <h2 className="text-xl font-bold">Leave a Review</h2>
          <button
            onClick={onCancel}
            className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition"
          >
            &times;
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm text-white/50 mb-3">Rating</label>
            <StarRating
              rating={rating}
              interactive
              onRate={setRating}
              size="lg"
            />
          </div>

          <div>
            <label className="block text-sm text-white/50 mb-2">
              Review (optional)
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={4}
              className="w-full bg-neutral-800 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-lime-400 transition resize-none"
              placeholder="Share your experience..."
            />
          </div>

          {error && <p className="text-sm text-red-400">{error}</p>}

          <div className="flex gap-3">
            <Button
              variant="primary"
              className="flex-1 !h-12"
              disabled={submitting || rating === 0}
            >
              {submitting ? "Submitting..." : "Submit Review"}
            </Button>
            <Button
              variant="secondary"
              className="!h-12"
              onClick={onCancel}
            >
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
