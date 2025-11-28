import express from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const router = express.Router()

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

router.post('/', async (req, res) => {
  try {
    const data = orderSchema.parse(req.body)

    // Fetch menu items to calculate total and verify prices
    const menuItems = await prisma.menuItem.findMany({
      where: {
        id: { in: data.items.map((item) => item.menuItemId) },
        isAvailable: true,
      },
    })

    if (menuItems.length !== data.items.length) {
      return res.status(400).json({ error: 'Some items are not available' })
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

    return res.status(201).json({ order })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid input',
        details: error.errors,
      })
    }
    console.error('Error creating order:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/', async (req, res) => {
  try {
    const { userId } = req.query

    if (!userId) {
      return res.status(400).json({ error: 'User ID is required' })
    }

    const orders = await prisma.order.findMany({
      where: { userId: userId as string },
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

    return res.json({ orders })
  } catch (error) {
    console.error('Error fetching orders:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        outlet: true,
        delivery: true,
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            phone: true,
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    return res.json({ order })
  } catch (error) {
    console.error('Error fetching order:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Get order queue position
router.get('/:id/queue', async (req, res) => {
  try {
    const { id } = req.params

    // Get the user's order
    const order = await prisma.order.findUnique({
      where: { id },
      include: {
        items: {
          include: {
            menuItem: true,
          },
        },
        outlet: {
          select: {
            id: true,
            name: true,
            terminal: true,
          },
        },
      },
    })

    if (!order) {
      return res.status(404).json({ error: 'Order not found' })
    }

    // Only show queue for active orders
    const activeStatuses = ['PENDING', 'CONFIRMED', 'PREPARING']
    if (!activeStatuses.includes(order.status)) {
      return res.json({
        order,
        queuePosition: 0,
        ordersAhead: [],
        estimatedWaitMinutes: 0,
        message: 'Order is no longer in queue',
      })
    }

    // Get all active orders from the same outlet placed before this order
    const ordersAhead = await prisma.order.findMany({
      where: {
        outletId: order.outletId,
        status: { in: activeStatuses },
        createdAt: { lt: order.createdAt },
      },
      select: {
        id: true,
        createdAt: true,
        status: true,
        totalAmount: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    })

    // Calculate queue position (1-indexed)
    const queuePosition = ordersAhead.length + 1

    // Estimate wait time (10 minutes per order ahead)
    const avgPrepTimeMinutes = 10
    const estimatedWaitMinutes = ordersAhead.length * avgPrepTimeMinutes

    return res.json({
      order,
      queuePosition,
      ordersAhead: ordersAhead.map((o, index) => ({
        position: index + 1,
        orderNumber: o.id.slice(-6).toUpperCase(), // Last 6 chars as order number
        placedAt: o.createdAt,
        status: o.status,
      })),
      estimatedWaitMinutes,
      totalInQueue: queuePosition,
    })
  } catch (error) {
    console.error('Error fetching order queue:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router


