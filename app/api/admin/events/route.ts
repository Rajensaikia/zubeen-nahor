import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const events = await prisma.event.findMany({
      include: {
        organiser: {
          select: {
            id: true,
            displayName: true,
            username: true,
          },
        },
        registrations: {
          include: {
            user: {
              select: {
                id: true,
                displayName: true,
                username: true,
                email: true,
              },
            },
          },
        },
      },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ events });
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

    const { title, description, date, location, district, imageUrl } = await req.json();
    if (!title || !description || !date || !location || !district) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const event = await prisma.event.create({
      data: {
        title,
        description,
        date: new Date(date),
        location,
        district,
        imageUrl: imageUrl || null,
        organiserId: admin.id,
      },
    });

    // Create admin log
    await prisma.adminLog.create({
      data: {
        action: 'CREATE_EVENT',
        details: `Created new community event: "${title}" (Scheduled: ${new Date(date).toLocaleDateString()}).`,
        adminId: admin.id,
      },
    });

    // Notify all users of the new event
    const users = await prisma.user.findMany({ select: { id: true } });
    if (users.length > 0) {
      await prisma.notification.createMany({
        data: users.map((u) => ({
          type: 'EVENT',
          content: `New tree plantation drive scheduled: "${title}" in ${district} on ${new Date(date).toLocaleDateString()}. Join now!`,
          userId: u.id,
        })),
      });
    }

    return NextResponse.json({ message: 'Event created successfully', event });
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

    const { eventId, userId, action } = await req.json();
    if (!eventId || !userId || !action) {
      return NextResponse.json({ error: 'Event ID, User ID, and action are required' }, { status: 400 });
    }

    if (action === 'REGISTER') {
      const existing = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: { eventId, userId },
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'User is already registered for this event' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.eventRegistration.create({
          data: { eventId, userId },
        });

        await tx.event.update({
          where: { id: eventId },
          data: { attendeesCount: { increment: 1 } },
        });
      });

      return NextResponse.json({ message: 'User registered successfully' });
    } else if (action === 'CANCEL') {
      await prisma.$transaction(async (tx) => {
        await tx.eventRegistration.delete({
          where: {
            eventId_userId: { eventId, userId },
          },
        });

        await tx.event.update({
          where: { id: eventId },
          data: { attendeesCount: { decrement: 1 } },
        });
      });

      return NextResponse.json({ message: 'Registration cancelled successfully' });
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
    const eventId = searchParams.get('eventId');
    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    await prisma.event.delete({
      where: { id: eventId },
    });

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_EVENT',
        details: `Cancelled and deleted event: "${event.title}" scheduled for ${new Date(event.date).toLocaleDateString()}.`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Event deleted successfully' });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
