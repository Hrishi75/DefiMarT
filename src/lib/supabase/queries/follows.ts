import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';

export async function isFollowing(
  supabase: SupabaseClient<Database>,
  followerId: string,
  followingId: string
): Promise<boolean> {
  const { data } = await supabase
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  return !!data;
}

export async function toggleFollow(
  supabase: SupabaseClient<Database>,
  followerId: string,
  followingId: string
): Promise<boolean> {
  // Check if already following
  const { data: existing } = await (supabase as any)
    .from('follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .single();

  if (existing) {
    await (supabase as any)
      .from('follows')
      .delete()
      .eq('id', existing.id);
    return false; // unfollowed
  } else {
    await (supabase as any)
      .from('follows')
      .insert({ follower_id: followerId, following_id: followingId });
    return true; // followed
  }
}

export async function getFollowCounts(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<{ followers: number; following: number }> {
  const [followersResult, followingResult] = await Promise.all([
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('following_id', userId),
    supabase
      .from('follows')
      .select('id', { count: 'exact', head: true })
      .eq('follower_id', userId),
  ]);

  return {
    followers: followersResult.count ?? 0,
    following: followingResult.count ?? 0,
  };
}

export async function getFollowingIds(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<string[]> {
  const { data, error } = await (supabase as any)
    .from('follows')
    .select('following_id')
    .eq('follower_id', userId);

  if (error) throw error;
  return (data ?? []).map((row: any) => row.following_id);
}
