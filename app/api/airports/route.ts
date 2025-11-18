import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const airports = await prisma.airport.findMany({
      include: {
        gates: true,
        outlets: {
          where: { isActive: true },
          take: 5, // Preview only
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json({ airports })
  } catch (error) {
    console.error('Error fetching airports:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

