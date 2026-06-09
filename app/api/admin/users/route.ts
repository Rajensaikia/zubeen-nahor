import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function PATCH(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { userId, action } = await req.json();
    if (!userId || !action) {
      return NextResponse.json({ error: 'User ID and action are required' }, { status: 400 });
    }

    const targetUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!targetUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Prevent administrators from removing their own admin status to avoid self-lockout
    if (targetUser.id === admin.id && action === 'TOGGLE_ROLE') {
      return NextResponse.json({ error: 'You cannot change your own role' }, { status: 400 });
    }

    let updatedUser;
    if (action === 'TOGGLE_VERIFY') {
      const nextVerify = !targetUser.isVerified;
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { isVerified: nextVerify },
      });

      // Create admin action log
      await prisma.adminLog.create({
        data: {
          action: 'TOGGLE_USER_VERIFICATION',
          details: `${nextVerify ? 'Verified' : 'Unverified'} volunteer account for @${targetUser.username} (${targetUser.email}).`,
          adminId: admin.id,
        },
      });

      // Send in-app notification to the volunteer
      await prisma.notification.create({
        data: {
          type: 'APPROVAL',
          content: `Your volunteer account status has been updated. You are now ${nextVerify ? 'Verified' : 'Unverified'}.`,
          userId: targetUser.id,
        },
      });
    } else if (action === 'TOGGLE_ROLE') {
      const nextRole = targetUser.role === 'ADMIN' ? 'USER' : 'ADMIN';
      updatedUser = await prisma.user.update({
        where: { id: userId },
        data: { role: nextRole },
      });

      // Create admin action log
      await prisma.adminLog.create({
        data: {
          action: 'TOGGLE_USER_ROLE',
          details: `Promoted/demoted @${targetUser.username} (${targetUser.email}) to role: ${nextRole}.`,
          adminId: admin.id,
        },
      });

      // Send in-app notification to the volunteer
      await prisma.notification.create({
        data: {
          type: 'APPROVAL',
          content: `Your profile access role was updated to ${nextRole} by an administrator.`,
          userId: targetUser.id,
        },
      });
    } else {
      return NextResponse.json({ error: 'Invalid action specified' }, { status: 400 });
    }

    return NextResponse.json({
      message: 'User status updated successfully',
      user: {
        id: updatedUser.id,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
