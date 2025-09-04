const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function checkUsers() {
  try {
    console.log('🔍 Checking all users in database...')
    
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
    
    console.log(`📊 Total users found: ${users.length}`)
    
    if (users.length === 0) {
      console.log('❌ No users found in database!')
    } else {
      console.log('\n👥 Users in database:')
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.name}`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   Clerk ID: ${user.clerkId}`)
        console.log(`   Created: ${user.createdAt}`)
        console.log('   ---')
      })
    }
    
  } catch (error) {
    console.error('❌ Error checking users:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkUsers()