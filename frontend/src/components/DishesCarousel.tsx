import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Carousel, Card } from './ui/apple-cards-carousel'
import { useLocation } from '../hooks/useLocation'
import { FaMapMarkerAlt } from 'react-icons/fa'
import { apiFetch } from '../lib/api'

interface Dish {
  id: string
  name: string
  description?: string
  category: string
  price: number
  image?: string
  outletId: string
  outletName: string
  airportId: string
  airportName: string
  airportCode: string
}

export default function DishesCarousel() {
  const [dishes, setDishes] = useState<Dish[]>([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()
  const { nearestAirport, loading: locationLoading, permissionDenied, requestLocation } = useLocation()

  useEffect(() => {
    // Only fetch dishes after location is determined (or if location is denied)
    if (locationLoading) {
      return // Wait for location detection to complete
    }

    // Store nearest airport in sessionStorage for use in other pages
    if (nearestAirport) {
      sessionStorage.setItem('nearestAirport', JSON.stringify(nearestAirport))
    }

    // Build API URL with airport filter if available
    let apiUrl = '/api/dishes/popular?limit=14'
    if (nearestAirport) {
      apiUrl += `&airportId=${nearestAirport.id}`
      console.log('🔍 Fetching dishes for airport:', nearestAirport.name, nearestAirport.id)
    } else {
      console.log('🌍 No airport detected, showing all dishes')
    }

    setLoading(true)
    apiFetch(apiUrl)
      .then((res) => {
        if (!res.ok) {
          throw new Error('Failed to fetch dishes')
        }
        return res.json()
      })
      .then((data) => {
        console.log('🍽️ Dishes loaded:', data.dishes?.length || 0, 'dishes')
        setDishes(data.dishes || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('Error fetching dishes:', err)
        setLoading(false)
      })
  }, [nearestAirport, locationLoading])

  const handleDishClick = async (dish: Dish) => {
    // Check if user is logged in
    const userId = sessionStorage.getItem('userId')
    
    if (!userId) {
      // Redirect to login with outlet info in state
      sessionStorage.setItem('pendingOutlet', JSON.stringify({
        outletId: dish.outletId,
        airportId: dish.airportId,
      }))
      navigate('/login?redirect=/outlet')
    } else {
      // User is logged in, check if they have PNR
      try {
        const response = await apiFetch(`/api/pnr/user/${userId}`)
        const data = await response.json()
        const hasBooking = !!data.booking

        if (!hasBooking) {
          // No PNR, ask for it first
          sessionStorage.setItem('pendingOutlet', JSON.stringify({
            outletId: dish.outletId,
            airportId: dish.airportId,
          }))
          navigate(`/pnr?redirect=/outlets/${dish.outletId}?airportId=${dish.airportId}`)
        } else {
          // Has PNR, go directly to the outlet page
          navigate(`/outlets/${dish.outletId}?airportId=${dish.airportId}`)
        }
      } catch (error) {
        console.error('Error checking booking:', error)
        // On error, still navigate to outlet but ask for PNR
        sessionStorage.setItem('pendingOutlet', JSON.stringify({
          outletId: dish.outletId,
          airportId: dish.airportId,
        }))
        navigate(`/pnr?redirect=/outlets/${dish.outletId}?airportId=${dish.airportId}`)
      }
    }
  }

  if (loading || locationLoading) {
    return (
      <div className="text-center py-12">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">
          {locationLoading ? 'Detecting your location...' : 'Loading dishes...'}
        </p>
      </div>
    )
  }

  if (dishes.length === 0) {
    return (
      <div className="w-full py-20 bg-gradient-to-b from-white to-gray-50">
        <div className="container mx-auto px-4">
          <div className="max-w-7xl mx-auto text-center">
            <h2 className="text-xl md:text-5xl font-bold text-neutral-800 font-sans mb-4">
              Order our best food options
            </h2>
            <p className="text-gray-600 text-lg mb-4">
              No dishes available at the moment. Please check back later!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Transform dishes to Aceternity UI Card format
  const cards = dishes.map((dish) => (
    <Card
      key={dish.id}
      card={{
        src: dish.image || '',
        title: dish.name,
        category: dish.category,
        content: (
          <div>
            {dish.description && (
              <p className="mb-2 line-clamp-2">{dish.description}</p>
            )}
            <p className="text-xs text-gray-500">
              {dish.airportName} ({dish.airportCode})
            </p>
          </div>
        ),
        id: dish.id,
        price: dish.price,
        outletName: dish.outletName,
        outletId: dish.outletId,
        airportId: dish.airportId,
      }}
      onClick={() => handleDishClick(dish)}
    />
  ))

  return (
    <div className="w-full h-full py-20 bg-gradient-to-b from-white to-gray-50">
      <div className="container mx-auto px-4">
        <div className="max-w-7xl mx-auto mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-5xl font-bold text-neutral-800 font-sans">
              Order our best food options
            </h2>
            {permissionDenied && (
              <button
                onClick={requestLocation}
                className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm"
              >
                <FaMapMarkerAlt />
                Enable Location
              </button>
            )}
          </div>
          {nearestAirport ? (
            <div className="flex items-center gap-2 mb-2">
              <FaMapMarkerAlt className="text-orange-500" />
              <p className="text-gray-600 text-lg">
                Showing dishes from <span className="font-semibold text-orange-600">{nearestAirport.name}</span>
                {nearestAirport.distance && (
                  <span className="text-sm text-gray-500 ml-2">
                    ({nearestAirport.distance} km away)
                  </span>
                )}
              </p>
            </div>
          ) : (
            <p className="text-gray-600 text-lg">
              Browse your favorite dishes and find outlets that serve them. Click on any dish to view the outlet menu!
            </p>
          )}
        </div>
        <Carousel items={cards} />
      </div>
    </div>
  )
}
