import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // 1. Fetch all generated certificates
    const certificates = await prisma.certificate.findMany({
      include: {
        user: {
          select: {
            id: true,
            username: true,
            email: true,
            displayName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // 2. Fetch users and check who qualifies for milestone rewards
    const allUsers = await prisma.user.findMany({
      where: {
        totalTrees: { gte: 10 },
      },
      include: {
        badges: true,
        certificates: true,
      },
    });

    const pendingMilestones: any[] = [];
    allUsers.forEach((u) => {
      const activeBadges = u.badges.map((b) => b.code);
      const activeCerts = u.certificates.map((c) => c.badgeName);

      // Check Green Warrior (10+ trees)
      if (u.totalTrees >= 10 && (!activeBadges.includes('WARRIOR') || !activeCerts.includes('Green Warrior'))) {
        pendingMilestones.push({
          id: `${u.id}-warrior`,
          userId: u.id,
          username: u.username,
          displayName: u.displayName,
          milestone: '10 Trees Planted',
          badgeCode: 'WARRIOR',
          badgeName: 'Green Warrior',
          dateReached: u.updatedAt,
        });
      }

      // Check Nature Protector (30+ trees)
      if (u.totalTrees >= 30 && (!activeBadges.includes('PROTECTOR') || !activeCerts.includes('Nature Protector'))) {
        pendingMilestones.push({
          id: `${u.id}-protector`,
          userId: u.id,
          username: u.username,
          displayName: u.displayName,
          milestone: '30 Trees Planted',
          badgeCode: 'PROTECTOR',
          badgeName: 'Nature Protector',
          dateReached: u.updatedAt,
        });
      }

      // Check Zubeen Nahor Champion (50+ trees)
      if (u.totalTrees >= 50 && (!activeBadges.includes('CHAMPION') || !activeCerts.includes('Zubeen Nahor Champion'))) {
        pendingMilestones.push({
          id: `${u.id}-champion`,
          userId: u.id,
          username: u.username,
          displayName: u.displayName,
          milestone: '50 Trees Planted',
          badgeCode: 'CHAMPION',
          badgeName: 'Zubeen Nahor Champion',
          dateReached: u.updatedAt,
        });
      }
    });

    return NextResponse.json({ certificates, pendingMilestones });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, awardDate, dedicationNote, badgeName, badgeCode } = await req.json();
    if (!userId || !awardDate || !badgeName) {
      return NextResponse.json({ error: 'User ID, Award Date, and Badge Name are required' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { badges: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Start transaction to record Certificate, Badge and Notification
    const result = await prisma.$transaction(async (tx) => {
      // 1. Create Certificate
      const cert = await tx.certificate.create({
        data: {
          recipientName: user.displayName,
          awardDate,
          dedicationNote: dedicationNote || `For successfully earning the ${badgeName} milestone.`,
          badgeName,
          userId: user.id,
        },
      });

      // 2. Award Badge if not already exists
      const hasBadge = user.badges.some((b) => b.code === badgeCode);
      if (!hasBadge && badgeCode) {
        await tx.badge.create({
          data: {
            name: badgeName,
            code: badgeCode,
            description: dedicationNote || `Awarded for completing plantation milestone: ${badgeName}`,
            userId: user.id,
          },
        });
      }

      // 3. Notify the user
      await tx.notification.create({
        data: {
          type: 'APPROVAL',
          content: `Congratulations! You have been awarded the "${badgeName}" certificate of appreciation.`,
          userId: user.id,
        },
      });

      // 4. Log admin action
      await tx.adminLog.create({
        data: {
          action: 'ISSUE_CERTIFICATE',
          details: `Issued "${badgeName}" certificate to ${user.displayName} (${user.email}).`,
          adminId: admin.id,
        },
      });

      return cert;
    });

    return NextResponse.json({ message: 'Certificate issued successfully', certificate: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
