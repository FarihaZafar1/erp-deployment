import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { createPayrollSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')
    const month = searchParams.get('month')
    const year = searchParams.get('year')
    const status = searchParams.get('status')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')

    const where: any = {}

    if (authUser.role === 'EMPLOYEE') {
      where.userId = authUser.userId
    } else if (userId) {
      where.userId = userId
    } else if (!['ADMIN', 'HR'].includes(authUser.role)) {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
    
    if (month) where.month = parseInt(month)
    if (year) where.year = parseInt(year)
    if (status) where.status = status

    const skip = (page - 1) * limit

    const [payroll, total] = await Promise.all([
      prisma.payroll.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeProfile: {
                select: {
                  employeeId: true,
                  department: {
                    select: {
                      name: true
                    }
                  },
                  position: true
                }
              }
            }
          }
        },
        orderBy: [{ year: 'desc' }, { month: 'desc' }],
        skip,
        take: limit
      }),
      prisma.payroll.count({ where })
    ])

    return NextResponse.json({
      data: payroll,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Get payroll error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || !['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    console.log('Received payroll data:', body)
    
    const validation = createPayrollSchema.safeParse(body)

    if (!validation.success) {
        console.log('Validation error:', validation.error.format())
        const errorMessage = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
        return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { userId, month, year, basicSalary, allowances, deductions, status } = validation.data
    
    // Verify user exists and get employee data
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        employeeProfile: {
          select: {
            salary: true,
            position: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    console.log('Found user:', user)

    // Use employee's base salary if not provided, otherwise use provided basicSalary
    const finalBasicSalary = basicSalary || user.employeeProfile?.salary || 0
    const finalAllowances = allowances || 0
    const finalDeductions = deductions || 0
    const finalStatus = status || 'PENDING'
    
    // Calculate net salary
    const netSalary = finalBasicSalary + finalAllowances - finalDeductions

    // Check for existing payroll
    const existingPayroll = await prisma.payroll.findFirst({
      where: {
        userId,
        month,
        year
      }
    })

    if (existingPayroll) {
      return NextResponse.json(
        { error: 'Payroll for this month already exists' },
        { status: 409 }
      )
    }

    console.log('Creating payroll with data:', {
      userId,
      month,
      year,
      basicSalary: finalBasicSalary,
      allowances: finalAllowances,
      deductions: finalDeductions,
      netSalary,
      status: finalStatus
    })

    const payroll = await prisma.payroll.create({
      data: {
        userId,
        month,
        year,
        basicSalary: finalBasicSalary,
        allowances: finalAllowances,
        deductions: finalDeductions,
        netSalary,
        status: finalStatus
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeProfile: {
              select: {
                employeeId: true,
                department: {
                  select: {
                    name: true
                  }
                },
                position: true
              }
            }
          }
        }
      }
    })

    console.log('Payroll created successfully:', payroll)
    return NextResponse.json(payroll, { status: 201 })
  } catch (error) {
    console.error('Create payroll error:', error)
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    )
  }
}