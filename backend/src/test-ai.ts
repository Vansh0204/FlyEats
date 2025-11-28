import dotenv from 'dotenv'
dotenv.config()

import { chatWithAI, getAIRecommendations } from './lib/aiService'

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function test() {
    console.log('Testing AI Service with DB data...')

    try {
        // Get an outlet
        const outlet = await prisma.outlet.findFirst({
            include: { menuItems: true }
        })

        if (!outlet) {
            console.error('No outlet found. Run seed script first.')
            return
        }

        console.log(`Testing with outlet: ${outlet.name}`)

        // Test Recommendations
        console.log('\n1. Testing Recommendations...')
        const recommendations = await getAIRecommendations({
            menuItems: outlet.menuItems,
            userPreferences: ['Spicy', 'Vegetarian'],
            boardingTime: '1 hour'
        })
        console.log('Recommendations:', JSON.stringify(recommendations, null, 2))

        // Test Chat
        console.log('\n2. Testing Chat...')
        const chatResponse = await chatWithAI('What do you have for vegetarians?', {
            menuItems: outlet.menuItems
        })
        console.log('Chat Response:', chatResponse)

    } catch (error) {
        console.error('Error:', error)
    } finally {
        await prisma.$disconnect()
    }
}

test()
