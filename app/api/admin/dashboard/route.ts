import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const pendingSubmissions = await prisma.plantationRecord.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
    });

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        username: true,
        displayName: true,
        role: true,
        totalTrees: true,
        isVerified: true,
        createdAt: true,
      },
      orderBy: { totalTrees: 'desc' },
    });

    const totalUsers = await prisma.user.count();
    const totalPosts = await prisma.post.count();
    const approvedTreesSum = await prisma.plantationRecord.aggregate({
      where: { status: 'APPROVED' },
      _sum: { treeCount: true },
    });
    const pendingCount = await prisma.plantationRecord.count({
      where: { status: 'PENDING' },
    });
    const totalEvents = await prisma.event.count();

    const rawGrowth = await prisma.plantationRecord.findMany({
      where: { status: 'APPROVED' },
      select: { date: true, treeCount: true },
      orderBy: { date: 'asc' },
    });

    const monthlyData: Record<string, number> = {};
    rawGrowth.forEach((item) => {
      const monthStr = new Date(item.date).toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      monthlyData[monthStr] = (monthlyData[monthStr] || 0) + item.treeCount;
    });

    const growthChartData = Object.entries(monthlyData).map(([month, trees]) => ({
      month,
      trees,
    }));

    // Query all community groups
    const groups = await prisma.group.findMany({
      include: {
        creator: {
          select: {
            displayName: true,
            username: true,
          },
        },
        members: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                email: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        },
        messages: {
          include: {
            user: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Query all awarded badges
    const badges = await prisma.badge.findMany({
      include: {
        user: {
          select: {
            displayName: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Query all scheduled events
    const events = await prisma.event.findMany({
      include: {
        organiser: {
          select: {
            displayName: true,
            username: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                email: true,
              },
            },
          },
        },
        messages: {
          include: {
            user: {
              select: {
                displayName: true,
                username: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({
      pendingSubmissions,
      users,
      stats: {
        totalUsers,
        totalPosts,
        totalApprovedTrees: approvedTreesSum._sum.treeCount || 0,
        pendingCount,
        totalEvents,
      },
      growthChartData,
      groups,
      badges,
      events,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
