import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, badgeName, badgeCode, description } = await req.json();
    if (!userId || !badgeName || !badgeCode) {
      return NextResponse.json({ error: 'User ID, badge name, and badge code are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const badge = await prisma.badge.create({
      data: {
        name: badgeName,
        code: badgeCode,
        description: description || `Awarded for achievements: ${badgeName}`,
        userId,
      },
    });

    // Create notification
    await prisma.notification.create({
      data: {
        type: 'APPROVAL',
        content: `Congratulations! You have been awarded the "${badgeName}" badge by the system administrators.`,
        userId,
      },
    });

    // Create admin action log
    await prisma.adminLog.create({
      data: {
        action: 'AWARD_BADGE',
        details: `Manually awarded "${badgeName}" badge (Code: ${badgeCode}) to @${user.username} (${user.email}).`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Badge awarded successfully', badge });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const badgeId = searchParams.get('badgeId');
    if (!badgeId) {
      return NextResponse.json({ error: 'Badge ID is required' }, { status: 400 });
    }

    const badge = await prisma.badge.findUnique({
      where: { id: badgeId },
      include: {
        user: {
          select: {
            username: true,
            email: true,
          },
        },
      },
    });

    if (!badge) {
      return NextResponse.json({ error: 'Badge not found' }, { status: 404 });
    }

    await prisma.badge.delete({
      where: { id: badgeId },
    });

    // Create admin action log
    await prisma.adminLog.create({
      data: {
        action: 'REVOKE_BADGE',
        details: `Revoked "${badge.name}" badge from @${badge.user.username} (${badge.user.email}).`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Badge revoked successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
