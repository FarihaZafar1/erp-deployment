import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

// GET - Fetch all users (Admin only)
export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    // Get all users with their employee data
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
        updatedAt: true,
        employee: {
          select: {
            id: true,
            position: true,
            department: {
              select: {
                id: true,
                name: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform data for frontend
    const transformedUsers = users.map(user => ({
      id: user.id,
      name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || 'Unknown User',
      email: user.email,
      role: user.role === 'ADMIN' ? 'Administrator' : user.employee?.position || 'Employee',
      status: 'Active', // You can add a status field to User model if needed
      lastLogin: user.updatedAt,
      department: user.employee?.department?.name || 'Unassigned'
    }));

    return NextResponse.json({ users: transformedUsers });
  } catch (error) {
    console.error('Users fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 }
    );
  }
}

// POST - Create new user (Admin only)
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    const currentUser = await prisma.user.findUnique({
      where: { clerkId: user.id },
      select: { role: true }
    });

    if (!currentUser || currentUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Admin access required' }, { status: 403 });
    }

    const body = await request.json();
    const { email, firstName, lastName, role, departmentId, position } = body;

    // Create user (Note: In real app, you'd use Clerk API to create user)
    const newUser = await prisma.user.create({
      data: {
        clerkId: `temp_${Date.now()}`, // Temporary ID
        email,
        firstName,
        lastName,
        role: role || 'EMPLOYEE'
      }
    });

    // Create employee record if department and position provided
    if (departmentId && position) {
      await prisma.employee.create({
        data: {
          firstName,
          lastName,
          email,
          position,
          departmentId,
          userId: newUser.id
        }
      });
    }

    return NextResponse.json({
      message: 'User created successfully',
      user: newUser
    });
  } catch (error) {
    console.error('User creation error:', error);
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 }
    );
  }
}