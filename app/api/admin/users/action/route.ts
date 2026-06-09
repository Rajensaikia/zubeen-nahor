import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, action, displayName, email } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (action === 'SUSPEND') {
      const nextSuspend = !targetUser.isSuspended;
      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isSuspended: nextSuspend },
      });

      await prisma.adminLog.create({
        data: {
          action: nextSuspend ? 'SUSPEND_USER' : 'UNSUSPEND_USER',
          details: `${nextSuspend ? 'Suspended' : 'Unsuspended'} volunteer account for @${targetUser.username} (${targetUser.email}).`,
          adminId: admin.id,
        },
      });

      return NextResponse.json({ message: 'User suspended status updated', user: updatedUser });
    } else if (action === 'EDIT') {
      if (!displayName && !email) {
        return NextResponse.json({ error: 'Display name or email is required' }, { status: 400 });
      }

      const updatedUser = await prisma.user.update({
        where: { id: userId },
        data: {
          displayName: displayName || targetUser.displayName,
          email: email || targetUser.email,
        },
      });

      await prisma.adminLog.create({
        data: {
          action: 'EDIT_USER_DETAILS',
          details: `Edited volunteer profile @${targetUser.username}. Updated Email: ${updatedUser.email}, Display Name: ${updatedUser.displayName}`,
          adminId: admin.id,
        },
      });

      return NextResponse.json({ message: 'User updated successfully', user: updatedUser });
    } else {
      return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }
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
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    if (userId === admin.id) {
      return NextResponse.json({ error: 'You cannot delete yourself' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await prisma.user.delete({
      where: { id: userId },
    });

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_USER',
        details: `Permanently deleted user account for @${targetUser.username} (${targetUser.email}).`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
