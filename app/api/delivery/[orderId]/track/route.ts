import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: { orderId: string } }
) {
  try {
    const delivery = await prisma.delivery.findUnique({
      where: { orderId: params.orderId },
      include: {
        order: {
          include: {
            outlet: true,
            items: {
              include: {
                menuItem: true,
              },
            },
          },
        },
      },
    })

    if (!delivery) {
      return NextResponse.json(
        { error: 'Delivery not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({ delivery })
  } catch (error) {
    console.error('Error fetching delivery:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

