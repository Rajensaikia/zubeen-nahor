import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { signToken } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, displayName, avatarUrl } = await req.json();

    if (!email || !displayName) {
      return NextResponse.json(
        { error: 'Email and Name are required' },
        { status: 400 }
      );
    }

    let user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      const baseUsername = displayName.toLowerCase().replace(/[^a-z0-9]/g, '') || 'user';
      const randomSuffix = Math.floor(100 + Math.random() * 900);
      const username = `${baseUsername}${randomSuffix}`;
      
      user = await prisma.user.create({
        data: {
          email,
          username,
          displayName,
          passwordHash: 'GOOGLE_OAUTH_ACCOUNT',
          avatarUrl: avatarUrl || `https://api.dicebear.com/7.x/adventurer/svg?seed=${username}`,
          isVerified: true,
        },
      });
    }

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    const response = NextResponse.json({
      message: 'Google Sign-In simulation successful',
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        displayName: user.displayName,
        role: user.role,
        avatarUrl: user.avatarUrl,
        totalTrees: user.totalTrees,
      },
    });

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
