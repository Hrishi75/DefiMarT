import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import {
  getMessages,
  sendMessage,
  markMessagesRead,
} from '@/lib/supabase/queries/messages';
import { createNotification } from '@/lib/supabase/queries/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { conversationId } = await params;
    const page = Number(request.nextUrl.searchParams.get('page') ?? '0');
    const supabase = createAdminClient();

    // Verify user is a participant
    const { data: convo } = await supabase
      .from('conversations')
      .select('participant_1, participant_2')
      .eq('id', conversationId)
      .single();

    if (!convo || (convo.participant_1 !== user.id && convo.participant_2 !== user.id)) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const result = await getMessages(supabase, conversationId, page);
    return NextResponse.json(result);
  } catch (err) {
    console.error('Fetch messages error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { conversationId } = await params;
    const { content } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Message content is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Verify user is a participant and get the other user
    const { data: convo } = await supabase
      .from('conversations')
      .select('participant_1, participant_2')
      .eq('id', conversationId)
      .single();

    if (!convo || (convo.participant_1 !== user.id && convo.participant_2 !== user.id)) {
      return NextResponse.json(
        { error: 'Not authorized' },
        { status: 403 }
      );
    }

    const message = await sendMessage(supabase, conversationId, user.id, content.trim());

    // Notify the other participant
    const recipientId = convo.participant_1 === user.id
      ? convo.participant_2
      : convo.participant_1;

    await createNotification(supabase, {
      user_id: recipientId,
      type: 'message',
      title: 'New message',
      message: `${user.display_name || user.username}: "${content.trim().slice(0, 100)}"`,
      link: `/messages?conversation=${conversationId}`,
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (err) {
    console.error('Send message error:', err);
    return NextResponse.json(
      { error: 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ conversationId: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { conversationId } = await params;
    const supabase = createAdminClient();

    await markMessagesRead(supabase, conversationId, user.id);

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Mark messages read error:', err);
    return NextResponse.json(
      { error: 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
