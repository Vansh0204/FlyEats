import express from 'express'
import { getAIRecommendations, chatWithAI } from '../lib/aiService'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Get AI-powered food recommendations
router.post('/recommendations', async (req, res) => {
    try {
        const { outletId, userPreferences, dietaryRestrictions, boardingTime } = req.body

        if (!outletId) {
            return res.status(400).json({ error: 'Outlet ID is required' })
        }

        // Fetch menu items for the outlet
        const menuItems = await prisma.menuItem.findMany({
            where: {
                outletId,
                isAvailable: true,
            },
            select: {
                id: true,
                name: true,
                description: true,
                price: true,
                category: true,
            },
        })

        if (menuItems.length === 0) {
            return res.json({
                recommendations: [],
                reasoning: 'No menu items available at this outlet.',
            })
        }

        const result = await getAIRecommendations({
            menuItems,
            userPreferences,
            dietaryRestrictions,
            boardingTime,
            currentTime: new Date().toISOString(),
        })

        return res.json(result)
    } catch (error) {
        console.error('AI Recommendations Error:', error)
        return res.status(500).json({ error: 'Failed to get recommendations' })
    }
})

// Chat with AI assistant
router.post('/chat', async (req, res) => {
    try {
        const { message, outletId, cartItems } = req.body

        if (!message) {
            return res.status(400).json({ error: 'Message is required' })
        }

        let menuItems: Array<{
            id: string
            name: string
            description: string | null
            price: number
            category: string | null
        }> = []
        if (outletId) {
            menuItems = await prisma.menuItem.findMany({
                where: {
                    outletId,
                    isAvailable: true,
                },
                select: {
                    id: true,
                    name: true,
                    description: true,
                    price: true,
                    category: true,
                },
            })
        }

        const response = await chatWithAI(message, {
            menuItems,
            userCart: cartItems,
        })

        return res.json({ response })
    } catch (error) {
        console.error('AI Chat Error:', error)
        return res.status(500).json({ error: 'Failed to process chat message' })
    }
})

export default router
