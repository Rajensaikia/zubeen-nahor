import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const topUsers = await prisma.user.findMany({
      select: {
        id: true,
        displayName: true,
        username: true,
        avatarUrl: true,
        totalTrees: true,
        badges: {
          select: {
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        totalTrees: 'desc',
      },
      take: 10,
    });

    const topDistrictsRaw = await prisma.plantationRecord.groupBy({
      by: ['district'],
      where: { status: 'APPROVED' },
      _sum: {
        treeCount: true,
      },
      orderBy: {
        _sum: {
          treeCount: 'desc',
        },
      },
      take: 10,
    });

    const topDistricts = topDistrictsRaw.map((d) => ({
      district: d.district,
      treeCount: d._sum.treeCount || 0,
    }));

    return NextResponse.json({
      topUsers,
      topDistricts,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
