import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { User } from '@/types/marketplace';

type DbUser = Database['public']['Tables']['users']['Row'];

// Transform database row to frontend User type
export function transformUser(row: DbUser): User {
  const socialLinks = row.social_links as Record<string, string> | null;
  return {
    id: row.id,
    walletAddress: row.wallet_address,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio ?? undefined,
    avatar: row.avatar_url ?? undefined,
    coverImage: row.cover_image_url ?? undefined,
    verified: row.verified,
    eventsAttended: row.events_attended,
    createdAt: new Date(row.created_at),
    socialLinks: socialLinks
      ? {
          twitter: socialLinks.twitter,
          discord: socialLinks.discord,
          website: socialLinks.website,
        }
      : undefined,
    stats: {
      itemsOwned: row.items_owned,
      itemsSold: row.items_sold,
      totalSales: Number(row.total_sales),
      reputation: Number(row.reputation),
    },
  };
}

export async function getUserById(
  supabase: SupabaseClient<Database>,
  id: string
) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) return null;
  return transformUser(data);
}

export async function getUserByWallet(
  supabase: SupabaseClient<Database>,
  walletAddress: string
) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('wallet_address', walletAddress)
    .single();

  if (error || !data) return null;
  return transformUser(data);
}

export async function updateUserProfile(
  supabase: SupabaseClient<Database>,
  userId: string,
  updates: {
    username?: string;
    displayName?: string;
    bio?: string;
    avatarUrl?: string;
    coverImageUrl?: string;
    socialLinks?: Record<string, string>;
  }
) {
  const { data, error } = await (supabase as any)
    .from('users')
    .update({
      username: updates.username,
      display_name: updates.displayName,
      bio: updates.bio,
      avatar_url: updates.avatarUrl,
      cover_image_url: updates.coverImageUrl,
      social_links: updates.socialLinks,
    })
    .eq('id', userId)
    .select()
    .single();

  if (error) throw error;
  return data ? transformUser(data) : null;
}
