import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser, hashPassword } from '@/lib/auth'
import { createEmployeeSchema } from '@/lib/validation'

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || !['ADMIN', 'HR'].includes(authUser.role)) {
      return new NextResponse(JSON.stringify({ error: 'Unauthorized: Only Admin or HR can add employees' }), {
        status: 401,
        headers: { 'WWW-Authenticate': 'Bearer realm=""' }
      })
    }

    const body = await request.json()
    const validation = createEmployeeSchema.safeParse(body)

    if (!validation.success) {
        return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { firstName, lastName, email, phone, address, position, department, salary, hireDate, emergencyContact } = validation.data

    // Find department by name
    const dept = await prisma.department.findFirst({
      where: { name: department }
    })

    if (!dept) {
      return NextResponse.json(
        { error: `Department '${department}' not found` },
        { status: 400 }
      )
    }

    // Generate employee ID
    const employeeCount = await prisma.employee.count()
    const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`

    const employee = await prisma.employee.create({
      data: {
        employeeId,
        firstName,
        lastName,
        email,
        phone,
        address,
        position,
        departmentId: dept.id,
        salary,
        hireDate: new Date(hireDate),
        emergencyContact,
        user: {
          create: {
            name: `${firstName} ${lastName}`,
            email,
            password: await hashPassword('password123'), // Default password
            role: 'EMPLOYEE'
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        },
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error: any) {
    console.error('Create employee error:', error)
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error', details: error.message || 'Unknown error' },
      { status: 500 }
    )
  }
}
