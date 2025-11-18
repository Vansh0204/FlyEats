import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const airport = await prisma.airport.findUnique({
      where: { id: params.id },
      include: {
        gates: true,
        outlets: {
          where: { isActive: true },
          include: {
            menuItems: {
              where: { isAvailable: true },
              take: 3, // Preview only
            },
          },
        },
      },
    })

    if (!airport) {
      return NextResponse.json(
        { error: 'Airport not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ airport })
  } catch (error) {
    console.error('Error fetching airport:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

