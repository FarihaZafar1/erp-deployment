import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Fetch user settings
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user profile and settings
    const userProfile = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        settings: true
      }
    });

    if (!userProfile) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Get system settings if user is admin
    let systemSettings = null;
    if (userProfile.role === 'ADMIN') {
      systemSettings = {
        totalUsers: await prisma.user.count(),
        totalDepartments: await prisma.department.count(),
        totalEmployees: await prisma.employee.count(),
        totalTasks: await prisma.task.count(),
        systemVersion: '1.0.0',
        lastBackup: new Date().toISOString()
      };
    }

    return NextResponse.json({
      user: userProfile,
      systemSettings
    });
  } catch (error) {
    console.error('Settings fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    );
  }
}

// PUT - Update user settings
export async function PUT(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { firstName, lastName, settings } = body;

    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { clerkId: user.id },
      data: {
        firstName,
        lastName,
        settings: settings || {}
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        settings: true,
        updatedAt: true
      }
    });

    return NextResponse.json({
      message: 'Settings updated successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Settings update error:', error);
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    );
  }
}