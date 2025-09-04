import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { createAttendanceSchema, updateAttendanceSchema } from '@/lib/validation'

// Helper functions
function formatTime(time: Date | null): string {
  if (!time) return '--'
  return time.toLocaleTimeString('en-US', { 
    hour: '2-digit', 
    minute: '2-digit',
    hour12: true 
  })
}

function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

function calculateWorkHours(checkIn: Date | null, checkOut: Date | null): { workHours: string, overtime: string } {
  if (!checkIn || !checkOut) {
    return { workHours: '--', overtime: '--' }
  }
  
  const diffMs = checkOut.getTime() - checkIn.getTime()
  const diffHours = diffMs / (1000 * 60 * 60)
  
  const standardHours = 8
  const workHours = Math.max(0, diffHours).toFixed(1)
  const overtime = Math.max(0, diffHours - standardHours).toFixed(1)
  
  return {
    workHours: `${workHours}h`,
    overtime: overtime === '0.0' ? '--' : `${overtime}h`
  }
}

function determineStatus(checkIn: Date | null, checkOut: Date | null, providedStatus?: string): string {
  if (providedStatus) return providedStatus
  
  if (!checkIn) return 'ABSENT'
  
  const checkInHour = checkIn.getHours()
  const checkInMinute = checkIn.getMinutes()
  const checkInTime = checkInHour * 60 + checkInMinute
  const nineAM = 9 * 60 // 9:00 AM in minutes
  
  if (checkInTime > nineAM + 30) { // More than 30 minutes late
    return 'LATE'
  }
  
  if (!checkOut) {
    return 'PRESENT' // Checked in but not out yet
  }
  
  const workHours = calculateWorkHours(checkIn, checkOut)
  const hours = parseFloat(workHours.workHours.replace('h', ''))
  
  if (hours < 4) {
    return 'HALF_DAY'
  }
  
  return 'PRESENT'
}

function mapStatusToFrontend(status: string): string {
  const statusMap: { [key: string]: string } = {
    'PRESENT': 'Present',
    'ABSENT': 'Absent', 
    'LATE': 'Late',
    'HALF_DAY': 'Half Day'
  }
  return statusMap[status] || status
}

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const department = searchParams.get('department')
    const status = searchParams.get('status')
    const location = searchParams.get('location')
    const search = searchParams.get('search')

    let where: any = {}
    
    // Role-based filtering
    if (authUser.role === 'EMPLOYEE') {
      where.userId = authUser.userId
    }
    
    // Department filter
    if (department && department !== 'All') {
      where.user = {
        employeeProfile: {
          department: {
            name: department
          }
        }
      }
    }

    const attendance = await prisma.attendance.findMany({
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
                }
              }
            }
          }
        }
      },
      orderBy: { date: 'desc' }
    })

    // Transform data to match frontend expectations
    const transformedAttendance = attendance.map((record, index) => {
      const { workHours, overtime } = calculateWorkHours(record.checkIn, record.checkOut)
      const finalStatus = determineStatus(record.checkIn, record.checkOut, record.status)
      
      return {
        id: index + 1, // Frontend expects sequential IDs
        employeeName: record.user.name,
        employeeId: record.user.employeeProfile?.employeeId || 'N/A',
        department: record.user.employeeProfile?.department?.name || 'N/A',
        date: formatDate(record.date),
        checkIn: formatTime(record.checkIn),
        checkOut: formatTime(record.checkOut),
        workHours,
        status: mapStatusToFrontend(finalStatus),
        location: record.notes?.includes('Remote') ? 'Remote' : 'Office',
        overtime,
        notes: record.notes,
        // Include original data for backend operations
        _originalId: record.id,
        _userId: record.userId,
        _originalDate: record.date
      }
    })

    // Apply additional filters
    let filteredAttendance = transformedAttendance
    
    if (status && status !== 'All') {
      filteredAttendance = filteredAttendance.filter(record => record.status === status)
    }
    
    if (location && location !== 'All') {
      filteredAttendance = filteredAttendance.filter(record => record.location === location)
    }

    return NextResponse.json(filteredAttendance)
  } catch (error) {
    console.error('Get attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
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

    const body = await request.json()
    console.log('Received attendance data:', body)
    console.log('Auth user:', authUser) // Debug log
    
    // Handle both direct API calls and frontend form submissions
    let targetUserId = body.userId || authUser.userId
    
    // Validate that the target user exists in the database
    const targetUser = await prisma.user.findUnique({
      where: { id: targetUserId },
      include: {
        employeeProfile: {
          include: {
            department: true
          }
        }
      }
    })
    
    if (!targetUser) {
      console.error('Target user not found:', targetUserId)
      return NextResponse.json(
        { error: 'User not found in database', userId: targetUserId },
        { status: 404 }
      )
    }
    
    console.log('Target user found:', targetUser.id, targetUser.name) // Debug log
    
    const attendanceDate = new Date(body.date || new Date().toISOString().split('T')[0])
    
    // Parse check-in and check-out times - simplified logic
    let checkInTime = null
    let checkOutTime = null
    
    if (body.checkIn && body.checkIn !== '--' && body.checkIn.trim() !== '') {
      // Handle time string format like "09:00" (24-hour format from HTML time input)
      const [hours, minutes] = body.checkIn.split(':')
      if (hours && minutes) {
        checkInTime = new Date(attendanceDate)
        checkInTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }
    }
    
    if (body.checkOut && body.checkOut !== '--' && body.checkOut.trim() !== '') {
      // Handle time string format like "17:00" (24-hour format from HTML time input)
      const [hours, minutes] = body.checkOut.split(':')
      if (hours && minutes) {
        checkOutTime = new Date(attendanceDate)
        checkOutTime.setHours(parseInt(hours), parseInt(minutes), 0, 0)
      }
    }

    const existingAttendance = await prisma.attendance.findUnique({
      where: {
        userId_date: {
          userId: targetUserId,
          date: attendanceDate
        }
      }
    })

    if (existingAttendance) {
      // Update existing attendance
      const updateData = {
        checkIn: checkInTime || existingAttendance.checkIn,
        checkOut: checkOutTime || existingAttendance.checkOut,
        status: body.status || existingAttendance.status,
        notes: body.notes || existingAttendance.notes
      }
      
      const updated = await prisma.attendance.update({
        where: { id: existingAttendance.id },
        data: updateData,
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
      
      return NextResponse.json({ success: true, data: updated })
    } else {
      // Create new attendance record
      const createData = {
        userId: targetUser.id, // Use validated user ID
        date: attendanceDate,
        checkIn: checkInTime,
        checkOut: checkOutTime,
        status: body.status || 'PRESENT',
        notes: body.notes || (body.location === 'Remote' ? 'Remote work' : null)
      }
      
      console.log('Creating attendance with validated data:', createData) // Debug log
      
      const attendance = await prisma.attendance.create({
        data: createData,
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
      
      return NextResponse.json({ success: true, data: attendance }, { status: 201 })
    }
  } catch (error) {
    console.error('Attendance POST error:', error)
    
    // Enhanced error handling with specific error types
    let errorMessage = 'Internal server error'
    let statusCode = 500
    
    if (error.code === 'P2002') {
      // Prisma unique constraint violation
      errorMessage = 'Attendance record already exists for this date'
      statusCode = 409
    } else if (error.code === 'P2003') {
      // Foreign key constraint violation
      errorMessage = 'Invalid user ID or reference'
      statusCode = 400
    } else if (error.code === 'P2025') {
      // Record not found
      errorMessage = 'User not found'
      statusCode = 404
    } else if (error.message?.includes('Invalid `prisma')) {
      // Prisma validation error
      errorMessage = 'Invalid data format provided'
      statusCode = 400
    } else if (error.message?.includes('connect ECONNREFUSED')) {
      // Database connection error
      errorMessage = 'Database connection failed'
      statusCode = 503
    }
    
    console.error('Detailed error info:', {
      code: error.code,
      message: error.message,
      stack: error.stack
    })
    
    return NextResponse.json(
      { 
        error: errorMessage, 
        details: error.message,
        code: error.code || 'UNKNOWN_ERROR'
      },
      { status: statusCode }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { id, ...updateData } = body

    if (!id) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 })
    }

    const validation = updateAttendanceSchema.safeParse(updateData)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error.format() }, { status: 400 })
    }

    const updated = await prisma.attendance.update({
      where: { id },
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
    console.error('Update attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || authUser.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Attendance ID is required' }, { status: 400 })
    }

    await prisma.attendance.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete attendance error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}