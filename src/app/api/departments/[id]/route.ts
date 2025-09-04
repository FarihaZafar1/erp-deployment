import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getAuthUser } from '@/lib/auth';
import { updateDepartmentSchema } from '@/lib/validation';

const prisma = new PrismaClient();

// GET - Fetch single department
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const department = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        manager: {
          select: {
            name: true,
            email: true
          }
        },
        employees: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            position: true
          }
        },
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    if (!department) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    const transformedDepartment = {
      id: department.id,
      name: department.name,
      description: department.description,
      manager: department.manager?.name || 'No Manager',
      managerEmail: department.managerEmail,
      employeeCount: department._count.employees,
      location: department.location,
      budget: department.budget,
      status: department.status,
      establishedDate: department.establishedDate?.toISOString().split('T')[0] || '',
      employees: department.employees
    };

    return NextResponse.json(transformedDepartment);
  } catch (error) {
    console.error('Error fetching department:', error);
    return NextResponse.json(
      { error: 'Failed to fetch department' },
      { status: 500 }
    );
  }
}

// PUT - Update department
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || !['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const validation = updateDepartmentSchema.safeParse(body);

    if (!validation.success) {
        return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { name, description, managerEmail, budget, location, status, establishedDate } = validation.data;

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id }
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Find manager by email if provided
    let managerId = existingDepartment.managerId;
    if (managerEmail && managerEmail !== existingDepartment.managerEmail) {
      const manager = await prisma.user.findUnique({
        where: { email: managerEmail }
      });

      if (!manager) {
        return NextResponse.json(
          { error: 'Manager not found with provided email' },
          { status: 404 }
        );
      }
      managerId = manager.id;
    }

    const department = await prisma.department.update({
      where: { id: params.id },
      data: {
        name: name || existingDepartment.name,
        description: description || existingDepartment.description,
        managerId,
        managerEmail: managerEmail || existingDepartment.managerEmail,
        budget: budget,
        location: location || existingDepartment.location,
        status: status || existingDepartment.status,
        establishedDate: establishedDate ? new Date(establishedDate) : existingDepartment.establishedDate
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

    const transformedDepartment = {
      id: department.id,
      name: department.name,
      description: department.description,
      manager: department.manager?.name || 'No Manager',
      managerEmail: department.managerEmail,
      employeeCount: department._count.employees,
      location: department.location,
      budget: department.budget,
      status: department.status,
      establishedDate: department.establishedDate?.toISOString().split('T')[0] || ''
    };

    return NextResponse.json(transformedDepartment);
  } catch (error) {
    console.error('Error updating department:', error);
    return NextResponse.json(
      { error: 'Failed to update department' },
      { status: 500 }
    );
  }
}

// DELETE - Delete department
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request);
    if (!authUser || !['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if department exists
    const existingDepartment = await prisma.department.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    if (!existingDepartment) {
      return NextResponse.json(
        { error: 'Department not found' },
        { status: 404 }
      );
    }

    // Check if department has employees
    if (existingDepartment._count.employees > 0) {
      return NextResponse.json(
        { error: 'Cannot delete department with existing employees' },
        { status: 400 }
      );
    }

    await prisma.department.delete({
      where: { id: params.id }
    });

    return NextResponse.json(
      { message: 'Department deleted successfully' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error deleting department:', error);
    return NextResponse.json(
      { error: 'Failed to delete department' },
      { status: 500 }
    );
  }
}