import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const router = Router()
const prisma = new PrismaClient()

// One-time database initialization endpoint
router.post('/init-db', async (req, res) => {
    try {
        // Check if database is already seeded
        const airportCount = await prisma.airport.count()
        if (airportCount > 0) {
            return res.json({
                message: 'Database already initialized',
                airports: airportCount
            })
        }

        // Run the seed logic
        console.log('🌱 Seeding database...')

        // Import and run seed
        const { execSync } = require('child_process')
        execSync('npx tsx prisma/seed.ts', { stdio: 'inherit' })

        const finalCount = await prisma.airport.count()

        res.json({
            success: true,
            message: 'Database initialized successfully!',
            airports: finalCount
        })
    } catch (error) {
        console.error('Error initializing database:', error)
        res.status(500).json({
            error: 'Failed to initialize database',
            details: error instanceof Error ? error.message : 'Unknown error'
        })
    }
})

export default router
