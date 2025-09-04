import { prisma } from './db'
import { User, Employee, Department, Task, Attendance, Payroll } from '@prisma/client'

// Dashboard Stats
export async function getDashboardStats() {
  try {
    const [totalEmployees, totalDepartments, pendingTasks, todayAttendance, totalTasks, totalFinanceRecords] = await Promise.all([
      prisma.employee.count({ where: { status: 'ACTIVE' } }),
      prisma.department.count(),
      prisma.task.count({ where: { status: 'PENDING' } }),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0)),
            lt: new Date(new Date().setHours(23, 59, 59, 999))
          }
        }
      }),
      prisma.task.count(),
      prisma.financeRecord.count()
    ])

    return {
      totalEmployees,
      totalDepartments,
      pendingTasks,
      todayAttendance,
      totalTasks,
      totalFinanceRecords
    }
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    throw error
  }
}

// Recent Activities
export async function getRecentActivities(limit: number = 10) {
  try {
    const recentTasks = await prisma.task.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        department: true
      }
    })

    const recentAttendance = await prisma.attendance.findMany({
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          include: {
            employeeProfile: true
          }
        }
      }
    })

    const recentHires = await prisma.employee.findMany({
        take: limit,
        orderBy: { hireDate: 'desc' },
        include: {
            user: true,
            department: true
        }
    })

    return {
      recentTasks,
      recentAttendance,
      recentHires
    }
  } catch (error) {
    console.error('Error fetching recent activities:', error)
    throw error
  }
}

// Employee Management
export async function getAllEmployees() {
  return await prisma.employee.findMany({
    include: {
      user: true
    },
    orderBy: { createdAt: 'desc' }
  })
}

// Department Management
export async function getAllDepartments() {
  return await prisma.department.findMany({
    include: {
      manager: true,
      tasks: true
    },
    orderBy: { createdAt: 'desc' }
  })
}