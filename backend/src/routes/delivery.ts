import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

router.get('/:orderId/track', async (req, res) => {
  try {
    const { orderId } = req.params
    const delivery = await prisma.delivery.findUnique({
      where: { orderId },
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
      return res.status(404).json({ error: 'Delivery not found' })
    }

    return res.json({ delivery })
  } catch (error) {
    console.error('Error fetching delivery:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

