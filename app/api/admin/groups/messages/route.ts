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
    const messageId = searchParams.get('messageId');

    if (!messageId) {
      return NextResponse.json({ error: 'Message ID is required' }, { status: 400 });
    }

    const message = await prisma.groupMessage.findUnique({
      where: { id: messageId },
      include: {
        user: { select: { username: true } },
        group: { select: { name: true } },
      },
    });

    if (!message) {
      return NextResponse.json({ error: 'Message not found' }, { status: 404 });
    }

    await prisma.groupMessage.delete({
      where: { id: messageId },
    });

    // Log administrative action
    await prisma.adminLog.create({
      data: {
        action: 'DELETE_GROUP_MESSAGE',
        details: `Deleted message by @${message.user.username} from group "${message.group.name}": "${message.content.substring(0, 30)}".`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Message deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
