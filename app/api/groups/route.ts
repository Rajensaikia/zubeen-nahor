import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const groupId = searchParams.get('groupId');
    const authUser = await getAuthenticatedUser(req);

    if (groupId) {
      const group = await prisma.group.findUnique({
        where: { id: groupId },
        include: {
          creator: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
        },
      });

      if (!group) {
        return NextResponse.json({ error: 'Group not found' }, { status: 404 });
      }

      // Check if user is a member of the group
      let isMember = false;
      if (authUser) {
        const membership = await prisma.groupMember.findUnique({
          where: {
            groupId_userId: {
              groupId: groupId,
              userId: authUser.id,
            },
          },
        });
        if (membership || group.creatorId === authUser.id) {
          isMember = true;
        }
      }

      if (isMember) {
        const members = await prisma.groupMember.findMany({
          where: { groupId },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        const messages = await prisma.groupMessage.findMany({
          where: { groupId },
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: { createdAt: 'asc' },
        });

        return NextResponse.json({
          group,
          isMember: true,
          members: members.map((m) => ({
            id: m.user.id,
            displayName: m.user.displayName,
            username: m.user.username,
            avatarUrl: m.user.avatarUrl,
            groupRole: m.role,
          })),
          messages,
        });
      } else {
        return NextResponse.json({
          group,
          isMember: false,
        });
      }
    }

    const groups = await prisma.group.findMany({
      include: {
        creator: {
          select: {
            displayName: true,
            username: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    // If logged in, also return the list of group IDs the user has joined
    let joinedGroupIds: string[] = [];
    if (authUser) {
      const memberships = await prisma.groupMember.findMany({
        where: { userId: authUser.id },
        select: { groupId: true },
      });
      joinedGroupIds = memberships.map((m) => m.groupId);
    }

    return NextResponse.json({ groups, joinedGroupIds });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { name, description, type, imageUrl } = await req.json();
    if (!name || !description || !type) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const group = await prisma.$transaction(async (tx) => {
      const newGroup = await tx.group.create({
        data: {
          name,
          description,
          type,
          imageUrl: imageUrl || null,
          creatorId: user.id,
          membersCount: 1,
        },
      });

      await tx.groupMember.create({
        data: {
          groupId: newGroup.id,
          userId: user.id,
          role: 'ADMIN',
        },
      });

      return newGroup;
    });

    return NextResponse.json({ message: 'Group created successfully', group });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, action, targetUserId } = body;
    if (!groupId || !action) {
      return NextResponse.json({ error: 'Group ID and action are required' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId },
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    if (action === 'TOGGLE_ADMIN_ROLE') {
      if (!targetUserId) {
        return NextResponse.json({ error: 'Target User ID is required' }, { status: 400 });
      }

      if (group.creatorId !== user.id) {
        return NextResponse.json({ error: 'Only the group creator can manage admin roles' }, { status: 403 });
      }

      const membership = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId, userId: targetUserId }
        }
      });

      if (!membership) {
        return NextResponse.json({ error: 'Target user is not a member of this group' }, { status: 404 });
      }

      const newRole = membership.role === 'ADMIN' ? 'MEMBER' : 'ADMIN';
      await prisma.groupMember.update({
        where: {
          groupId_userId: { groupId, userId: targetUserId }
        },
        data: { role: newRole }
      });

      return NextResponse.json({ message: `Role updated to ${newRole}`, role: newRole });
    } else if (action === 'JOIN') {
      const existing = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId, userId: user.id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'User is already a member' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.groupMember.create({
          data: { groupId, userId: user.id },
        });

        await tx.group.update({
          where: { id: groupId },
          data: { membersCount: { increment: 1 } },
        });
      });

      return NextResponse.json({ message: 'Joined group successfully' });
    } else if (action === 'LEAVE') {
      const existing = await prisma.groupMember.findUnique({
        where: {
          groupId_userId: { groupId, userId: user.id },
        },
      });

      if (!existing) {
        return NextResponse.json({ error: 'User is not a member of this group' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.groupMember.delete({
          where: {
            groupId_userId: { groupId, userId: user.id },
          },
        });

        await tx.group.update({
          where: { id: groupId },
          data: { membersCount: { decrement: 1 } },
        });
      });

      return NextResponse.json({ message: 'Left group successfully' });
    } else {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const { groupId, name, description, type, imageUrl, pastWorks, memories, nextPlan, mediaUrls } = body;

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const group = await prisma.group.findUnique({
      where: { id: groupId }
    });

    if (!group) {
      return NextResponse.json({ error: 'Group not found' }, { status: 404 });
    }

    const isCreator = group.creatorId === user.id;

    if (!isCreator) {
      return NextResponse.json({ error: 'Forbidden: Only group creator can edit group details' }, { status: 403 });
    }

    const updatedGroup = await prisma.group.update({
      where: { id: groupId },
      data: {
        name: name !== undefined ? name : group.name,
        description: description !== undefined ? description : group.description,
        type: type !== undefined ? type : group.type,
        imageUrl: imageUrl !== undefined ? imageUrl : group.imageUrl,
        pastWorks: pastWorks !== undefined ? pastWorks : group.pastWorks,
        memories: memories !== undefined ? memories : group.memories,
        nextPlan: nextPlan !== undefined ? nextPlan : group.nextPlan,
        mediaUrls: mediaUrls !== undefined ? mediaUrls : group.mediaUrls,
      }
    });

    return NextResponse.json({ message: 'Group updated successfully', group: updatedGroup });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
