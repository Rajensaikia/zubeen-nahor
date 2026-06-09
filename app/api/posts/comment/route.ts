import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { postId, content } = await req.json();
    if (!postId || !content) {
      return NextResponse.json({ error: 'Post ID and content are required' }, { status: 400 });
    }

    const [comment] = await prisma.$transaction([
      prisma.comment.create({
        data: {
          content,
          postId,
          userId: user.id,
        },
        include: {
          user: {
            select: {
              id: true,
              username: true,
              displayName: true,
              avatarUrl: true,
            },
          },
        },
      }),
      prisma.post.update({
        where: { id: postId },
        data: { commentsCount: { increment: 1 } },
      }),
    ]);

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (post && post.userId !== user.id) {
      await prisma.notification.create({
        data: {
          type: 'COMMENT',
          content: `${user.displayName} commented on your post: "${content.substring(0, 30)}${content.length > 30 ? '...' : ''}"`,
          userId: post.userId,
          senderId: user.id,
        },
      });
    }

    return NextResponse.json({ comment });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
