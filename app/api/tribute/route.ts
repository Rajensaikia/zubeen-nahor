import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const milestones = await prisma.timelineMilestone.findMany({
      orderBy: { year: 'asc' },
    });
    
    const quotes = await prisma.songQuote.findMany({
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ milestones, quotes });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
