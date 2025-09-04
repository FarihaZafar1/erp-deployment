import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '100')
    const search = searchParams.get('search') || ''
    const department = searchParams.get('department') || ''
    const status = searchParams.get('status') || ''

    const where: any = {}

    if (authUser.role === 'EMPLOYEE') {
      where.userId = authUser.userId
    } else if (!['ADMIN', 'HR'].includes(authUser.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { employeeId: { contains: search, mode: 'insensitive' } }
      ]
    }
    
    if (department && department !== 'All') {
      where.department = {
        name: department
      }
    }
    
    if (status) {
      where.status = status
    }

    const [employees, total] = await Promise.all([
      prisma.employee.findMany({
        where,
        skip: (page - 1) * limit,
        take: limit,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
              avatar: true
            }
          },
          department: {
            select: {
              id: true,
              name: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      }),
      prisma.employee.count({ where })
    ])

    return NextResponse.json({
      employees,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get employees error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to update employees
    if (!['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      id,
      firstName,
      lastName,
      email,
      phone,
      address,
      position,
      department,
      salary,
      status,
      emergencyContact
    } = body

    // Validate required fields
    if (!id || !firstName || !lastName || !email || !position) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Find or create department if provided
    let departmentRecord = null
    if (department) {
      departmentRecord = await prisma.department.findFirst({
        where: { name: department }
      })

      if (!departmentRecord) {
        departmentRecord = await prisma.department.create({
          data: {
            name: department,
            description: `${department} Department`
          }
        })
      }
    }

    // Update employee
    const updatedEmployee = await prisma.employee.update({
      where: { id },
      data: {
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        position,
        departmentId: departmentRecord?.id || null,
        salary: salary ? parseFloat(salary.toString()) : existingEmployee.salary,
        status: status || existingEmployee.status,
        emergencyContact: emergencyContact || null,
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(updatedEmployee, { status: 200 })
  } catch (error) {
    console.error('Update employee error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to delete employees
    if (!['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Employee ID is required' },
        { status: 400 }
      )
    }

    // Check if employee exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { id }
    })

    if (!existingEmployee) {
      return NextResponse.json(
        { error: 'Employee not found' },
        { status: 404 }
      )
    }

    // Delete employee
    await prisma.employee.delete({
      where: { id }
    })

    return NextResponse.json(
      { message: 'Employee deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete employee error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user has permission to create employees
    if (!['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      position,
      department,
      salary,
      hireDate,
      emergencyContact
    } = body

    // Validate required fields
    if (!firstName || !lastName || !email || !position || !department) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingEmployee = await prisma.employee.findUnique({
      where: { email }
    })

    if (existingEmployee) {
      return NextResponse.json(
        { error: 'Employee with this email already exists' },
        { status: 400 }
      )
    }

    // Find or create department
    let departmentRecord = await prisma.department.findFirst({
      where: { name: department }
    })

    if (!departmentRecord) {
      departmentRecord = await prisma.department.create({
        data: {
          name: department,
          description: `${department} Department`
        }
      })
    }

    // Generate employee ID
    const employeeCount = await prisma.employee.count()
    const employeeId = `EMP${String(employeeCount + 1).padStart(4, '0')}`

    // Create employee
    const employee = await prisma.employee.create({
      data: {
        userId: authUser.userId, // Add required userId field
        employeeId,
        firstName,
        lastName,
        email,
        phone: phone || null,
        address: address || null,
        position,
        departmentId: departmentRecord.id,
        salary: salary ? parseFloat(salary.toString()) : 0,
        hireDate: hireDate ? new Date(hireDate) : new Date(),
        emergencyContact: emergencyContact || null,
        status: 'ACTIVE'
      },
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })

    return NextResponse.json(employee, { status: 201 })
  } catch (error) {
    console.error('Create employee error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Internal server error'
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    )
  }
}