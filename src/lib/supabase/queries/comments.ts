import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Comment } from '@/types/marketplace';
import { transformUser } from './users';

export function transformComment(row: any): Comment {
  return {
    id: row.id,
    postId: row.post_id,
    userId: row.user_id,
    user: row.user ? transformUser(row.user) : ({} as any),
    content: row.content,
    parentCommentId: row.parent_comment_id ?? undefined,
    createdAt: new Date(row.created_at),
  };
}

export async function getCommentsByPost(
  supabase: SupabaseClient<Database>,
  postId: string
) {
  const { data, error } = await supabase
    .from('comments')
    .select('*, user:users!user_id(*)')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return (data ?? []).map(transformComment);
}

export async function createComment(
  supabase: SupabaseClient<Database>,
  comment: {
    post_id: string;
    user_id: string;
    content: string;
    parent_comment_id?: string;
  }
) {
  const { data, error } = await (supabase as any)
    .from('comments')
    .insert(comment)
    .select('*, user:users!user_id(*)')
    .single();

  if (error) throw error;
  return data ? transformComment(data) : null;
}

export async function deleteComment(
  supabase: SupabaseClient<Database>,
  commentId: string,
  userId: string
) {
  const { error } = await (supabase as any)
    .from('comments')
    .delete()
    .eq('id', commentId)
    .eq('user_id', userId);

  if (error) throw error;
}
