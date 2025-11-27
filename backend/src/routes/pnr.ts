import express from 'express'
import { prisma } from '../lib/prisma'
import { z } from 'zod'

const router = express.Router()

const pnrSchema = z.object({
  pnr: z.string().min(6).max(10),
})

// Lookup PNR details (simulated - in production, integrate with airline API)
router.post('/lookup', async (req, res) => {
  try {
    const { pnr } = pnrSchema.parse(req.body)

    // In production, this would call an airline API like:
    // - Amadeus API
    // - Sabre API
    // - Airline-specific APIs
    // For now, we'll simulate based on PNR patterns

    // Simulate PNR lookup - extract info from PNR format
    // Real PNRs are usually 6-10 alphanumeric characters
    const pnrUpper = pnr.toUpperCase()

    // Demo PNRs for showcase
    let simulatedData
    if (pnrUpper === 'DEMO01') {
      // DEMO01: Tight timing scenario (30 minutes to boarding)
      simulatedData = {
        flightNumber: `AI2547`,
        gateNumber: `A12`,
        terminal: 'T3',
        boardingTime: new Date(Date.now() + 30 * 60 * 1000), // 30 minutes from now
        airportCode: 'DEL', // Delhi
      }
    } else if (pnrUpper === 'DEMO02') {
      // DEMO02: Plenty of time scenario (2 hours to boarding)
      simulatedData = {
        flightNumber: `AI1234`,
        gateNumber: `B5`,
        terminal: 'T3',
        boardingTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        airportCode: 'DEL', // Delhi
      }
    } else {
      // Default simulation for other PNRs
      simulatedData = {
        flightNumber: `AI${Math.floor(Math.random() * 9000) + 1000}`,
        gateNumber: `A${Math.floor(Math.random() * 20) + 1}`,
        terminal: 'T3',
        boardingTime: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours from now
        airportCode: 'DEL', // Default to Delhi
      }
    }

    // Try to find airport by code
    const airport = await prisma.airport.findUnique({
      where: { code: simulatedData.airportCode },
    })

    return res.json({
      pnr,
      flightNumber: simulatedData.flightNumber,
      gateNumber: simulatedData.gateNumber,
      terminal: simulatedData.terminal,
      boardingTime: simulatedData.boardingTime.toISOString(),
      airport: airport ? {
        id: airport.id,
        name: airport.name,
        code: airport.code,
      } : null,
    })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Invalid PNR format',
        details: error.errors,
      })
    }
    console.error('PNR lookup error:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Save PNR to user's account
router.post('/save', async (req, res) => {
  try {
    const { userId, pnr, flightNumber, gateNumber, terminal, boardingTime, airportId } = req.body

    if (!userId || !pnr) {
      return res.status(400).json({ error: 'User ID and PNR are required' })
    }

    // Check if booking already exists
    const existingBooking = await prisma.booking.findUnique({
      where: { pnr },
    })

    let booking
    if (existingBooking) {
      if (existingBooking.userId === userId) {
        // Update existing booking
        booking = await prisma.booking.update({
          where: { pnr },
          data: {
            flightNumber: flightNumber || existingBooking.flightNumber,
            gateNumber: gateNumber || existingBooking.gateNumber,
            terminal: terminal || existingBooking.terminal,
            boardingTime: boardingTime ? new Date(boardingTime) : existingBooking.boardingTime,
            airportId: airportId || existingBooking.airportId,
          },
          include: {
            airport: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        })
      } else {
        // PNR exists but belongs to another user
        // For development/testing, we might want to allow this, but for now let's return an error
        // or we could update the userId to the new user (claiming it)
        // Let's return an error to be safe
        return res.status(400).json({ error: 'This PNR is already linked to another account.' })
      }
    } else {
      // Create new booking
      booking = await prisma.booking.create({
        data: {
          userId,
          pnr,
          flightNumber,
          gateNumber,
          terminal,
          boardingTime: boardingTime ? new Date(boardingTime) : null,
          ...(airportId ? { airportId } : {}), // Only include airportId if provided and valid
        },
        include: {
          airport: {
            select: {
              id: true,
              name: true,
              code: true,
            },
          },
        },
      })
    }

    return res.json({ booking })
  } catch (error) {
    console.error('Error saving PNR:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Get user's active booking
router.get('/user/:userId', async (req, res) => {
  try {
    const { userId } = req.params

    const booking = await prisma.booking.findFirst({
      where: {
        userId,
        boardingTime: {
          gte: new Date(), // Only future bookings
        },
      },
      include: {
        airport: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
      },
      orderBy: {
        boardingTime: 'asc',
      },
    })

    return res.json({ booking })
  } catch (error) {
    console.error('Error fetching user booking:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router

