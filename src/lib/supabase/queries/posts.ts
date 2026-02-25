import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Post } from '@/types/marketplace';
import { transformUser } from './users';
import { transformEvent } from './events';
import { transformListing } from './listings';

export function transformPost(row: any): Post {
  return {
    id: row.id,
    userId: row.user_id,
    user: row.user ? transformUser(row.user) : ({} as any),
    content: row.content,
    images: row.images ?? [],
    linkedItemId: row.linked_listing_id ?? undefined,
    linkedItem: row.linked_listing ? transformListing(row.linked_listing) : undefined,
    eventId: row.event_id ?? undefined,
    event: row.event ? transformEvent(row.event) : undefined,
    likes: row.likes_count ?? 0,
    comments: row.comments_count ?? 0,
    shares: row.shares_count ?? 0,
    createdAt: new Date(row.created_at),
    tags: row.tags ?? [],
  };
}

export async function getPosts(
  supabase: SupabaseClient<Database>,
  filter: 'all' | 'following' | 'trending' = 'all',
  page: number = 0,
  pageSize: number = 20
) {
  let query = supabase
    .from('posts')
    .select(
      '*, user:users!user_id(*), event:events!event_id(*), linked_listing:listings!linked_listing_id(*, seller:users!seller_id(*), event:events!event_id(*))',
      { count: 'exact' }
    );

  if (filter === 'trending') {
    query = query.order('likes_count', { ascending: false });
  } else {
    query = query.order('created_at', { ascending: false });
  }

  // Pagination
  query = query.range(page * pageSize, (page + 1) * pageSize - 1);

  const { data, error, count } = await query;

  if (error) throw error;
  return {
    posts: (data ?? []).map(transformPost),
    count: count ?? 0,
  };
}

export async function getPostsByUser(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { data, error } = await supabase
    .from('posts')
    .select(
      '*, user:users!user_id(*), event:events!event_id(*), linked_listing:listings!linked_listing_id(*, seller:users!seller_id(*), event:events!event_id(*))'
    )
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(transformPost);
}

export async function createPost(
  supabase: SupabaseClient<Database>,
  post: Database['public']['Tables']['posts']['Insert']
) {
  const { data, error } = await (supabase as any)
    .from('posts')
    .insert(post)
    .select(
      '*, user:users!user_id(*), event:events!event_id(*), linked_listing:listings!linked_listing_id(*, seller:users!seller_id(*), event:events!event_id(*))'
    )
    .single();

  if (error) throw error;
  return data ? transformPost(data) : null;
}

export async function toggleLike(
  supabase: SupabaseClient<Database>,
  userId: string,
  postId: string
) {
  // Check if already liked
  const { data: existing } = await (supabase as any)
    .from('likes')
    .select('id')
    .eq('user_id', userId)
    .eq('post_id', postId)
    .single();

  if (existing) {
    await (supabase as any).from('likes').delete().eq('id', existing.id);
    return false;
  } else {
    await (supabase as any).from('likes').insert({ user_id: userId, post_id: postId });
    return true;
  }
}
