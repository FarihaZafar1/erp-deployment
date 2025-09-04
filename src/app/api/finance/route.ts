import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getAuthUser } from '@/lib/auth'
import { createFinanceRecordSchema } from '@/lib/validation'

export async function GET(request: NextRequest) {
  try {
    const authUser = await getAuthUser(request)
    if (!authUser || !['ADMIN', 'HR'].includes(authUser.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')
    const category = searchParams.get('category')
    const month = searchParams.get('month')
    const year = searchParams.get('year')

    const where: any = {}
    if (type) where.type = type
    if (category) where.category = category
    if (month && year) {
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0)
      where.date = {
        gte: startDate,
        lte: endDate
      }
    }

    const financeRecords = await prisma.financeRecord.findMany({
      where,
      orderBy: { date: 'desc' }
    })

    return NextResponse.json(financeRecords)
  } catch (error) {
    console.error('Get finance records error:', error)
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
    const validation = createFinanceRecordSchema.safeParse(body)

    if (!validation.success) {
        return NextResponse.json({ error: validation.error.format() }, { status: 400 });
    }

    const { type, amount, description, category, date, status } = validation.data

    const financeRecord = await prisma.financeRecord.create({
      data: {
        type,
        amount,
        description,
        category,
        date: new Date(date),
        status
      }
    })

    return NextResponse.json(financeRecord, { status: 201 })
  } catch (error) {
    console.error('Create finance record error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
