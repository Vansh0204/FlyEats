import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { calculateDistance } from '@/lib/utils'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const airportId = searchParams.get('airportId')
    const gateNumber = searchParams.get('gateNumber')
    const category = searchParams.get('category')

    if (!airportId) {
      return NextResponse.json(
        { error: 'Airport ID is required' },
        { status: 400 }
      )
    }

    // Fetch airport and gates
    const airport = await prisma.airport.findUnique({
      where: { id: airportId },
      include: { gates: true },
    })

    if (!airport) {
      return NextResponse.json(
        { error: 'Airport not found' },
        { status: 404 }
      )
    }

    // Find the gate if specified
    let gate = null
    if (gateNumber) {
      gate = airport.gates.find((g) => g.number === gateNumber)
    }

    // Fetch outlets
    const where: any = {
      airportId,
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
      outlets.sort((a, b) => {
        if (a.distance === null) return 1
        if (b.distance === null) return -1
        return a.distance - b.distance
      })
    }

    return NextResponse.json({ outlets })
  } catch (error) {
    console.error('Error fetching outlets:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

