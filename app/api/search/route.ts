import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get('q')?.trim() || '';

    if (!query) {
      return NextResponse.json({ users: [], groups: [], events: [] });
    }

    // Search users (people)
    const users = await prisma.user.findMany({
      where: {
        OR: [
          { displayName: { contains: query } },
          { username: { contains: query } },
        ],
      },
      select: {
        id: true,
        username: true,
        displayName: true,
        avatarUrl: true,
        bio: true,
        totalTrees: true,
        isVerified: true,
      },
      take: 15,
    });

    // Search groups (community groups)
    const groups = await prisma.group.findMany({
      where: {
        OR: [
          { name: { contains: query } },
          { description: { contains: query } },
        ],
      },
      select: {
        id: true,
        name: true,
        description: true,
        type: true,
        imageUrl: true,
        membersCount: true,
      },
      take: 15,
    });

    // Search events
    const events = await prisma.event.findMany({
      where: {
        OR: [
          { title: { contains: query } },
          { description: { contains: query } },
          { location: { contains: query } },
          { district: { contains: query } },
        ],
      },
      select: {
        id: true,
        title: true,
        description: true,
        date: true,
        location: true,
        district: true,
        imageUrl: true,
        attendeesCount: true,
      },
      take: 15,
    });

    return NextResponse.json({ users, groups, events });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
