import { SupabaseClient } from '@supabase/supabase-js';
import type { Database } from '../types';
import type { Message, Conversation } from '@/types/marketplace';
import { transformUser } from './users';

export function transformMessage(row: any): Message {
  return {
    id: row.id,
    conversationId: row.conversation_id,
    senderId: row.sender_id,
    sender: row.sender ? transformUser(row.sender) : undefined,
    content: row.content,
    read: row.read,
    createdAt: new Date(row.created_at),
  };
}

export function transformConversation(row: any, currentUserId: string): Conversation {
  const isParticipant1 = row.participant_1 === currentUserId;
  const otherUserData = isParticipant1 ? row.user2 : row.user1;

  return {
    id: row.id,
    participant1: row.participant_1,
    participant2: row.participant_2,
    otherUser: otherUserData ? transformUser(otherUserData) : ({} as any),
    lastMessage: row.last_message?.[0] ? transformMessage(row.last_message[0]) : undefined,
    lastMessageAt: new Date(row.last_message_at),
    unreadCount: row.unread_count ?? 0,
    createdAt: new Date(row.created_at),
  };
}

function normalizeParticipants(id1: string, id2: string): [string, string] {
  return id1 < id2 ? [id1, id2] : [id2, id1];
}

export async function getOrCreateConversation(
  supabase: SupabaseClient<Database>,
  userId1: string,
  userId2: string
): Promise<string> {
  const [p1, p2] = normalizeParticipants(userId1, userId2);

  // Check existing
  const { data: existing } = await (supabase as any)
    .from('conversations')
    .select('id')
    .eq('participant_1', p1)
    .eq('participant_2', p2)
    .single();

  if (existing) return (existing as any).id;

  // Create new
  const { data, error } = await (supabase as any)
    .from('conversations')
    .insert({ participant_1: p1, participant_2: p2 })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function getConversations(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<Conversation[]> {
  // Get conversations where user is either participant
  const { data, error } = await supabase
    .from('conversations')
    .select('*, user1:users!participant_1(*), user2:users!participant_2(*)')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`)
    .order('last_message_at', { ascending: false });

  if (error) throw error;

  const conversations = await Promise.all(
    (data ?? []).map(async (row: any) => {
      // Get last message
      const { data: lastMsg } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', row.id)
        .order('created_at', { ascending: false })
        .limit(1);

      // Get unread count
      const { count: unreadCount } = await supabase
        .from('messages')
        .select('id', { count: 'exact', head: true })
        .eq('conversation_id', row.id)
        .neq('sender_id', userId)
        .eq('read', false);

      return transformConversation(
        { ...row, last_message: lastMsg, unread_count: unreadCount ?? 0 },
        userId
      );
    })
  );

  return conversations;
}

export async function getMessages(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  page: number = 0,
  pageSize: number = 50
): Promise<{ messages: Message[]; count: number }> {
  const { data, error, count } = await supabase
    .from('messages')
    .select('*, sender:users!sender_id(*)', { count: 'exact' })
    .eq('conversation_id', conversationId)
    .order('created_at', { ascending: true })
    .range(page * pageSize, (page + 1) * pageSize - 1);

  if (error) throw error;
  return {
    messages: (data ?? []).map(transformMessage),
    count: count ?? 0,
  };
}

export async function sendMessage(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  senderId: string,
  content: string
): Promise<Message> {
  const { data, error } = await (supabase as any)
    .from('messages')
    .insert({
      conversation_id: conversationId,
      sender_id: senderId,
      content,
    })
    .select('*, sender:users!sender_id(*)')
    .single();

  if (error) throw error;

  // Update conversation last_message_at
  await (supabase as any)
    .from('conversations')
    .update({ last_message_at: new Date().toISOString() })
    .eq('id', conversationId);

  return transformMessage(data);
}

export async function markMessagesRead(
  supabase: SupabaseClient<Database>,
  conversationId: string,
  userId: string
): Promise<void> {
  const { error } = await (supabase as any)
    .from('messages')
    .update({ read: true })
    .eq('conversation_id', conversationId)
    .neq('sender_id', userId)
    .eq('read', false);

  if (error) throw error;
}

export async function getUnreadMessageCount(
  supabase: SupabaseClient<Database>,
  userId: string
): Promise<number> {
  // Get all conversation IDs for the user
  const { data: convos } = await supabase
    .from('conversations')
    .select('id')
    .or(`participant_1.eq.${userId},participant_2.eq.${userId}`);

  if (!convos || convos.length === 0) return 0;

  const convoIds = convos.map((c: any) => c.id);

  const { count, error } = await supabase
    .from('messages')
    .select('id', { count: 'exact', head: true })
    .in('conversation_id', convoIds)
    .neq('sender_id', userId)
    .eq('read', false);

  if (error) return 0;
  return count ?? 0;
}
