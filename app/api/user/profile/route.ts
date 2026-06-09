import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('userId');

    let targetUserId: string;
    
    if (!userId) {
      const authUser = await getAuthenticatedUser(req);
      if (!authUser) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
      targetUserId = authUser.id;
    } else {
      targetUserId = userId;
    }

    const user = await prisma.user.findUnique({
      where: { id: targetUserId },
      select: {
        id: true,
        username: true,
        displayName: true,
        bio: true,
        role: true,
        avatarUrl: true,
        totalTrees: true,
        createdAt: true,
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const postsCount = await prisma.post.count({ where: { userId: targetUserId } });
    const followersCount = await prisma.follower.count({ where: { followingId: targetUserId } });
    const followingCount = await prisma.follower.count({ where: { followerId: targetUserId } });

    const badges = await prisma.badge.findMany({
      where: { userId: targetUserId },
    });

    const posts = await prisma.post.findMany({
      where: { userId: targetUserId },
      orderBy: { createdAt: 'desc' },
    });

    const plantations = await prisma.plantationRecord.findMany({
      where: { userId: targetUserId, status: 'APPROVED' },
      orderBy: { date: 'desc' },
    });

    const groupMemberships = await prisma.groupMember.findMany({
      where: { userId: targetUserId },
      include: {
        group: {
          include: {
            creator: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    const eventRegistrations = await prisma.eventRegistration.findMany({
      where: { userId: targetUserId },
      include: {
        event: {
          include: {
            organiser: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({
      user,
      postsCount,
      followersCount,
      followingCount,
      badges,
      posts,
      plantations,
      joinedGroups: groupMemberships.map((m) => m.group),
      joinedEvents: eventRegistrations.map((r) => r.event),
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
