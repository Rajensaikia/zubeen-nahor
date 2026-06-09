import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const eventId = searchParams.get('eventId');
    const authUser = await getAuthenticatedUser(req);

    if (eventId) {
      const event = await prisma.event.findUnique({
        where: { id: eventId },
        include: {
          organiser: {
            select: {
              id: true,
              displayName: true,
              username: true,
              avatarUrl: true,
            },
          },
          registrations: {
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
          },
          messages: {
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
          },
        },
      });

      if (!event) {
        return NextResponse.json({ error: 'Event not found' }, { status: 404 });
      }

      const isRegistered = authUser
        ? event.registrations.some((r) => r.userId === authUser.id)
        : false;

      return NextResponse.json({ event, isRegistered });
    }

    const events = await prisma.event.findMany({
      include: {
        organiser: {
          select: {
            id: true,
            displayName: true,
            username: true,
            avatarUrl: true,
          },
        },
        registrations: {
          select: {
            userId: true,
          },
        },
      },
      orderBy: { date: 'asc' },
    });

    let registeredEventIds: string[] = [];
    if (authUser) {
      const registrations = await prisma.eventRegistration.findMany({
        where: { userId: authUser.id },
        select: { eventId: true },
      });
      registeredEventIds = registrations.map((r) => r.eventId);
    }

    return NextResponse.json({ events, registeredEventIds });
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
        organiserId: user.id,
        attendeesCount: 1, // Organizer automatically registered
      },
    });

    // Automatically register the creator for the event
    await prisma.eventRegistration.create({
      data: {
        eventId: event.id,
        userId: user.id,
      },
    });

    return NextResponse.json({ message: 'Event scheduled successfully', event });
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

    const { eventId, action } = await req.json();
    if (!eventId || !action) {
      return NextResponse.json({ error: 'Event ID and action are required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    if (action === 'JOIN') {
      const existing = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: { eventId, userId: user.id },
        },
      });

      if (existing) {
        return NextResponse.json({ error: 'User is already registered for this event' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.eventRegistration.create({
          data: { eventId, userId: user.id },
        });

        await tx.event.update({
          where: { id: eventId },
          data: { attendeesCount: { increment: 1 } },
        });
      });

      return NextResponse.json({ message: 'Registered for event successfully' });
    } else if (action === 'LEAVE') {
      const existing = await prisma.eventRegistration.findUnique({
        where: {
          eventId_userId: { eventId, userId: user.id },
        },
      });

      if (!existing) {
        return NextResponse.json({ error: 'User is not registered for this event' }, { status: 400 });
      }

      await prisma.$transaction(async (tx) => {
        await tx.eventRegistration.delete({
          where: {
            eventId_userId: { eventId, userId: user.id },
          },
        });

        await tx.event.update({
          where: { id: eventId },
          data: { attendeesCount: { decrement: 1 } },
        });
      });

      return NextResponse.json({ message: 'Cancelled registration successfully' });
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

    const {
      eventId,
      title,
      description,
      date,
      location,
      district,
      imageUrl,
      chiefGuest,
      treesPlanted,
      status,
      schedule,
      documents,
      memories,
      mediaUrls,
    } = await req.json();

    if (!eventId) {
      return NextResponse.json({ error: 'Event ID is required' }, { status: 400 });
    }

    const event = await prisma.event.findUnique({
      where: { id: eventId },
    });

    if (!event) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }

    // Verify ownership: must be organiser (creator)
    if (event.organiserId !== user.id) {
      return NextResponse.json({ error: 'Forbidden: Only the drive creator can edit its details' }, { status: 403 });
    }

    const updatedEvent = await prisma.event.update({
      where: { id: eventId },
      data: {
        title: title !== undefined ? title : event.title,
        description: description !== undefined ? description : event.description,
        date: date !== undefined ? new Date(date) : event.date,
        location: location !== undefined ? location : event.location,
        district: district !== undefined ? district : event.district,
        imageUrl: imageUrl !== undefined ? imageUrl : event.imageUrl,
        chiefGuest: chiefGuest !== undefined ? chiefGuest : event.chiefGuest,
        treesPlanted: treesPlanted !== undefined ? parseInt(treesPlanted) || 0 : event.treesPlanted,
        status: status !== undefined ? status : event.status,
        schedule: schedule !== undefined ? schedule : event.schedule,
        documents: documents !== undefined ? documents : event.documents,
        memories: memories !== undefined ? memories : event.memories,
        mediaUrls: mediaUrls !== undefined ? mediaUrls : event.mediaUrls,
      },
    });

    return NextResponse.json({ message: 'Event updated successfully', event: updatedEvent });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
