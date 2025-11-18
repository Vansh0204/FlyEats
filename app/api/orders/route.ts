import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const orderSchema = z.object({
  userId: z.string(),
  outletId: z.string(),
  airportId: z.string(),
  gateNumber: z.string().optional(),
  preOrderTime: z.string().optional(), // ISO string
  deliveryAddress: z.string().optional(),
  specialNotes: z.string().optional(),
  items: z.array(
    z.object({
      menuItemId: z.string(),
      quantity: z.number().min(1),
      specialRequests: z.string().optional(),
    })
  ),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const data = orderSchema.parse(body)

    // Fetch menu items to calculate total and verify prices
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map((item) => item.menuItemId) },
        isAvailable: true,
      },
    })

    if (menuItems.length !== data.items.length) {
      return NextResponse.json(
        { error: 'Some items are not available' },
        { status: 400 }
      )
    }

    // Calculate total
    let totalAmount = 0
    const orderItems = data.items.map((item) => {
      const menuItem = menuItems.find((m) => m.id === item.menuItemId)
      if (!menuItem) {
        throw new Error('MenuItem not found')
      }
      const itemTotal = menuItem.price * item.quantity
      totalAmount += itemTotal
      return {
        menuItemId: item.menuItemId,
        quantity: item.quantity,
        price: menuItem.price,
        specialRequests: item.specialRequests || null,
      }
    })

    // Create order
    const order = await prisma.order.create({
      data: {
        userId: data.userId,
        outletId: data.outletId,
        airportId: data.airportId,
        gateNumber: data.gateNumber || null,
        preOrderTime: data.preOrderTime ? new Date(data.preOrderTime) : null,
        deliveryAddress: data.deliveryAddress || null,
        specialNotes: data.specialNotes || null,
        totalAmount,
        status: 'PENDING',
        items: {
          create: orderItems,
        },
        delivery: {
          create: {
            status: 'PENDING',
          },
        },
      },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        outlet: true,
        delivery: true,
      },
    })

    return NextResponse.json({ order }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid input', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const orders = await prisma.order.findMany({
      where: { userId },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        outlet: true,
        delivery: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 20,
    })

    return NextResponse.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

