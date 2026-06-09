import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const announcements = await prisma.eventMessage.findMany({
      where: { eventId },
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
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ announcements });
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

    const { eventId, content } = await req.json();
    if (!eventId || !content) {
      return NextResponse.json({ error: 'Event ID and content are required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify user is the organiser of the event
    if (event.organiserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the event organiser can send announcements' }, { status: 403 });
    }

    // Create the message/announcement
    const announcement = await prisma.eventMessage.create({
      data: {
        eventId,
        userId: user.id,
        content,
      },
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
    });

    // Notify all other registered users
    const attendees = await prisma.eventRegistration.findMany({
      where: {
        eventId,
        NOT: { userId: user.id },
      },
      select: { userId: true },
    });

    if (attendees.length > 0) {
      await prisma.notification.createMany({
        data: attendees.map((att) => ({
          type: 'EVENT',
          content: `Broadcast from organizer of "${event.title}": ${content}`,
          userId: att.userId,
          senderId: user.id,
        })),
      });
    }

    return NextResponse.json({ message: 'Announcement posted successfully', announcement });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
