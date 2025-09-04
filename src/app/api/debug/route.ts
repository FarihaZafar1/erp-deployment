import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { auth } from '@clerk/nextjs/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking users and data in database...')
    
    // Get current Clerk user
    const { userId: clerkUserId } = await auth()
    console.log('Clerk User ID:', clerkUserId)
    
    // Get all users from database
    const users = await prisma.user.findMany({
      select: {
        id: true,
        clerkId: true,
        email: true,
        name: true,
        role: true,
        createdAt: true
      }
    })
    
    // Get departments and tasks count
    const departments = await prisma.department.findMany()
    const tasks = await prisma.task.findMany({
      include: {
        department: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    console.log(`📊 Total users found: ${users.length}`)
    console.log(`📊 Total departments found: ${departments.length}`)
    console.log(`📊 Total tasks found: ${tasks.length}`)
    
    // Find current user
    const currentUser = users.find(u => u.clerkId === clerkUserId)
    
    let message = `Database Status:\n\n`
    message += `Users: ${users.length}\n`
    message += `Departments: ${departments.length}\n`
    message += `Tasks: ${tasks.length}\n\n`
    
    users.forEach((user, index) => {
      const isCurrent = user.clerkId === clerkUserId ? ' (YOU)' : ''
      message += `${index + 1}. ${user.name}${isCurrent}\n`
      message += `   Email: ${user.email}\n`
      message += `   Role: ${user.role}\n\n`
    })
    
    // If current user exists but has EMPLOYEE role, update to ADMIN
    if (currentUser && currentUser.role === 'EMPLOYEE') {
      console.log('🔄 Updating user role to ADMIN...')
      
      await prisma.user.update({
        where: { id: currentUser.id },
        data: { role: 'ADMIN' }
      })
      
      message += `✅ Updated your role from EMPLOYEE to ADMIN!\n`
    } else if (currentUser && currentUser.role === 'ADMIN') {
      message += `✅ You already have ADMIN role.\n`
    } else if (!currentUser) {
      message += `❌ Your user not found in database. Please sign out and sign in again.\n`
    }
    
    return NextResponse.json({
      success: true,
      message,
      users,
      departments,
      tasks,
      currentUser,
      clerkUserId
    })
    
  } catch (error) {
    console.error('❌ Debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred',
      message: 'Error checking database'
    }, { status: 500 })
  }
}

// POST endpoint to create sample data
export async function POST(request: NextRequest) {
  try {
    const { userId: clerkUserId } = await auth()
    
    if (!clerkUserId) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }
    
    const body = await request.json()
    const action = body.action
    
    if (action === 'create_sample_data') {
      // First, ensure user has ADMIN role
      const currentUser = await prisma.user.findUnique({
        where: { clerkId: clerkUserId }
      })
      
      if (!currentUser) {
        return NextResponse.json({ error: 'User not found' }, { status: 404 })
      }
      
      // Update to ADMIN if needed
      if (currentUser.role !== 'ADMIN') {
        await prisma.user.update({
          where: { id: currentUser.id },
          data: { role: 'ADMIN' }
        })
      }
      
      // Create sample departments if they don't exist
      const existingDepts = await prisma.department.findMany()
      let sampleDept
      
      if (existingDepts.length === 0) {
        sampleDept = await prisma.department.create({
          data: {
            name: 'IT Department',
            description: 'Information Technology Department',
            managerId: currentUser.id,
            location: 'Building A',
            status: 'ACTIVE'
          }
        })
        
        await prisma.department.create({
          data: {
            name: 'HR Department',
            description: 'Human Resources Department',
            managerId: currentUser.id,
            location: 'Building B',
            status: 'ACTIVE'
          }
        })
      } else {
        sampleDept = existingDepts[0]
      }
      
      // Create sample tasks
      const existingTasks = await prisma.task.findMany()
      
      if (existingTasks.length === 0) {
        const sampleTasks = [
          {
            title: 'Setup Development Environment',
            description: 'Configure development tools and environment for new project',
            status: 'PENDING',
            priority: 'HIGH',
            assignedTo: currentUser.name,
            departmentId: sampleDept.id,
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days from now
          },
          {
            title: 'Code Review Process',
            description: 'Review and approve pending code changes',
            status: 'IN_PROGRESS',
            priority: 'MEDIUM',
            assignedTo: currentUser.name,
            departmentId: sampleDept.id,
            dueDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
          },
          {
            title: 'Database Optimization',
            description: 'Optimize database queries for better performance',
            status: 'COMPLETED',
            priority: 'URGENT',
            assignedTo: currentUser.name,
            departmentId: sampleDept.id,
            completedAt: new Date(),
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000) // 2 days ago
          },
          {
            title: 'Security Audit',
            description: 'Conduct comprehensive security audit of the application',
            status: 'PENDING',
            priority: 'HIGH',
            assignedTo: currentUser.name,
            departmentId: sampleDept.id,
            dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000) // 14 days from now
          },
          {
            title: 'Documentation Update',
            description: 'Update project documentation and API references',
            status: 'IN_PROGRESS',
            priority: 'LOW',
            assignedTo: currentUser.name,
            departmentId: sampleDept.id,
            dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // 10 days from now
          }
        ]
        
        for (const taskData of sampleTasks) {
          await prisma.task.create({
            data: taskData
          })
        }
      }
      
      return NextResponse.json({
        success: true,
        message: 'Sample data created successfully! You should now see task cards on the page.',
        departments: await prisma.department.count(),
        tasks: await prisma.task.count()
      })
    }
    
    // Default action - just update user role
    const updatedUser = await prisma.user.update({
      where: { clerkId: clerkUserId },
      data: { role: 'ADMIN' }
    })
    
    return NextResponse.json({
      success: true,
      message: 'Role updated to ADMIN successfully!',
      user: updatedUser
    })
    
  } catch (error) {
    console.error('❌ POST debug error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    }, { status: 500 })
  }
}