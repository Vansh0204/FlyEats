import { useState, useEffect } from 'react'
import { useNavigate, useParams, useSearchParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaMapMarkerAlt, FaShoppingBag, FaStore } from 'react-icons/fa'
import { formatCurrency } from '../utils'
import { apiFetch } from '../lib/api'

interface Outlet {
  id: string
  name: string
  description?: string
  category: string
  terminal?: string
  airport: {
    id: string
    name: string
    code: string
  }
  menuItem: {
    id: string
    price: number
  } | null
}

export default function DishOutlets() {
  const navigate = useNavigate()
  const { dishId } = useParams()
  const [searchParams] = useSearchParams()
  const airportId = searchParams.get('airportId')

  const [dish, setDish] = useState<any>(null)
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!dishId) {
      navigate('/')
      return
    }

    apiFetch(`/api/dishes/${dishId}/outlets${airportId ? `?airportId=${airportId}` : ''}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.dish && data.outlets) {
          setDish(data.dish)
          setOutlets(data.outlets)
        } else {
          setError('Dish not found')
        }
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setError('Failed to load dish information')
        setLoading(false)
      })
  }, [dishId, airportId, navigate])

  const handleAddToCart = (outlet: Outlet) => {
    if (!outlet.menuItem) return

    const cartItem = {
      id: outlet.menuItem.id,
      name: dish.name,
      price: outlet.menuItem.price,
      quantity: 1,
      outletId: outlet.id,
      outletName: outlet.name,
      airportId: outlet.airport.id,
    }

    const existingCart = JSON.parse(sessionStorage.getItem('cart') || '[]')
    existingCart.push(cartItem)
    sessionStorage.setItem('cart', JSON.stringify(existingCart))
    
    navigate(`/checkout?outletId=${outlet.id}&airportId=${outlet.airport.id}`)
  }

  const handleViewOutlet = (outletId: string, airportId: string) => {
    navigate(`/outlets/${outletId}?airportId=${airportId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !dish) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Dish not found'}</p>
          <Link to="/" className="text-orange-600 hover:underline">
            Go back home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-gray-600 hover:text-orange-600"
          >
            <FaArrowLeft />
            <span>Back</span>
          </button>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Dish Info */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6">
            {dish.image && (
              <img
                src={dish.image}
                alt={dish.name}
                className="w-full md:w-64 h-64 object-cover rounded-lg"
              />
            )}
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{dish.name}</h1>
              {dish.description && (
                <p className="text-gray-600 mb-4">{dish.description}</p>
              )}
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-orange-100 text-orange-600 rounded-full text-sm font-semibold">
                  {dish.category}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Outlets Section */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Available at {outlets.length} Outlet{outlets.length !== 1 ? 's' : ''}
            </h2>
            <Link
              to={`/airports/${airportId || outlets[0]?.airport.id}/outlets`}
              className="flex items-center gap-2 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
            >
              <FaStore />
              View All Outlets
            </Link>
          </div>

          {outlets.length === 0 ? (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600">No outlets found serving this dish.</p>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {outlets.map((outlet) => (
                <div
                  key={outlet.id}
                  className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow"
                >
                  <div className="p-6">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{outlet.name}</h3>
                    {outlet.description && (
                      <p className="text-gray-600 text-sm mb-3">{outlet.description}</p>
                    )}
                    
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <FaMapMarkerAlt className="text-orange-500" />
                        <span>{outlet.airport.name} ({outlet.airport.code})</span>
                      </div>
                      {outlet.terminal && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="text-gray-400">Terminal:</span>
                          <span>{outlet.terminal}</span>
                        </div>
                      )}
                      <div className="flex items-center gap-2 text-sm">
                        <span className="px-2 py-1 bg-gray-100 rounded text-gray-700">
                          {outlet.category}
                        </span>
                      </div>
                    </div>

                    {outlet.menuItem ? (
                      <div className="border-t pt-4">
                        <div className="flex items-center justify-between mb-4">
                          <span className="text-2xl font-bold text-orange-600">
                            {formatCurrency(outlet.menuItem.price)}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAddToCart(outlet)}
                            className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold flex items-center justify-center gap-2"
                          >
                            <FaShoppingBag />
                            Add to Cart
                          </button>
                          <button
                            onClick={() => handleViewOutlet(outlet.id, outlet.airport.id)}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                          >
                            View Menu
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="border-t pt-4">
                        <p className="text-gray-500 text-sm mb-4">Price not available</p>
                        <button
                          onClick={() => handleViewOutlet(outlet.id, outlet.airport.id)}
                          className="w-full px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                          View Menu
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

