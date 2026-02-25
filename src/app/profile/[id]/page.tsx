"use client";

import { useState, useEffect } from "react";
import { use } from "react";
import { useSupabase } from "@/hooks/useSupabase";
import { useAuth } from "@/contexts/AuthContext";
import { getUserById as getUserByIdDb } from "@/lib/supabase/queries/users";
import { getListingsBySeller } from "@/lib/supabase/queries/listings";
import { getUserById as getUserByIdMock, getListingsBySeller as getListingsBySellerMock } from "@/lib/mockData";
import { User, Listing } from "@/types/marketplace";
import Image from "next/image";
import ListingCard from "@/components/marketplace/ListingCard";
import Tag from "@/components/Tag";
import Button from "@/components/Button";
import { twMerge } from "tailwind-merge";

export default function ProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const supabase = useSupabase();
  const { user: currentUser } = useAuth();
  const [profileUser, setProfileUser] = useState<User | null>(null);
  const [userListings, setUserListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'items' | 'activity' | 'about'>('items');

  const isOwnProfile = currentUser && profileUser && currentUser.id === profileUser.id;

  useEffect(() => {
    fetchProfile();
  }, [resolvedParams.id]);

  async function fetchProfile() {
    setLoading(true);
    try {
      const [userData, listingsData] = await Promise.all([
        getUserByIdDb(supabase, resolvedParams.id),
        getListingsBySeller(supabase, resolvedParams.id),
      ]);
      setProfileUser(userData);
      setUserListings(listingsData);
    } catch {
      const mockUser = getUserByIdMock(resolvedParams.id);
      const mockListings = getListingsBySellerMock(resolvedParams.id);
      setProfileUser(mockUser ?? null);
      setUserListings(mockListings);
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-lime-400 border-t-transparent rounded-full" />
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-neutral-950 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">👤</div>
          <h2 className="text-2xl font-medium mb-2">User not found</h2>
          <p className="text-white/50">This profile doesn&apos;t exist</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 text-white pt-24 pb-16">
      {/* Cover Image */}
      <div className="h-64 bg-gradient-to-r from-purple-900/30 via-pink-900/30 to-purple-900/30 relative">
        {profileUser.coverImage && (
          <Image src={profileUser.coverImage} alt="Cover" fill className="object-cover" />
        )}
      </div>

      <div className="container">
        {/* Profile Header */}
        <div className="relative -mt-20 mb-8">
          <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
            {/* Avatar */}
            <div className="relative">
              <div className="w-40 h-40 rounded-3xl overflow-hidden border-4 border-neutral-950 bg-gradient-to-r from-purple-500 to-pink-500 flex items-center justify-center text-6xl font-bold">
                {profileUser.avatar ? (
                  <Image src={profileUser.avatar} alt={profileUser.displayName} fill className="object-cover" />
                ) : (
                  profileUser.username[0].toUpperCase()
                )}
              </div>
              {profileUser.verified && (
                <div className="absolute -bottom-2 -right-2 bg-lime-400 text-neutral-950 p-2 rounded-full">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}
            </div>

            {/* User Info */}
            <div className="flex-1">
              <h1 className="text-4xl font-bold mb-2">{profileUser.displayName}</h1>
              <div className="flex items-center gap-2 text-white/50 mb-4">
                <span>@{profileUser.username}</span>
                <span>·</span>
                <span className="font-mono text-sm">{profileUser.walletAddress.slice(0, 4)}...{profileUser.walletAddress.slice(-4)}</span>
              </div>
              {profileUser.bio && (
                <p className="text-white/70 max-w-2xl mb-4">{profileUser.bio}</p>
              )}

              {/* Stats */}
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-lime-400">{profileUser.stats.itemsOwned}</div>
                  <div className="text-sm text-white/50">Items Owned</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-lime-400">{profileUser.stats.itemsSold}</div>
                  <div className="text-sm text-white/50">Items Sold</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-lime-400">{profileUser.stats.totalSales} SOL</div>
                  <div className="text-sm text-white/50">Total Sales</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-lime-400">{profileUser.stats.reputation}%</div>
                  <div className="text-sm text-white/50">Reputation</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              {isOwnProfile ? (
                <Button variant="secondary" className="!h-12">
                  Edit Profile
                </Button>
              ) : (
                <>
                  <Button variant="secondary" className="!h-12">
                    <span className="flex items-center gap-2">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                      Message
                    </span>
                  </Button>
                  <Button variant="primary" className="!h-12">
                    Follow
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Events Attended */}
        {profileUser.eventsAttended.length > 0 && (
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              <svg className="w-5 h-5 text-lime-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span className="text-sm text-white/70">Attended {profileUser.eventsAttended.length} events</span>
            </div>
            <div className="flex gap-2">
              {profileUser.eventsAttended.map(eventId => (
                <Tag key={eventId}>{eventId.replace(/-/g, ' ')}</Tag>
              ))}
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-white/10 mb-8">
          <div className="flex gap-8">
            {(['items', 'activity', 'about'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={twMerge(
                  "pb-4 font-medium transition relative capitalize",
                  activeTab === tab ? "text-lime-400" : "text-white/50 hover:text-white"
                )}
              >
                {tab === 'items' ? `Items (${userListings.length})` : tab}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-lime-400" />
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'items' && (
          <div>
            {userListings.length === 0 ? (
              <div className="text-center py-20">
                <div className="text-white/20 text-6xl mb-4">📦</div>
                <h3 className="text-2xl font-medium mb-2">No listings yet</h3>
                <p className="text-white/50">
                  {isOwnProfile ? "You haven't listed any items yet" : "This user hasn't listed any items"}
                </p>
                {isOwnProfile && (
                  <Button variant="primary" className="mt-4">
                    Create Listing
                  </Button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {userListings.map(listing => (
                  <ListingCard key={listing.id} listing={listing} />
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="max-w-2xl">
            <div className="space-y-4">
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-lime-400/20 flex items-center justify-center text-lime-400">
                    📦
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70">Listed a new item</p>
                    <p className="text-sm text-white/50">2 days ago</p>
                  </div>
                </div>
              </div>
              <div className="bg-neutral-900 border border-white/10 rounded-2xl p-6">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-purple-400/20 flex items-center justify-center text-purple-400">
                    ✨
                  </div>
                  <div className="flex-1">
                    <p className="text-white/70">Sold an item</p>
                    <p className="text-sm text-white/50">5 days ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'about' && (
          <div className="max-w-2xl">
            <div className="bg-neutral-900 border border-white/10 rounded-3xl p-8">
              <h3 className="text-xl font-medium mb-6">About</h3>
              <div className="space-y-4">
                <div>
                  <div className="text-sm text-white/50 mb-1">Member Since</div>
                  <div className="text-white">{profileUser.createdAt.toLocaleDateString()}</div>
                </div>
                <div>
                  <div className="text-sm text-white/50 mb-1">Wallet Address</div>
                  <div className="font-mono text-sm text-white break-all">{profileUser.walletAddress}</div>
                </div>
                {profileUser.socialLinks && (
                  <div>
                    <div className="text-sm text-white/50 mb-2">Social Links</div>
                    <div className="flex gap-3">
                      {profileUser.socialLinks.twitter && (
                        <a href={profileUser.socialLinks.twitter} className="text-lime-400 hover:text-lime-300" target="_blank" rel="noopener noreferrer">
                          Twitter
                        </a>
                      )}
                      {profileUser.socialLinks.discord && (
                        <a href={profileUser.socialLinks.discord} className="text-lime-400 hover:text-lime-300" target="_blank" rel="noopener noreferrer">
                          Discord
                        </a>
                      )}
                      {profileUser.socialLinks.website && (
                        <a href={profileUser.socialLinks.website} className="text-lime-400 hover:text-lime-300" target="_blank" rel="noopener noreferrer">
                          Website
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
