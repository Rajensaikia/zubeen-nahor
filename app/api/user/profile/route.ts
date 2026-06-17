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

    // Check if the authenticated user is currently following the target profile user
    let isFollowing = false;
    const authUser = await getAuthenticatedUser(req).catch(() => null);
    if (authUser && authUser.id !== targetUserId) {
      const followRecord = await prisma.follower.findUnique({
        where: {
          followerId_followingId: {
            followerId: authUser.id,
            followingId: targetUserId,
          },
        },
      });
      isFollowing = !!followRecord;
    }

    // Fetch the list of followers
    const followers = await prisma.follower.findMany({
      where: { followingId: targetUserId },
      include: {
        follower: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            totalTrees: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Fetch the list of following users
    const following = await prisma.follower.findMany({
      where: { followerId: targetUserId },
      include: {
        following: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            bio: true,
            totalTrees: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

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
      isFollowing,
      followers: followers.map((f) => f.follower),
      following: following.map((f) => f.following),
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
