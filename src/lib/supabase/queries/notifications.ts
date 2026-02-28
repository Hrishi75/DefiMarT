import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Notification } from '@/types/marketplace';

export function transformNotification(row: any): Notification {
  return {
    id: row.id,
    userId: row.user_id,
    type: row.type,
    title: row.title,
    message: row.message ?? '',
    link: row.link ?? undefined,
    read: row.read,
    createdAt: new Date(row.created_at),
  };
}

export async function getNotifications(
  supabase: SupabaseClient<Database>,
  userId: string,
  page: number = 0,
  pageSize: number = 20
) {
  const { data, error, count } = await supabase
    .from('notifications')
    .select('*', { count: 'exact' })
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return {
    notifications: (data ?? []).map(transformNotification),
    count: count ?? 0,
  };
}

export async function getUnreadCount(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<number> {
  const { count, error } = await supabase
    .from('notifications')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
  return count ?? 0;
}

export async function markAsRead(
  supabase: SupabaseClient<Database>,
  notificationId: string
) {
  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read: true })
    .eq('id', notificationId);

  if (error) throw error;
}

export async function markAllAsRead(
  supabase: SupabaseClient<Database>,
  userId: string
) {
  const { error } = await (supabase as any)
    .from('notifications')
    .update({ read: true })
    .eq('user_id', userId)
    .eq('read', false);

  if (error) throw error;
}

export async function createNotification(
  supabase: SupabaseClient<Database>,
  notification: {
    user_id: string;
    type: string;
    title: string;
    message?: string;
    link?: string;
  }
) {
  const { data, error } = await (supabase as any)
    .from('notifications')
    .insert(notification)
    .select('*')
    .single();

  if (error) throw error;
  return data ? transformNotification(data) : null;
}
