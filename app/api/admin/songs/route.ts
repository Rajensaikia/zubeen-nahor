import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const songs = await prisma.song.findMany({
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ songs });
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

    const { title, artist, album, audioUrl, coverUrl, duration } = await req.json();

    if (!title || !audioUrl) {
      return NextResponse.json({ error: 'Title and Audio URL are required' }, { status: 400 });
    }

    const song = await prisma.song.create({
      data: {
        title,
        artist: artist || 'Zubeen Garg',
        album: album || null,
        audioUrl,
        coverUrl: coverUrl || null,
        duration: parseInt(duration) || 0,
      },
    });

    await prisma.adminLog.create({
      data: {
        action: 'CREATE_SONG',
        details: `Added new song: "${title}" by "${artist || 'Zubeen Garg'}"`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Song added successfully', song });
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

    const { id, title, artist, album, audioUrl, coverUrl, duration } = await req.json();

    if (!id || !title || !audioUrl) {
      return NextResponse.json({ error: 'Song ID, Title, and Audio URL are required' }, { status: 400 });
    }

    const existingSong = await prisma.song.findUnique({ where: { id } });
    if (!existingSong) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    const song = await prisma.song.update({
      where: { id },
      data: {
        title,
        artist: artist || 'Zubeen Garg',
        album: album || null,
        audioUrl,
        coverUrl: coverUrl || null,
        duration: parseInt(duration) || 0,
      },
    });

    await prisma.adminLog.create({
      data: {
        action: 'UPDATE_SONG',
        details: `Updated song: "${title}"`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Song updated successfully', song });
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
    const songId = searchParams.get('songId');

    if (!songId) {
      return NextResponse.json({ error: 'Song ID is required' }, { status: 400 });
    }

    const existingSong = await prisma.song.findUnique({ where: { id: songId } });
    if (!existingSong) {
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }

    await prisma.song.delete({ where: { id: songId } });

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_SONG',
        details: `Deleted song: "${existingSong.title}"`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Song deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
