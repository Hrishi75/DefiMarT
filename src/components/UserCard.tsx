"use client";

import { User } from "@/types/marketplace";
import Link from "next/link";

interface UserCardProps {
  user: User;
}

export default function UserCard({ user }: UserCardProps) {
  const initial = user.displayName?.[0]?.toUpperCase() ?? user.username[0]?.toUpperCase() ?? '?';
  const reputationPercent = Math.round(user.stats.reputation * 100);

  return (
    <Link href={`/profile/${user.id}`}>
      <div className="bg-neutral-900 border border-white/10 rounded-3xl p-4 hover:border-white/20 transition group cursor-pointer">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          {user.avatar ? (
            <img
              src={user.avatar}
              alt={user.displayName}
              className="w-12 h-12 rounded-full object-cover"
            />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-r from-purple-400 to-pink-400 flex items-center justify-center text-lg font-bold text-white flex-shrink-0">
              {initial}
            </div>
          )}

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-medium text-white truncate group-hover:text-lime-400 transition">
                {user.displayName}
              </h3>
              {user.verified && (
                <svg className="w-4 h-4 text-lime-400 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              )}
            </div>
            <p className="text-sm text-white/50 truncate">@{user.username}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t border-white/10">
          <div className="text-sm text-white/50">
            <span className="text-white font-medium">{reputationPercent}%</span> reputation
          </div>
          <div className="text-sm text-white/50">
            <span className="text-white font-medium">{user.stats.itemsSold}</span> sold
          </div>
        </div>
      </div>
    </Link>
  );
}
