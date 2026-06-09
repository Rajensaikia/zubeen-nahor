import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const approvedTreesSum = await prisma.plantationRecord.aggregate({
      where: { status: 'APPROVED' },
      _sum: { treeCount: true },
    });

    const contributorsGroup = await prisma.plantationRecord.groupBy({
      by: ['userId'],
      where: { status: 'APPROVED' },
    });

    const districtsGroup = await prisma.plantationRecord.groupBy({
      by: ['district'],
      where: { status: 'APPROVED' },
    });

    const totalEvents = await prisma.event.count();

    const latestEvents = await prisma.event.findMany({
      take: 2,
      orderBy: { date: 'asc' },
    });

    const latestGroups = await prisma.group.findMany({
      take: 3,
      orderBy: { membersCount: 'desc' },
    });

    return NextResponse.json({
      stats: {
        totalTrees: approvedTreesSum._sum.treeCount || 0,
        totalContributors: contributorsGroup.length,
        totalDistricts: districtsGroup.length,
        totalEvents: totalEvents,
      },
      latestEvents,
      latestGroups,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
