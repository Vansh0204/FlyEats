import express from 'express'
import { prisma } from '../lib/prisma'
import { calculateDistance } from '../lib/utils'

const router = express.Router()

router.get('/', async (req, res) => {
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

    return res.json({ airports })
  } catch (error) {
    console.error('Error fetching airports:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Find nearest airport based on coordinates
router.get('/nearest', async (req, res) => {
  try {
    const { lat, lng } = req.query

    if (!lat || !lng) {
      return res.status(400).json({ error: 'Latitude and longitude are required' })
    }

    const userLat = parseFloat(lat as string)
    const userLng = parseFloat(lng as string)

    // Get all airports
    const airports = await prisma.airport.findMany({
      select: {
        id: true,
        name: true,
        code: true,
        city: true,
        latitude: true,
        longitude: true,
      },
    })

    // Calculate distance to each airport and find nearest
    let nearestAirport = null
    let minDistance = Infinity

    for (const airport of airports) {
      if (airport.latitude && airport.longitude) {
        const distance = calculateDistance(
          userLat,
          userLng,
          airport.latitude,
          airport.longitude
        )
        if (distance < minDistance) {
          minDistance = distance
          nearestAirport = {
            ...airport,
            distance: Math.round(distance * 10) / 10, // Round to 1 decimal
          }
        }
      }
    }

    if (!nearestAirport) {
      return res.status(404).json({ error: 'No airports found' })
    }

    return res.json({ airport: nearestAirport })
  } catch (error) {
    console.error('Error finding nearest airport:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params
    const airport = await prisma.airport.findUnique({
      where: { id },
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
      return res.status(404).json({ error: 'Airport not found' })
    }

    return res.json({ airport })
  } catch (error) {
    console.error('Error fetching airport:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

