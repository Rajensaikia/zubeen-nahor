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

    return NextResponse.json({
      totalTrees: approvedTreesSum._sum.treeCount || 0,
      totalContributors: contributorsGroup.length,
      totalDistricts: districtsGroup.length,
      totalEvents: totalEvents,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
