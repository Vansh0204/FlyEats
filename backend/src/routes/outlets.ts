import express from 'express'
import { prisma } from '../lib/prisma'
import { calculateDistance } from '../lib/utils'

const router = express.Router()

router.get('/', async (req, res) => {
  try {
    const { airportId, gateNumber, category } = req.query

    if (!airportId) {
      return res.status(400).json({ error: 'Airport ID is required' })
    }

    // Fetch airport and gates
    const airport = await prisma.airport.findUnique({
      where: { id: airportId as string },
      include: { gates: true },
    })

    if (!airport) {
      return res.status(404).json({ error: 'Airport not found' })
    }

    // Find the gate if specified
    let gate = null
    if (gateNumber) {
      gate = airport.gates.find((g) => g.number === gateNumber)
    }

    // Fetch outlets
    const where: any = {
      airportId: airportId as string,
      isActive: true,
    }

    if (category) {
      where.category = category
    }

    let outlets = await prisma.outlet.findMany({
      where,
      include: {
        menuItems: {
          where: { isAvailable: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    // Calculate distances if gate is specified
    if (gate && gate.latitude && gate.longitude) {
      outlets = outlets.map((outlet) => {
        if (outlet.latitude && outlet.longitude) {
          const distance = calculateDistance(
            gate!.latitude!,
            gate!.longitude!,
            outlet.latitude,
            outlet.longitude
          )
          return { ...outlet, distance }
        }
        return { ...outlet, distance: null }
      })

      // Sort by distance
      outlets.sort((a: any, b: any) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })
    }

    return res.json({ outlets })
  } catch (error) {
    console.error('Error fetching outlets:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const outlet = await prisma.outlet.findUnique({
      where: { id },
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
      return res.status(404).json({ error: 'Outlet not found' })
    }

    return res.json({ outlet })
  } catch (error) {
    console.error('Error fetching outlet:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

