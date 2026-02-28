"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { twMerge } from 'tailwind-merge';

interface FavoriteButtonProps {
  listingId: string;
  initialCount?: number;
  className?: string;
}

export default function FavoriteButton({
  listingId,
  initialCount = 0,
  className,
}: FavoriteButtonProps) {
  const { user, isAuthenticated } = useAuth();
  const [favorited, setFavorited] = useState(false);
  const [count, setCount] = useState(initialCount);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) return;

    async function checkFavorited() {
      try {
        const res = await fetch(`/api/favorites?listingId=${listingId}`);
        const data = await res.json();
        setFavorited(data.favorited);
        setCount(data.count);
      } catch (err) {
        console.error('Failed to check favorite status:', err);
      }
    }

    checkFavorited();
  }, [listingId, isAuthenticated]);

  if (!isAuthenticated) return null;

  async function handleToggle(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();

    if (loading) return;
    setLoading(true);

    // Optimistic update
    const wasFavorited = favorited;
    setFavorited(!wasFavorited);
    setCount((prev) => (wasFavorited ? prev - 1 : prev + 1));

    try {
      const res = await fetch('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ listingId }),
      });

      if (!res.ok) {
        // Revert optimistic update
        setFavorited(wasFavorited);
        setCount((prev) => (wasFavorited ? prev + 1 : prev - 1));
      } else {
        const data = await res.json();
        setFavorited(data.favorited);
      }
    } catch {
      // Revert optimistic update
      setFavorited(wasFavorited);
      setCount((prev) => (wasFavorited ? prev + 1 : prev - 1));
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={handleToggle}
      disabled={loading}
      className={twMerge(
        'flex items-center gap-1.5 text-sm transition-colors duration-200',
        favorited ? 'text-lime-400' : 'text-white/50 hover:text-white/80',
        loading && 'opacity-50 cursor-not-allowed',
        className
      )}
      aria-label={favorited ? 'Remove from favorites' : 'Add to favorites'}
    >
      <svg
        className="w-5 h-5"
        fill={favorited ? 'currentColor' : 'none'}
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
      <span>{count}</span>
    </button>
  );
}
