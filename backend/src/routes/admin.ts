import { Router } from 'express'
import { PrismaClient } from '@prisma/client'
import { hashPassword } from '../lib/auth'

const router = Router()
const prisma = new PrismaClient()

// One-time database initialization endpoint
router.post('/init-db', async (req, res) => {
    try {
        // Run schema push to create tables
        console.log('🔄 Pushing schema to database...')
        const { execSync } = require('child_process')
        try {
            execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' })
            console.log('✅ Schema pushed successfully')
        } catch (pushError) {
            console.error('Failed to push schema:', pushError)
            // Continue anyway, maybe tables exist
        }

        // Clean up existing data to ensure fresh start
        console.log('🧹 Cleaning up existing data...')
        await prisma.orderItem.deleteMany()
        await prisma.order.deleteMany()
        await prisma.menuItem.deleteMany()
        await prisma.outlet.deleteMany()
        await prisma.gate.deleteMany()
        await prisma.booking.deleteMany()
        await prisma.airport.deleteMany()
        await prisma.user.deleteMany()

        console.log('🌱 Seeding database...')

        // Create test user
        const hashedPassword = await hashPassword('password123')
        await prisma.user.create({
            data: {
                email: 'test@example.com',
                password: hashedPassword,
                name: 'Test User',
                phone: '+1234567890',
            },
        })

        // Create Pune Airport with outlets
        const puneAirport = await prisma.airport.create({
            data: {
                name: 'Pune International Airport',
                code: 'PNQ',
                city: 'Pune',
                country: 'India',
                latitude: 18.5822,
                longitude: 73.9197,
                gates: {
                    create: [
                        { number: '1', terminal: 'T1' },
                        { number: '2', terminal: 'T1' },
                        { number: '3', terminal: 'T1' },
                    ],
                },
            },
        })

        // Create outlets with menu items
        await prisma.outlet.create({
            data: {
                name: 'Starbucks',
                description: 'Coffee, tea, and light snacks',
                category: 'Coffee',
                terminal: 'T1',
                airportId: puneAirport.id,
                image: 'https://placehold.co/600x400/orange/white?text=Starbucks',
                openTime: '05:00',
                closeTime: '23:00',
                menuItems: {
                    create: [
                        { name: 'Cappuccino', description: 'Rich espresso with steamed milk', price: 250, category: 'Beverage', image: 'https://images.unsplash.com/photo-1572442388796-11668a67e53d?w=800&h=600&fit=crop' },
                        { name: 'Latte', description: 'Smooth espresso with steamed milk', price: 280, category: 'Beverage', image: 'https://images.unsplash.com/photo-1461023058943-07fcbe16d735?w=800&h=600&fit=crop' },
                        { name: 'Croissant', description: 'Buttery French croissant', price: 120, category: 'Pastry', image: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?w=800&h=600&fit=crop' },
                    ],
                },
            },
        })

        await prisma.outlet.create({
            data: {
                name: 'Pizza Hut',
                description: 'Fresh pizzas and Italian favorites',
                category: 'Italian',
                terminal: 'T1',
                airportId: puneAirport.id,
                image: 'https://placehold.co/600x400/red/white?text=Pizza+Hut',
                openTime: '07:00',
                closeTime: '23:00',
                menuItems: {
                    create: [
                        { name: 'Margherita Pizza', description: 'Classic cheese pizza', price: 399, category: 'Main Course', image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800&h=600&fit=crop' },
                        { name: 'Pepperoni Pizza', description: 'Pepperoni with cheese', price: 499, category: 'Main Course', image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800&h=600&fit=crop' },
                        { name: 'Garlic Bread', description: 'Fresh baked garlic bread', price: 179, category: 'Sides', image: 'https://images.unsplash.com/photo-1572449043416-55f4685c9f15?w=800&h=600&fit=crop' },
                    ],
                },
            },
        })

        await prisma.outlet.create({
            data: {
                name: "McDonald's",
                description: 'Fast food favorites',
                category: 'Fast Food',
                terminal: 'T1',
                airportId: puneAirport.id,
                image: 'https://placehold.co/600x400/red/white?text=McDonalds',
                openTime: '06:00',
                closeTime: '22:00',
                menuItems: {
                    create: [
                        { name: 'Big Mac', description: 'Two all-beef patties with special sauce', price: 199, category: 'Main Course', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&h=600&fit=crop' },
                        { name: 'McChicken', description: 'Crispy chicken burger', price: 149, category: 'Main Course', image: 'https://images.unsplash.com/photo-1571091718767-18b5b1457add?w=800&h=600&fit=crop' },
                        { name: 'French Fries', description: 'Crispy golden fries', price: 89, category: 'Sides', image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=800&h=600&fit=crop' },
                    ],
                },
            },
        })

        const finalCount = await prisma.airport.count()
        const outletCount = await prisma.outlet.count()
        const menuCount = await prisma.menuItem.count()

        res.json({
            success: true,
            message: 'Database initialized successfully!',
            stats: {
                airports: finalCount,
                outlets: outletCount,
                menuItems: menuCount
            }
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
