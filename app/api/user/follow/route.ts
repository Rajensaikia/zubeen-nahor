import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { followingId } = await req.json();
    if (!followingId) {
      return NextResponse.json({ error: 'Following ID is required' }, { status: 400 });
    }

    if (user.id === followingId) {
      return NextResponse.json({ error: 'You cannot follow yourself' }, { status: 400 });
    }

    const existingFollow = await prisma.follower.findUnique({
      where: {
        followerId_followingId: {
          followerId: user.id,
          followingId,
        },
      },
    });

    if (existingFollow) {
      // Unfollow
      await prisma.follower.delete({
        where: {
          followerId_followingId: {
            followerId: user.id,
            followingId,
          },
        },
      });

      return NextResponse.json({ followed: false });
    } else {
      // Follow
      await prisma.follower.create({
        data: {
          followerId: user.id,
          followingId,
        },
      });

      // Create a notification for the followed user
      await prisma.notification.create({
        data: {
          type: 'FOLLOW',
          content: `${user.displayName} started following you.`,
          userId: followingId,
          senderId: user.id,
        },
      });

      return NextResponse.json({ followed: true });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
