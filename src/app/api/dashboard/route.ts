import { NextRequest, NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { prisma } from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const user = await getAuthUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get real-time dashboard statistics
    const [totalEmployees, totalDepartments, totalTasks, totalAttendance] = await Promise.all([
      prisma.employee.count(),
      prisma.department.count(),
      prisma.task.count(),
      prisma.attendance.count({
        where: {
          date: {
            gte: new Date(new Date().setHours(0, 0, 0, 0))
          }
        }
      })
    ]);

    // Get task statistics
    const taskStats = await prisma.task.groupBy({
      by: ['status'],
      _count: {
        status: true
      }
    });

    const taskStatusCounts = {
      PENDING: 0,
      IN_PROGRESS: 0,
      COMPLETED: 0,
      CANCELLED: 0
    };

    taskStats.forEach(stat => {
      taskStatusCounts[stat.status as keyof typeof taskStatusCounts] = stat._count.status;
    });

    // Get recent activities (last 10)
    const recentTasks = await prisma.task.findMany({
      take: 5,
      orderBy: {
        createdAt: 'desc'
      },
      select: {
        id: true,
        title: true,
        status: true,
        priority: true,
        createdAt: true,
        department: {
          select: {
            name: true
          }
        }
      }
    });

    // Get recent attendance
    const recentAttendance = await prisma.attendance.findMany({
      take: 5,
      orderBy: {
        date: 'desc'
      },
      select: {
        id: true,
        date: true,
        checkIn: true,
        checkOut: true,
        status: true,
        employee: {
          select: {
            firstName: true,
            lastName: true,
            department: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    // Get department wise employee count
    const departmentStats = await prisma.department.findMany({
      select: {
        id: true,
        name: true,
        _count: {
          select: {
            employees: true
          }
        }
      }
    });

    return NextResponse.json({
      stats: {
        totalEmployees,
        totalDepartments,
        totalTasks,
        todayAttendance: totalAttendance,
        taskStats: taskStatusCounts
      },
      recentActivities: {
        tasks: recentTasks,
        attendance: recentAttendance
      },
      departmentStats: departmentStats.map(dept => ({
        name: dept.name,
        employeeCount: dept._count.employees
      }))
    });
  } catch (error) {
    console.error('Dashboard data fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}