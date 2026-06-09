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
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    await prisma.group.delete({
      where: { id: groupId },
    });

    // Create admin action log
    await prisma.adminLog.create({
      data: {
        action: 'DELETE_GROUP',
        details: `Deleted community group: "${group.name}" (Type: ${group.type}).`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Group deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { groupId, pastWorks, memories, nextPlan, mediaUrls } = await req.json();

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const existingGroup = await prisma.group.findUnique({ where: { id: groupId } });
    if (!existingGroup) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const group = await prisma.group.update({
      where: { id: groupId },
      data: {
        pastWorks: pastWorks !== undefined ? pastWorks : null,
        memories: memories !== undefined ? memories : null,
        nextPlan: nextPlan !== undefined ? nextPlan : null,
        mediaUrls: mediaUrls !== undefined ? mediaUrls : null,
      },
    });

    await prisma.adminLog.create({
      data: {
        action: 'UPDATE_GROUP_DETAILS',
        details: `Updated highlights and memory details for community group: "${group.name}".`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Group details updated successfully', group });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

