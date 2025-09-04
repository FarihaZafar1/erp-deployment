import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { updatePayrollSchema } from '@/lib/validation'

// GET - Get individual payroll record
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payroll = await prisma.payroll.findUnique({
      where: { id: params.id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeProfile: {
              select: {
                employeeId: true,
                department: true,
                position: true
              }
            }
          }
        }
      }
    })

    if (!payroll) {
      return NextResponse.json({ error: 'Payroll record not found' }, { status: 404 })
    }

    // Check authorization - employees can only view their own payroll
    if (authUser.role === 'EMPLOYEE' && payroll.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    } else if (!['ADMIN', 'HR', 'EMPLOYEE'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    return NextResponse.json(payroll)
  } catch (error) {
    console.error('Get payroll error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// PUT - Update payroll record
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getAuthUser(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updatePayrollSchema.safeParse(body)

    if (!validation.success) {
      const errorMessage = validation.error.issues.map(issue => `${issue.path.join('.')}: ${issue.message}`).join(', ')
      return NextResponse.json({ error: errorMessage }, { status: 400 })
    }

    const { userId, month, year, basicSalary, allowances, deductions, status } = validation.data

    // Check if payroll record exists
    const existingPayroll = await prisma.payroll.findUnique({
      where: { id: params.id }
    })

    if (!existingPayroll) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      )
    }

    // Check for duplicate only if userId, month, or year are actually being changed
    const newUserId = userId || existingPayroll.userId
    const newMonth = month !== undefined ? Number(month) : existingPayroll.month
    const newYear = year !== undefined ? Number(year) : existingPayroll.year
    
    const isUserIdChanging = userId && userId !== existingPayroll.userId
    const isMonthChanging = month !== undefined && Number(month) !== existingPayroll.month
    const isYearChanging = year !== undefined && Number(year) !== existingPayroll.year

    if (isUserIdChanging || isMonthChanging || isYearChanging) {
      const duplicatePayroll = await prisma.payroll.findFirst({
        where: {
          userId: newUserId,
          month: newMonth,
          year: newYear,
          id: { not: params.id }
        }
      })

      if (duplicatePayroll) {
        return NextResponse.json(
          { error: 'Payroll for this user and month already exists' },
          { status: 409 }
        )
      }
    }

    // Calculate net salary using existing schema fields
    const finalBasicSalary = basicSalary !== undefined ? basicSalary : existingPayroll.basicSalary
    const finalAllowances = allowances !== undefined ? allowances : existingPayroll.allowances
    const finalDeductions = deductions !== undefined ? deductions : existingPayroll.deductions
    const netSalary = finalBasicSalary + finalAllowances - finalDeductions

    // Update payroll record with only the fields that exist in the schema
    const updateData: any = {
      netSalary
    }

    if (userId !== undefined) updateData.userId = userId
    if (month !== undefined) updateData.month = Number(month)
    if (year !== undefined) updateData.year = Number(year)
    if (basicSalary !== undefined) updateData.basicSalary = basicSalary
    if (allowances !== undefined) updateData.allowances = allowances
    if (deductions !== undefined) updateData.deductions = deductions
    if (status !== undefined) updateData.status = status

    const updatedPayroll = await prisma.payroll.update({
      where: { id: params.id },
      data: updateData,
      include: {
        user: {
          select: {
            name: true,
            email: true,
            employeeProfile: {
              select: {
                employeeId: true,
                position: true,
                department: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updatedPayroll)
  } catch (error) {
    console.error('Error updating payroll:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// DELETE - Delete payroll record
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || !['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if payroll record exists
    const existingPayroll = await prisma.payroll.findUnique({
      where: { id: params.id }
    })

    if (!existingPayroll) {
      return NextResponse.json(
        { error: 'Payroll record not found' },
        { status: 404 }
      )
    }

    // Check if payroll has been paid (optional business logic)
    if (existingPayroll.status === 'PAID') {
      return NextResponse.json(
        { error: 'Cannot delete paid payroll record' },
        { status: 400 }
      )
    }

    await prisma.payroll.delete({
      where: { id: params.id }
    })

    return NextResponse.json(
      { message: 'Payroll record deleted successfully' },
      { status: 200 }
    )
  } catch (error) {
    console.error('Delete payroll error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}