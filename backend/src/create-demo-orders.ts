import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createDemoOrders() {
  try {
    // Get test user
    const user = await prisma.user.findUnique({
      where: { email: 'test@example.com' }
    })

    if (!user) {
      console.error('Test user not found. Please login first.')
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

    console.log('Creating demo orders...')

    // Order 1: Delivered (2 hours ago)
    const order1 = await prisma.order.create({
      data: {
        userId: user.id,
        outletId: outlet.id,
        airportId: airport.id,
        gateNumber: 'A12',
        status: 'DELIVERED',
        totalAmount: 527,
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        items: {
          create: [
            {
              menuItemId: outlet.menuItems[0].id,
              quantity: 2,
              price: outlet.menuItems[0].price
            },
            {
              menuItemId: outlet.menuItems[1].id,
              quantity: 1,
              price: outlet.menuItems[1].price
            }
          ]
        }
      }
    })
    console.log('✅ Created DELIVERED order')

    // Order 2: Ready for Pickup (30 mins ago)
    const order2 = await prisma.order.create({
      data: {
        userId: user.id,
        outletId: outlet.id,
        airportId: airport.id,
        gateNumber: 'B5',
        status: 'READY',
        totalAmount: 1248,
        createdAt: new Date(Date.now() - 30 * 60 * 1000),
        items: {
          create: [
            {
              menuItemId: outlet.menuItems[2].id,
              quantity: 3,
              price: outlet.menuItems[2].price
            },
            {
              menuItemId: outlet.menuItems[3].id,
              quantity: 2,
              price: outlet.menuItems[3].price
            }
          ]
        }
      }
    })
    console.log('✅ Created READY order')

    // Order 3: Preparing (10 mins ago)
    const order3 = await prisma.order.create({
      data: {
        userId: user.id,
        outletId: outlet.id,
        airportId: airport.id,
        gateNumber: 'A12',
        status: 'PREPARING',
        totalAmount: 896,
        createdAt: new Date(Date.now() - 10 * 60 * 1000),
        items: {
          create: [
            {
              menuItemId: outlet.menuItems[0].id,
              quantity: 4,
              price: outlet.menuItems[0].price
            }
          ]
        }
      }
    })
    console.log('✅ Created PREPARING order')

    // Order 4: Confirmed (5 mins ago)
    const order4 = await prisma.order.create({
      data: {
        userId: user.id,
        outletId: outlet.id,
        airportId: airport.id,
        gateNumber: 'C3',
        status: 'CONFIRMED',
        totalAmount: 645,
        createdAt: new Date(Date.now() - 5 * 60 * 1000),
        items: {
          create: [
            {
              menuItemId: outlet.menuItems[1].id,
              quantity: 3,
              price: outlet.menuItems[1].price
            },
            {
              menuItemId: outlet.menuItems[4].id,
              quantity: 1,
              price: outlet.menuItems[4].price
            }
          ]
        }
      }
    })
    console.log('✅ Created CONFIRMED order')

    // Order 5: Pending (just now)
    const order5 = await prisma.order.create({
      data: {
        userId: user.id,
        outletId: outlet.id,
        airportId: airport.id,
        gateNumber: 'A12',
        status: 'PENDING',
        totalAmount: 1532,
        items: {
          create: [
            {
              menuItemId: outlet.menuItems[0].id,
              quantity: 2,
              price: outlet.menuItems[0].price
            },
            {
              menuItemId: outlet.menuItems[1].id,
              quantity: 2,
              price: outlet.menuItems[1].price
            },
            {
              menuItemId: outlet.menuItems[2].id,
              quantity: 2,
              price: outlet.menuItems[2].price
            }
          ]
        }
      }
    })
    console.log('✅ Created PENDING order')

    console.log('\n🎉 Successfully created 5 demo orders!')
    console.log('Order statuses: DELIVERED, READY, PREPARING, CONFIRMED, PENDING')
  } catch (error) {
    console.error('Error creating demo orders:', error)
  } finally {
    await prisma.$disconnect()
  }
}

createDemoOrders()
