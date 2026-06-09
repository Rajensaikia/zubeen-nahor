import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

// 1. GET: Fetch posts with sorting
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const sort = searchParams.get('sort') || 'latest';
    const district = searchParams.get('district') || '';
    const userId = searchParams.get('userId') || '';

    let orderBy: any = { createdAt: 'desc' };
    if (sort === 'popular') {
      orderBy = { likesCount: 'desc' };
    }

    const whereClause: any = {};
    if (district) {
      whereClause.district = district;
    }
    if (userId) {
      whereClause.userId = userId;
    }

    // In trending, we can filter for posts that have treeCount > 10
    if (sort === 'trending') {
      whereClause.treeCount = { gte: 10 };
    }

    const posts = await prisma.post.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            username: true,
            displayName: true,
            avatarUrl: true,
            isVerified: true,
          },
        },
        likes: {
          select: {
            userId: true,
          },
        },
        comments: {
          include: {
            user: {
              select: {
                id: true,
                username: true,
                displayName: true,
                avatarUrl: true,
              },
            },
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
      orderBy,
    });

    return NextResponse.json({ posts });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}

// 2. POST: Create a new post and optionally a plantation verification record
export async function POST(req: Request) {
  try {
    const authenticatedUser = await getAuthenticatedUser(req);
    if (!authenticatedUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    const {
      caption,
      imageUrl,
      videoUrl,
      location,
      district,
      village,
      treeCount,
      species,
      name,
      mobile,
      notes,
      date,
    } = body;

    const count = parseInt(treeCount) || 0;

    // Create the social post
    const post = await prisma.post.create({
      data: {
        caption,
        imageUrl,
        videoUrl,
        location,
        district,
        species,
        treeCount: count,
        userId: authenticatedUser.id,
        // If there's a treeCount, status starts as PENDING until approved.
        // If it's a simple social post with no trees, it's APPROVED/visible immediately.
        status: count > 0 ? 'PENDING' : 'APPROVED',
      },
    });

    // If trees were planted, also create a PlantationRecord for the admin verification panel
    if (count > 0) {
      await prisma.plantationRecord.create({
        data: {
          name: name || authenticatedUser.displayName,
          mobile: mobile || 'N/A',
          district: district || 'N/A',
          village: village || 'N/A',
          location: location || 'N/A',
          treeCount: count,
          species: species || 'N/A',
          date: date ? new Date(date) : new Date(),
          imageUrl: imageUrl || null,
          notes: notes || caption || null,
          status: 'PENDING',
          userId: authenticatedUser.id,
        },
      });
    }

    return NextResponse.json({ message: 'Post created successfully', post });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
