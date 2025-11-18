import express from 'express'
import { prisma } from '../lib/prisma'

const router = express.Router()

// Get popular dishes with their outlets
router.get('/popular', async (req, res) => {
  try {
    const { limit = 14, airportId } = req.query

    // Build where clause - filter by airport if provided
    const whereClause: any = {
      isAvailable: true,
    }

    if (airportId) {
      whereClause.outlet = {
        airportId: airportId as string,
      }
    }

    // Fetch menu items with their outlets and airports
    const menuItems = await prisma.menuItem.findMany({
      where: whereClause,
      include: {
        outlet: {
          include: {
            airport: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
      take: Number(limit),
      orderBy: {
        createdAt: 'desc', // Can be changed to order by popularity, ratings, etc.
      },
    })

    // Transform to dish format
    const dishes = menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category || item.outlet.category,
      price: item.price,
      image: item.image,
      outletId: item.outlet.id,
      outletName: item.outlet.name,
      airportId: item.outlet.airport.id,
      airportName: item.outlet.airport.name,
      airportCode: item.outlet.airport.code,
    }))

    return res.json({ dishes })
  } catch (error) {
    console.error('Error fetching popular dishes:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Get dish by ID with all outlets that serve it
router.get('/:dishId/outlets', async (req, res) => {
  try {
    const { dishId } = req.params
    const { airportId } = req.query

    // Get the dish details
    const dish = await prisma.menuItem.findUnique({
      where: { id: dishId },
      include: {
        outlet: {
          include: {
            airport: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    })

    if (!dish) {
      return res.status(404).json({ error: 'Dish not found' })
    }

    // Find all outlets that serve the same dish (by name) in the same airport or all airports
    const whereClause: any = {
      menuItems: {
        some: {
          name: dish.name,
          isAvailable: true,
        },
      },
      isActive: true,
    }

    if (airportId) {
      whereClause.airportId = airportId
    }

    const outlets = await prisma.outlet.findMany({
      where: whereClause,
      include: {
        airport: {
          select: {
            id: true,
            name: true,
            code: true,
          },
        },
        menuItems: {
          where: {
            name: dish.name,
            isAvailable: true,
          },
          take: 1,
        },
      },
    })

    return res.json({
      dish: {
        id: dish.id,
        name: dish.name,
        description: dish.description,
        category: dish.category,
        image: dish.image,
      },
      outlets: outlets.map((outlet) => ({
        id: outlet.id,
        name: outlet.name,
        description: outlet.description,
        category: outlet.category,
        terminal: outlet.terminal,
        airport: outlet.airport,
        menuItem: outlet.menuItems[0] ? {
          id: outlet.menuItems[0].id,
          price: outlet.menuItems[0].price,
        } : null,
      })),
    })
  } catch (error) {
    console.error('Error fetching dish outlets:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

// Get dishes by category
router.get('/category/:category', async (req, res) => {
  try {
    const { category } = req.params

    const menuItems = await prisma.menuItem.findMany({
      where: {
        isAvailable: true,
        category: {
          contains: category,
          mode: 'insensitive',
        },
      },
      include: {
        outlet: {
          include: {
            airport: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
        },
      },
    })

    const dishes = menuItems.map((item) => ({
      id: item.id,
      name: item.name,
      description: item.description,
      category: item.category || item.outlet.category,
      price: item.price,
      image: item.image,
      outletId: item.outlet.id,
      outletName: item.outlet.name,
      airportId: item.outlet.airport.id,
      airportName: item.outlet.airport.name,
      airportCode: item.outlet.airport.code,
    }))

    return res.json({ dishes })
  } catch (error) {
    console.error('Error fetching dishes by category:', error)
    return res.status(500).json({ error: 'Internal server error' })
  }
})

export default router
