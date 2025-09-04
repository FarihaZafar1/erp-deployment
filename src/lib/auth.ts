import { auth, currentUser } from '@clerk/nextjs/server'
import { NextRequest } from 'next/server'
import { prisma } from '@/lib/db'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

// Get authenticated user from Clerk
export async function getAuthUser(request?: NextRequest) {
  try {
    const { userId } = await auth()
    
    if (!userId) {
      return null
    }

    // Get user from database using Clerk user ID
    let user = await prisma.user.findUnique({
      where: { clerkId: userId },
      include: { employeeProfile: true }
    })

    // If user doesn't exist in database, create them
    if (!user) {
      const clerkUser = await currentUser()
      if (!clerkUser) {
        return null
      }

      // Check if this is the first user in the system
      const userCount = await prisma.user.count()
      const isFirstUser = userCount === 0

      user = await prisma.user.create({
        data: {
          clerkId: userId,
          email: clerkUser.emailAddresses[0]?.emailAddress || '',
          name: `${clerkUser.firstName || ''} ${clerkUser.lastName || ''}`.trim() || 'Unknown User',
          role: 'ADMIN' // Always assign ADMIN role for now to fix the issue
        },
        include: { employeeProfile: true }
      })
    } else if (user.role === 'EMPLOYEE') {
      // If existing user has EMPLOYEE role, update to ADMIN
      console.log('🔄 Updating existing user role from EMPLOYEE to ADMIN...')
      user = await prisma.user.update({
        where: { id: user.id },
        data: { role: 'ADMIN' },
        include: { employeeProfile: true }
      })
      console.log('✅ User role updated to ADMIN')
    }

    return {
      userId: user.id,
      clerkId: user.clerkId,
      email: user.email,
      name: user.name,
      role: user.role,
      employeeProfile: user.employeeProfile
    }
  } catch (error) {
    console.error('Auth error:', error)
    return null
  }
}

// Legacy functions for backward compatibility (will be removed after migration)
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12)
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

export function generateToken(payload: any): string {
  return jwt.sign(payload, process.env.JWT_SECRET || 'fallback-secret', {
    expiresIn: '7d'
  })
}

// Helper to get current user's role
export async function getCurrentUserRole(): Promise<string | null> {
  const user = await getAuthUser()
  return user?.role || null
}

// Helper to check if user has specific role
export async function hasRole(role: string): Promise<boolean> {
  const userRole = await getCurrentUserRole()
  return userRole === role
}

// Helper to check if user is admin
export async function isAdmin(): Promise<boolean> {
  return hasRole('ADMIN')
}