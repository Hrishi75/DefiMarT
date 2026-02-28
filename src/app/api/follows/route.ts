import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { toggleFollow, isFollowing, getFollowCounts } from '@/lib/supabase/queries/follows';
import { createNotification } from '@/lib/supabase/queries/notifications';

export async function GET(request: NextRequest) {
  try {
    const userId = request.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const counts = await getFollowCounts(supabase, userId);

    // Check if current user follows this user
    const currentUser = await getAuthUser(request);
    let following = false;
    if (currentUser && currentUser.id !== userId) {
      following = await isFollowing(supabase, currentUser.id, userId);
    }

    return NextResponse.json({ ...counts, following });
  } catch (err) {
    console.error('Fetch follow info error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch follow info' },
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

    const { targetUserId } = await request.json();
    if (!targetUserId) {
      return NextResponse.json(
        { error: 'Missing targetUserId' },
        { status: 400 }
      );
    }

    if (targetUserId === user.id) {
      return NextResponse.json(
        { error: 'Cannot follow yourself' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();
    const followed = await toggleFollow(supabase, user.id, targetUserId);

    // Notify the target user when followed
    if (followed) {
      await createNotification(supabase, {
        user_id: targetUserId,
        type: 'follow',
        title: 'New follower',
        message: `${user.display_name || user.username} started following you`,
        link: `/profile/${user.id}`,
      });
    }

    return NextResponse.json({ followed });
  } catch (err) {
    console.error('Toggle follow error:', err);
    return NextResponse.json(
      { error: 'Failed to toggle follow' },
      { status: 500 }
    );
  }
}
