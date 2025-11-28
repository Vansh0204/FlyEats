import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createQueueDemoOrders() {
    try {
        // Get test user
        const user = await prisma.user.findUnique({
            where: { email: 'test@example.com' }
        })

        if (!user) {
            console.error('Test user not found')
            return
        }

        // Get Delhi airport
        const airport = await prisma.airport.findUnique({
            where: { code: 'DEL' }
        })

        if (!airport) {
            console.error('Delhi airport not found')
            return
        }

        // Get McDonald's outlet
        const outlet = await prisma.outlet.findFirst({
            where: {
                airportId: airport.id,
                name: { contains: 'McDonald' }
            },
            include: { menuItems: true }
        })

        if (!outlet || !outlet.menuItems.length) {
            console.error('McDonald outlet or menu items not found')
            return
        }

        console.log('Creating queue demo orders...')

        // Create 3 more PENDING/CONFIRMED orders from the same user
        // These will appear as "orders ahead" in the queue

        // Order 1: CONFIRMED (15 mins ago)
        await prisma.order.create({
            data: {
                userId: user.id,
                outletId: outlet.id,
                airportId: airport.id,
                gateNumber: 'A12',
                status: 'CONFIRMED',
                totalAmount: 450,
                createdAt: new Date(Date.now() - 15 * 60 * 1000),
                items: {
                    create: [
                        {
                            menuItemId: outlet.menuItems[0].id,
                            quantity: 2,
                            price: outlet.menuItems[0].price
                        }
                    ]
                }
            }
        })
        console.log('✅ Created CONFIRMED order (15 mins ago)')

        // Order 2: CONFIRMED (12 mins ago)
        await prisma.order.create({
            data: {
                userId: user.id,
                outletId: outlet.id,
                airportId: airport.id,
                gateNumber: 'B5',
                status: 'CONFIRMED',
                totalAmount: 620,
                createdAt: new Date(Date.now() - 12 * 60 * 1000),
                items: {
                    create: [
                        {
                            menuItemId: outlet.menuItems[1].id,
                            quantity: 3,
                            price: outlet.menuItems[1].price
                        }
                    ]
                }
            }
        })
        console.log('✅ Created CONFIRMED order (12 mins ago)')

        // Order 3: PENDING (8 mins ago)
        await prisma.order.create({
            data: {
                userId: user.id,
                outletId: outlet.id,
                airportId: airport.id,
                gateNumber: 'C3',
                status: 'PENDING',
                totalAmount: 380,
                createdAt: new Date(Date.now() - 8 * 60 * 1000),
                items: {
                    create: [
                        {
                            menuItemId: outlet.menuItems[2].id,
                            quantity: 2,
                            price: outlet.menuItems[2].price
                        }
                    ]
                }
            }
        })
        console.log('✅ Created PENDING order (8 mins ago)')

        // Order 4: PENDING (just now) - This will be the user's "current" order
        const currentOrder = await prisma.order.create({
            data: {
                userId: user.id,
                outletId: outlet.id,
                airportId: airport.id,
                gateNumber: 'A12',
                status: 'PENDING',
                totalAmount: 750,
                items: {
                    create: [
                        {
                            menuItemId: outlet.menuItems[0].id,
                            quantity: 1,
                            price: outlet.menuItems[0].price
                        },
                        {
                            menuItemId: outlet.menuItems[1].id,
                            quantity: 2,
                            price: outlet.menuItems[1].price
                        }
                    ]
                }
            }
        })
        console.log('✅ Created PENDING order (current - just now)')

        console.log('\n🎉 Successfully created queue demo orders!')
        console.log(`\n📊 Queue Position Test:`)
        console.log(`   - Visit: http://localhost:3000/orders/${currentOrder.id}/queue`)
        console.log(`   - Expected: 4th in queue (3 orders ahead)`)
        console.log(`   - Estimated wait: ~30 minutes`)
    } catch (error) {
        console.error('Error creating queue demo orders:', error)
    } finally {
        await prisma.$disconnect()
    }
}

createQueueDemoOrders()
