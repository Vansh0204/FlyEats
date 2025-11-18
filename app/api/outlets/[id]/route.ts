import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const outlet = await prisma.outlet.findUnique({
      where: { id: params.id },
      include: {
        menuItems: {
          where: { isAvailable: true },
          orderBy: [
            { category: 'asc' },
            { name: 'asc' },
          ],
        },
        airport: {
          include: {
            gates: true,
          },
        },
      },
    })

    if (!outlet) {
      return NextResponse.json(
        { error: 'Outlet not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ outlet })
  } catch (error) {
    console.error('Error fetching outlet:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

