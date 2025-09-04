import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { updateAttendanceSchema } from '@/lib/validation'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const attendance = await prisma.attendance.findUnique({
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
                department: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        }
      }
    })

    if (!attendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    // Check permissions
    if (authUser.role === 'EMPLOYEE' && attendance.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    return NextResponse.json(attendance)
  } catch (error) {
    console.error('Get attendance by ID error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validation = updateAttendanceSchema.safeParse(body)
    
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    // Check if record exists and user has permission
    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: params.id }
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    if (authUser.role === 'EMPLOYEE' && existingAttendance.userId !== authUser.userId) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const updated = await prisma.attendance.update({
      where: { id: params.id },
      data: validation.data,
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
                }
              }
            }
          }
        }
      }
    })

    return NextResponse.json(updated)
  } catch (error) {
    console.error('Update attendance by ID error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Only admins and HR can delete attendance records
    if (!['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: { id: params.id }
    })

    if (!existingAttendance) {
      return NextResponse.json({ error: 'Attendance record not found' }, { status: 404 })
    }

    await prisma.attendance.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Attendance record deleted successfully' })
  } catch (error) {
    console.error('Delete attendance by ID error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}