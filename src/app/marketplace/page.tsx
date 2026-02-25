"use client";

import { useState, useEffect } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { getListings } from "@/lib/supabase/queries/listings";
import { getEvents } from "@/lib/supabase/queries/events";
import { mockListings, mockEvents } from "@/lib/mockData";
import { Listing, Event, MarketplaceFilters, SortOption } from "@/types/marketplace";
import Tag from "@/components/Tag";
import ListingCard from "@/components/marketplace/ListingCard";
import FilterSidebar from "@/components/marketplace/FilterSidebar";
import { twMerge } from "tailwind-merge";

export default function MarketplacePage() {
  const supabase = useSupabase();
  const [filters, setFilters] = useState<MarketplaceFilters>({});
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showFilters, setShowFilters] = useState(false);
  const [listings, setListings] = useState<Listing[]>([]);
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    fetchData();
  }, [filters, sortBy]);

  async function fetchData() {
    setLoading(true);
    try {
      const [listingsResult, eventsResult] = await Promise.all([
        getListings(supabase, filters, sortBy),
        getEvents(supabase),
      ]);
      setListings(listingsResult.listings);
      setTotalCount(listingsResult.count);
      setEvents(eventsResult);
    } catch (err) {
      // Fallback to mock data if Supabase is not configured
      console.warn('Using mock data:', err);
      let filtered = [...mockListings];

      if (filters.category && filters.category.length > 0) {
        filtered = filtered.filter(l => filters.category!.includes(l.category));
      }
      if (filters.condition && filters.condition.length > 0) {
        filtered = filtered.filter(l => filters.condition!.includes(l.condition));
      }
      if (filters.priceMin !== undefined) {
        filtered = filtered.filter(l => l.price >= filters.priceMin!);
      }
      if (filters.priceMax !== undefined) {
        filtered = filtered.filter(l => l.price <= filters.priceMax!);
      }
      if (filters.eventId) {
        filtered = filtered.filter(l => l.event.id === filters.eventId);
      }
      if (filters.isNFT !== undefined) {
        filtered = filtered.filter(l => l.isNFT === filters.isNFT);
      }
      if (filters.verified) {
        filtered = filtered.filter(l => l.event.verified);
      }

      filtered.sort((a, b) => {
        switch (sortBy) {
          case 'price-asc': return a.price - b.price;
          case 'price-desc': return b.price - a.price;
          case 'newest': return b.createdAt.getTime() - a.createdAt.getTime();
          case 'oldest': return a.createdAt.getTime() - b.createdAt.getTime();
          case 'popular': return b.views - a.views;
          default: return 0;
        }
      });

      setListings(filtered);
      setTotalCount(filtered.length);
      setEvents(mockEvents);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24">
      <div className="container">
        {/* Header */}
        <div className="mb-12">
          <div className="flex justify-center mb-6">
            <Tag>Marketplace</Tag>
          </div>
          <h1 className="text-5xl md:text-6xl font-medium text-center mb-4">
            Discover Event <span className="text-lime-400">Collectibles</span>
          </h1>
          <p className="text-center text-white/50 text-lg max-w-2xl mx-auto">
            Browse exclusive merchandise from Solana events worldwide
          </p>
        </div>

        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2 bg-neutral-900 border border-white/10 rounded-full hover:border-lime-400 transition"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              <span>Filters</span>
            </button>
            <span className="text-white/50">
              {loading ? '...' : `${totalCount} items`}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Sort Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="px-4 py-2 bg-neutral-900 border border-white/10 rounded-full text-white focus:outline-none focus:border-lime-400"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="popular">Most Popular</option>
            </select>

            {/* View Mode Toggle */}
            <div className="flex gap-2 bg-neutral-900 border border-white/10 rounded-full p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={twMerge(
                  "p-2 rounded-full transition",
                  viewMode === 'grid' ? "bg-lime-400 text-neutral-950" : "text-white/50 hover:text-white"
                )}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path d="M5 3a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2V5a2 2 0 00-2-2H5zM5 11a2 2 0 00-2 2v2a2 2 0 002 2h2a2 2 0 002-2v-2a2 2 0 00-2-2H5zM11 5a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V5zM11 13a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={twMerge(
                  "p-2 rounded-full transition",
                  viewMode === 'list' ? "bg-lime-400 text-neutral-950" : "text-white/50 hover:text-white"
                )}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex gap-8">
          {/* Filters Sidebar */}
          {showFilters && (
            <div className="w-64 flex-shrink-0">
              <FilterSidebar
                filters={filters}
                onFiltersChange={setFilters}
                events={events}
              />
            </div>
          )}

          {/* Listings Grid */}
          <div className="flex-1">
            {loading ? (
              <div className="grid gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-neutral-900 border border-white/10 rounded-3xl h-80 animate-pulse" />
                ))}
              </div>
            ) : listings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-white/20 text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-medium mb-2">No items found</h3>
                <p className="text-white/50">Try adjusting your filters</p>
              </div>
            ) : (
              <div className={twMerge(
                "grid gap-6",
                viewMode === 'grid' ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
              )}>
                {listings.map(listing => (
                  <ListingCard
                    key={listing.id}
                    listing={listing}
                    viewMode={viewMode}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
