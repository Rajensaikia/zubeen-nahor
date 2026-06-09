import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { recordId, action } = await req.json();
    if (!recordId || !action) {
      return NextResponse.json({ error: 'Record ID and action are required' }, { status: 400 });
    }

    const record = await prisma.plantationRecord.findUnique({
      where: { id: recordId },
    });

    if (!record) {
      return NextResponse.json({ error: 'Record not found' }, { status: 404 });
    }

    if (record.status !== 'PENDING') {
      return NextResponse.json({ error: 'Record already verified' }, { status: 400 });
    }

    if (action === 'APPROVE') {
      await prisma.$transaction(async (tx) => {
        await tx.plantationRecord.update({
          where: { id: recordId },
          data: {
            status: 'APPROVED',
            verifiedBy: admin.id,
          },
        });

        const user = await tx.user.update({
          where: { id: record.userId },
          data: {
            totalTrees: { increment: record.treeCount },
          },
        });

        const post = await tx.post.findFirst({
          where: { userId: record.userId, treeCount: record.treeCount, status: 'PENDING' },
        });

        if (post) {
          await tx.post.update({
            where: { id: post.id },
            data: { status: 'APPROVED' },
          });
        }

        const badges = await tx.badge.findMany({
          where: { userId: record.userId },
        });

        const hasWarrior = badges.some((b) => b.code === 'WARRIOR');
        const hasProtector = badges.some((b) => b.code === 'PROTECTOR');
        const hasChampion = badges.some((b) => b.code === 'CHAMPION');

        const newBadges = [];
        if (user.totalTrees >= 10 && !hasWarrior) {
          newBadges.push({
            name: 'Green Warrior',
            code: 'WARRIOR',
            description: 'Awarded for planting 10+ trees.',
            userId: user.id,
          });
        }
        if (user.totalTrees >= 30 && !hasProtector) {
          newBadges.push({
            name: 'Nature Protector',
            code: 'PROTECTOR',
            description: 'Awarded for planting 30+ trees.',
            userId: user.id,
          });
        }
        if (user.totalTrees >= 50 && !hasChampion) {
          newBadges.push({
            name: 'Zubeen Nahor Champion',
            code: 'CHAMPION',
            description: 'Awarded for planting 50+ trees.',
            userId: user.id,
          });
        }

        if (newBadges.length > 0) {
          await tx.badge.createMany({
            data: newBadges,
          });
        }

        await tx.notification.create({
          data: {
            type: 'APPROVAL',
            content: `Your plantation record of ${record.treeCount} trees in ${record.district} has been approved! Total trees counter updated.`,
            userId: record.userId,
          },
        });

        await tx.adminLog.create({
          data: {
            action: 'APPROVE_RECORD',
            details: `Approved ${record.treeCount} trees for ${record.name} (${record.district}).`,
            adminId: admin.id,
          },
        });
      });

      return NextResponse.json({ message: 'Record approved successfully' });
    } else {
      await prisma.$transaction(async (tx) => {
        await tx.plantationRecord.update({
          where: { id: recordId },
          data: {
            status: 'REJECTED',
            verifiedBy: admin.id,
          },
        });

        const post = await tx.post.findFirst({
          where: { userId: record.userId, treeCount: record.treeCount, status: 'PENDING' },
        });

        if (post) {
          await tx.post.update({
            where: { id: post.id },
            data: { status: 'REJECTED' },
          });
        }

        await tx.notification.create({
          data: {
            type: 'REJECTION',
            content: `Your plantation record of ${record.treeCount} trees in ${record.district} was rejected during validation.`,
            userId: record.userId,
          },
        });

        await tx.adminLog.create({
          data: {
            action: 'REJECT_RECORD',
            details: `Rejected plantation record for ${record.name} (${record.district}).`,
            adminId: admin.id,
          },
        });
      });

      return NextResponse.json({ message: 'Record rejected successfully' });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
