import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';

const POST_SELECT = `*, user:users!user_id(*), event:events!event_id(*), linked_listing:listings!linked_listing_id(*, seller:users!seller_id(*), event:events!event_id(*))`;

export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const { content, images, tags, eventId, linkedListingId } = body;

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Post content is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    const { data, error } = await supabase
      .from('posts')
      .insert({
        user_id: user.id,
        content: content.trim(),
        images: images ?? [],
        tags: tags ?? [],
        event_id: eventId ?? null,
        linked_listing_id: linkedListingId ?? null,
      })
      .select(POST_SELECT)
      .single();

    if (error) {
      console.error('Failed to create post:', error);
      return NextResponse.json(
        { error: `Failed to create post: ${error.message}` },
        { status: 500 }
      );
    }

    return NextResponse.json({ post: data }, { status: 201 });
  } catch (err) {
    console.error('Create post error:', err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
