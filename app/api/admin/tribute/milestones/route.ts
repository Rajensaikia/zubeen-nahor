import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function GET(req: Request) {
  try {
    const admin = await getAuthenticatedUser(req);
    if (!admin || admin.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const milestones = await prisma.timelineMilestone.findMany({
      orderBy: { year: 'asc' },
    });

    return NextResponse.json({ milestones });
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

    const { year, title, description } = await req.json();

    if (!year || !title || !description) {
      return NextResponse.json({ error: 'Year, Title, and Description are required' }, { status: 400 });
    }

    const milestone = await prisma.timelineMilestone.create({
      data: { year, title, description },
    });

    await prisma.adminLog.create({
      data: {
        action: 'CREATE_MILESTONE',
        details: `Added new timeline milestone: "${title}" (${year})`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Milestone added successfully', milestone });
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

    const { id, year, title, description } = await req.json();

    if (!id || !year || !title || !description) {
      return NextResponse.json({ error: 'Milestone ID, Year, Title, and Description are required' }, { status: 400 });
    }

    const existing = await prisma.timelineMilestone.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    const milestone = await prisma.timelineMilestone.update({
      where: { id },
      data: { year, title, description },
    });

    await prisma.adminLog.create({
      data: {
        action: 'UPDATE_MILESTONE',
        details: `Updated timeline milestone: "${title}" (${year})`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Milestone updated successfully', milestone });
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
    const id = searchParams.get('milestoneId');

    if (!id) {
      return NextResponse.json({ error: 'Milestone ID is required' }, { status: 400 });
    }

    const existing = await prisma.timelineMilestone.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Milestone not found' }, { status: 404 });
    }

    await prisma.timelineMilestone.delete({ where: { id } });

    await prisma.adminLog.create({
      data: {
        action: 'DELETE_MILESTONE',
        details: `Deleted timeline milestone: "${existing.title}"`,
        adminId: admin.id,
      },
    });

    return NextResponse.json({ message: 'Milestone deleted successfully' });
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
