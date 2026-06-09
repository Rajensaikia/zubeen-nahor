import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const quotes = await prisma.songQuote.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ quotes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { title, lyric, meaning } = await req.json();

    if (!title || !lyric || !meaning) {
      return NextResponse.json({ error: 'Song Title, Lyric, and Meaning are required' }, { status: 400 });
    }

    const quote = await prisma.songQuote.create({
      data: { title, lyric, meaning },
    });

    await prisma.adminLog.create({
      data: {
        action: 'CREATE_SONG_QUOTE',
        details: `Added new song quote: "${title}"`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Song quote added successfully', quote });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { id, title, lyric, meaning } = await req.json();

    if (!id || !title || !lyric || !meaning) {
      return NextResponse.json({ error: 'Quote ID, Song Title, Lyric, and Meaning are required' }, { status: 400 });
    }

    const existing = await prisma.songQuote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Song quote not found' }, { status: 404 });
    }

    const quote = await prisma.songQuote.update({
      where: { id },
      data: { title, lyric, meaning },
    });

    await prisma.adminLog.create({
      data: {
        action: 'UPDATE_SONG_QUOTE',
        details: `Updated song quote: "${title}"`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Song quote updated successfully', quote });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const id = searchParams.get('quoteId');

    if (!id) {
      return NextResponse.json({ error: 'Quote ID is required' }, { status: 400 });
    }

    const existing = await prisma.songQuote.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Song quote not found' }, { status: 404 });
    }

    await prisma.songQuote.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_SONG_QUOTE',
        details: `Deleted song quote: "${existing.title}"`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Song quote deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
