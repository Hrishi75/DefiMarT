"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import ListingCard from '@/components/marketplace/ListingCard';
import type { Listing } from '@/types/marketplace';

export default function FavoritesPage() {
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isAuthenticated || authLoading) return;

    async function fetchFavorites() {
      try {
        setLoading(true);
        const res = await fetch('/api/favorites?mine=true');
        if (!res.ok) throw new Error('Failed to fetch favorites');
        const data = await res.json();
        setListings(data.listings ?? []);
        setCount(data.count ?? 0);
      } catch (err) {
        console.error('Failed to fetch favorites:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchFavorites();
  }, [isAuthenticated, authLoading]);

  // Auth loading state
  if (authLoading) {
    return (
      <div className="bg-neutral-950 text-white pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-center h-64">
            <div className="w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full animate-spin" />
          </div>
        </div>
      </div>
    );
  }

  // Not authenticated
  if (!isAuthenticated) {
    return (
      <div className="bg-neutral-950 text-white pt-24 pb-16 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg
              className="w-16 h-16 text-white/20 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-2xl font-bold mb-2">Connect Your Wallet</h2>
            <p className="text-white/50 max-w-md">
              Connect your wallet to view your favorited listings and keep track of items you love.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-neutral-950 text-white pt-24 pb-16 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-lime-400/10 text-lime-400 text-xs font-semibold px-3 py-1 rounded-full border border-lime-400/20">
              Favorites
            </span>
            {count > 0 && (
              <span className="text-white/40 text-sm">{count} items</span>
            )}
          </div>
          <h1 className="text-3xl font-bold">Your Favorite Listings</h1>
          <p className="text-white/50 mt-1">
            Items you have saved for later.
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={i}
                className="bg-neutral-900 border border-white/10 rounded-3xl overflow-hidden animate-pulse"
              >
                <div className="aspect-square bg-neutral-800" />
                <div className="p-4 space-y-3">
                  <div className="h-3 bg-neutral-800 rounded w-1/3" />
                  <div className="h-5 bg-neutral-800 rounded w-3/4" />
                  <div className="h-7 bg-neutral-800 rounded w-1/2" />
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Empty state */}
        {!loading && listings.length === 0 && (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <svg
              className="w-16 h-16 text-white/20 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
            <h2 className="text-xl font-bold mb-2">No Favorites Yet</h2>
            <p className="text-white/50 max-w-md">
              Browse the marketplace and tap the heart icon on listings you like to save them here.
            </p>
          </div>
        )}

        {/* Listings grid */}
        {!loading && listings.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
