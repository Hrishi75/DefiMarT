import { NextRequest, NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { getAuthUser } from '@/lib/auth';
import { getCommentsByPost, createComment, transformComment } from '@/lib/supabase/queries/comments';
import { createNotification } from '@/lib/supabase/queries/notifications';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: postId } = await params;
    const supabase = createAdminClient();
    const comments = await getCommentsByPost(supabase, postId);
    return NextResponse.json({ comments });
  } catch (err) {
    console.error('Fetch comments error:', err);
    return NextResponse.json(
      { error: 'Failed to fetch comments' },
      { status: 500 }
    );
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getAuthUser(request);
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: postId } = await params;
    const { content, parentCommentId } = await request.json();

    if (!content?.trim()) {
      return NextResponse.json(
        { error: 'Comment content is required' },
        { status: 400 }
      );
    }

    const supabase = createAdminClient();

    // Create the comment
    const comment = await createComment(supabase, {
      post_id: postId,
      user_id: user.id,
      content: content.trim(),
      parent_comment_id: parentCommentId || undefined,
    });

    // Increment comments_count on the post
    const { data: post } = await supabase
      .from('posts')
      .select('user_id, comments_count')
      .eq('id', postId)
      .single();

    if (post) {
      await (supabase as any)
        .from('posts')
        .update({ comments_count: (post.comments_count ?? 0) + 1 })
        .eq('id', postId);

      // Notify post author (if not commenting on own post)
      if (post.user_id !== user.id) {
        await createNotification(supabase, {
          user_id: post.user_id,
          type: 'comment',
          title: 'New comment on your post',
          message: `${user.display_name || user.username} commented: "${content.trim().slice(0, 100)}"`,
          link: `/feed`,
        });
      }
    }

    return NextResponse.json({ comment }, { status: 201 });
  } catch (err) {
    console.error('Create comment error:', err);
    return NextResponse.json(
      { error: 'Failed to create comment' },
      { status: 500 }
    );
  }
}
