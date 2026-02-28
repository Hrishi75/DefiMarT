import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const postId = params.id;
    const supabase = createAdminClient();

    // Check if already liked
    const { data: existing } = await supabase
      .from('likes')
      .select('id')
      .eq('user_id', user.id)
      .eq('post_id', postId)
      .single();

    if (existing) {
      // Unlike
      await supabase.from('likes').delete().eq('id', existing.id);
      return NextResponse.json({ liked: false });
    } else {
      // Like
      await supabase.from('likes').insert({ user_id: user.id, post_id: postId });
      return NextResponse.json({ liked: true });
    }
  } catch (err) {
    console.error('Toggle like error:', err);
    return NextResponse.json(
      { error: 'Failed to toggle like' },
      { status: 500 }
    );
  }
}
