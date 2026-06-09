import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { email, district, village, location, treeCount, species, date } = await req.json();
    if (!email || !district || !treeCount || !species) {
      return NextResponse.json({ error: 'Email, district, count, and species are required' }, { status: 400 });
    }

    let user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      const baseUsername = email.split('@')[0].toLowerCase().replace(/[^a-z0-9]/g, '') || 'guest';
      const username = `${baseUsername}${Math.floor(100 + Math.random() * 900)}`;
      user = await prisma.user.create({
        data: {
          email,
          username,
          passwordHash: 'MANUAL_ENTRY_ACCOUNT',
          displayName: baseUsername,
        },
      });
    }

    const count = parseInt(treeCount) || 1;

    const record = await prisma.plantationRecord.create({
      data: {
        name: user.displayName,
        mobile: 'MANUAL ENTRY',
        district,
        village: village || 'N/A',
        location: location || 'N/A',
        treeCount: count,
        species,
        date: date ? new Date(date) : new Date(),
        status: 'APPROVED',
        userId: user.id,
        verifiedBy: admin.id,
      },
    });

    await prisma.user.update({
      where: { id: user.id },
      data: { totalTrees: { increment: count } },
    });

    await prisma.adminLog.create({
      data: {
        action: 'MANUAL_PLANTATION_ENTRY',
        details: `Manually added ${count} trees to user ${user.email} in ${district}.`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Manual entry saved successfully', record });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
