import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';
import { createDepartmentSchema } from '@/lib/validation';

const prisma = new PrismaClient();

// GET - Fetch all departments
export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || 'All';
    const status = searchParams.get('status') || 'All';

    const whereClause: any = {};
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { manager: { name: { contains: search, mode: 'insensitive' } } }
      ];
    }
    
    if (location !== 'All') {
      whereClause.location = location;
    }
    
    if (status !== 'All') {
      whereClause.status = status;
    }

    const departments = await prisma.department.findMany({
      where: whereClause,
      include: {
        manager: {
          select: {
            name: true,
            email: true
          }
        },
        employees: {
          select: {
            id: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Transform the data to match frontend expectations
    const transformedDepartments = departments.map(dept => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      manager: dept.manager?.name || 'No Manager',
      managerEmail: dept.managerEmail || '',
      employeeCount: dept._count.employees,
      location: dept.location,
      budget: dept.budget,
      status: dept.status,
      establishedDate: dept.establishedDate?.toISOString().split('T')[0] || ''
    }));

    return NextResponse.json(transformedDepartments);
  } catch (error) {
    console.error('Error fetching departments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch departments' },
      { status: 500 }
    );
  }
}

// POST - Create new department
export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || !['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = createDepartmentSchema.safeParse(body);

    if (!validation.success) {
        const errorMessages = Object.values(validation.error.flatten().fieldErrors).flat();
        const errorMessage = errorMessages.length > 0 ? errorMessages[0] : 'Validation failed';
        return NextResponse.json({ error: errorMessage }, { status: 400 });
    }

    const { name, description, managerEmail, budget, location, status, establishedDate } = validation.data;

    let managerId = null;
    
    // Only try to find manager if email is provided
    if (managerEmail && managerEmail.trim()) {
      const manager = await prisma.user.findUnique({
        where: { email: managerEmail }
      });
      
      if (manager) {
        managerId = manager.id;
      }
      // Note: We don't throw an error if manager is not found
      // This allows departments to be created without existing managers
    }

    const department = await prisma.department.create({
      data: {
        name,
        description,
        managerId,
        managerEmail,
        budget,
        location,
        status,
        establishedDate: establishedDate ? new Date(establishedDate) : new Date()
      },
      include: {
        manager: {
          select: {
            name: true,
            email: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    // Transform the response
    const transformedDepartment = {
      id: department.id,
      name: department.name,
      description: department.description,
      manager: department.manager?.name || 'No Manager',
      managerEmail: department.managerEmail || '',
      employeeCount: department._count.employees,
      location: department.location,
      budget: department.budget,
      status: department.status,
      establishedDate: department.establishedDate?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json(transformedDepartment, { status: 201 });
  } catch (error) {
    console.error('Error creating department:', error);
    return NextResponse.json(
      { error: 'Failed to create department' },
      { status: 500 }
    );
  }
}