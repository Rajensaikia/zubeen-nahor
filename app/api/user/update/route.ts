import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const user = await getAuthenticatedUser(req);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { displayName, bio, avatarUrl } = await req.json();

    const updatedUser = await prisma.user.update({
      where: { id: user.id },
      data: {
        displayName: displayName || undefined,
        bio: bio ?? undefined,
        avatarUrl: avatarUrl || undefined,
      },
    });

    return NextResponse.json({
      message: 'Profile updated successfully',
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        username: updatedUser.username,
        displayName: updatedUser.displayName,
        bio: updatedUser.bio,
        role: updatedUser.role,
        avatarUrl: updatedUser.avatarUrl,
        totalTrees: updatedUser.totalTrees,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
