import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const songs = await prisma.song.findMany({
      orderBy: { createdAt: 'asc' },
    });
    return NextResponse.json({ songs });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
