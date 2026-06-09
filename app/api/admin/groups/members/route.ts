import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function DELETE(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const userId = searchParams.get('userId');

    if (!groupId || !userId) {
      return NextResponse.json({ error: 'Group ID and User ID are required' }, { status: 400 });
    }

    const member = await prisma.groupMember.findUnique({
      where: {
        groupId_userId: { groupId, userId },
      },
      include: {
        user: { select: { username: true } },
        group: { select: { name: true } },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Membership record not found' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.groupMember.delete({
        where: {
          groupId_userId: { groupId, userId },
        },
      });

      await tx.group.update({
        where: { id: groupId },
        data: { membersCount: { decrement: 1 } },
      });
    });

    // Log administrative action
    await prisma.adminLog.create({
      data: {
        action: 'REMOVE_GROUP_MEMBER',
        details: `Removed user @${member.user.username} from group "${member.group.name}".`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Member removed successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
