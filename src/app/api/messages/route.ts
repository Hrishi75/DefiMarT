import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { getConversations, getOrCreateConversation } from '@/lib/supabase/queries/messages';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const supabase = createAdminClient();
    const conversations = await getConversations(supabase, user.id);

    return NextResponse.json({ conversations });
  } catch (err) {
    console.error('Fetch conversations error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch conversations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { recipientId } = await request.json();
    if (!recipientId) {
      return NextResponse.json(
        { error: 'Missing recipientId' },
        { status: 400 }
      );
    }

    if (recipientId === user.id) {
      return NextResponse.json(
        { error: 'Cannot message yourself' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const conversationId = await getOrCreateConversation(
      supabase,
      user.id,
      recipientId
    );

    return NextResponse.json({ conversationId });
  } catch (err) {
    console.error('Create conversation error:', err);
    return NextResponse.json(
      { error: 'Failed to create conversation' },
      { status: 500 }
    );
  }
}
