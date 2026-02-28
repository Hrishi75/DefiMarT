"use client";

import { useState, useEffect, useRef, useCallback, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Tag from "@/components/Tag";
import ListingCard from "@/components/marketplace/ListingCard";
import UserCard from "@/components/UserCard";
import type { Listing, User } from "@/types/marketplace";

type SearchTab = "all" | "listings" | "users";

export default function SearchPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
      </div>
    }>
      <SearchPageInner />
    </Suspense>
  );
}

function SearchPageInner() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const initialQuery = searchParams.get("q") ?? "";
  const [query, setQuery] = useState(initialQuery);
  const [activeTab, setActiveTab] = useState<SearchTab>("all");
  const [listings, setListings] = useState<Listing[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchResults = useCallback(async (term: string, tab: SearchTab) => {
    if (!term.trim()) {
      setListings([]);
      setUsers([]);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(
        `/api/search?q=${encodeURIComponent(term)}&type=${tab}`
      );
      if (res.ok) {
        const data = await res.json();
        setListings(data.listings ?? []);
        setUsers(data.users ?? []);
      }
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  }, []);

  // Debounced search on query change
  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(() => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("q", query.trim());
      router.replace(`/search${params.toString() ? `?${params.toString()}` : ""}`);
      fetchResults(query, activeTab);
    }, 300);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, activeTab, fetchResults, router]);

  // Fetch on initial load if query exists
  useEffect(() => {
    if (initialQuery) {
      fetchResults(initialQuery, activeTab);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const tabs: { key: SearchTab; label: string }[] = [
    { key: "all", label: "All" },
    { key: "listings", label: "Listings" },
    { key: "users", label: "Users" },
  ];

  const showListings = activeTab === "all" || activeTab === "listings";
  const showUsers = activeTab === "all" || activeTab === "users";
  const hasResults = listings.length > 0 || users.length > 0;
  const hasQuery = query.trim().length > 0;

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      <div className="container max-w-6xl">
        {/* Header */}
        <div className="mb-8 text-center">
          <div className="flex justify-center mb-6">
            <Tag>Search</Tag>
          </div>
          <h1 className="text-5xl md:text-6xl font-medium mb-4">
            Find <span className="text-lime-400">Anything</span>
          </h1>
          <p className="text-white/50 text-lg">
            Search listings, users, and more across the marketplace
          </p>
        </div>

        {/* Search Input */}
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <svg
              className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-white/40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search listings, users..."
              className="w-full bg-neutral-900 border border-white/10 rounded-full px-6 py-4 text-lg pl-14 outline-none focus:border-lime-400/50 transition placeholder:text-white/30"
            />
            {query && (
              <button
                onClick={() => setQuery("")}
                className="absolute right-5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white transition"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-md mx-auto mb-10">
          <div className="flex gap-4 bg-neutral-900 border border-white/10 rounded-full p-1">
            {tabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex-1 py-2 px-4 rounded-full font-medium transition ${
                  activeTab === tab.key
                    ? "bg-lime-400 text-neutral-950"
                    : "text-white/50 hover:text-white"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="bg-neutral-900 border border-white/10 rounded-3xl h-64 animate-pulse"
                />
              ))}
            </div>
          </div>
        )}

        {/* Results */}
        {!loading && hasQuery && hasResults && (
          <div className="space-y-10">
            {/* Listings */}
            {showListings && listings.length > 0 && (
              <div>
                <h2 className="text-2xl font-medium mb-6">
                  Listings{" "}
                  <span className="text-white/40 text-lg">({listings.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {listings.map((listing) => (
                    <ListingCard key={listing.id} listing={listing} />
                  ))}
                </div>
              </div>
            )}

            {/* Users */}
            {showUsers && users.length > 0 && (
              <div>
                <h2 className="text-2xl font-medium mb-6">
                  Users{" "}
                  <span className="text-white/40 text-lg">({users.length})</span>
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {users.map((user) => (
                    <UserCard key={user.id} user={user} />
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Empty State */}
        {!loading && hasQuery && !hasResults && (
          <div className="text-center py-20">
            <div className="text-white/20 text-6xl mb-4">
              <svg className="w-16 h-16 mx-auto text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium mb-2">No results found</h3>
            <p className="text-white/50">
              Try searching with different keywords
            </p>
          </div>
        )}

        {/* Initial State */}
        {!loading && !hasQuery && (
          <div className="text-center py-20">
            <div className="mb-4">
              <svg className="w-16 h-16 mx-auto text-white/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
            <h3 className="text-2xl font-medium mb-2">Start searching</h3>
            <p className="text-white/50">
              Type above to find listings, users, and more
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
