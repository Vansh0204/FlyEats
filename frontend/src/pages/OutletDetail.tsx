import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaShoppingCart, FaPlus, FaMinus, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { formatCurrency } from '../utils'
import { apiFetch } from '../lib/api'

interface MenuItem {
  id: string
  name: string
  description?: string
  price: number
  category?: string
  image?: string
}

interface Outlet {
  id: string
  name: string
  description?: string
  category: string
  terminal?: string
  menuItems: MenuItem[]
  airport: {
    id: string
    name: string
    gates: Array<{ id: string; number: string; terminal?: string }>
  }
}

interface CartItem extends MenuItem {
  quantity: number
}

export default function OutletDetail() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const airportId = searchParams.get('airportId') || ''
  const gateNumber = searchParams.get('gate') || ''
  
  const [outlet, setOutlet] = useState<Outlet | null>(null)
  const [loading, setLoading] = useState(true)
  const [cart, setCart] = useState<CartItem[]>([])
  const [selectedCategory, setSelectedCategory] = useState<string>('')
  const [showCart, setShowCart] = useState(false)

  useEffect(() => {
    apiFetch(`/api/outlets/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOutlet(data.outlet)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [id])

  const categories = Array.from(new Set(outlet?.menuItems.map((item) => item.category || 'Other') || []))

  const filteredItems = outlet?.menuItems.filter(
    (item) => !selectedCategory || item.category === selectedCategory || (!item.category && selectedCategory === 'Other')
  ) || []

  const addToCart = (item: MenuItem) => {
    setCart((prev) => {
      const existing = prev.find((i) => i.id === item.id)
      if (existing) {
        return prev.map((i) =>
          i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i
        )
      }
      return [...prev, { ...item, quantity: 1 }]
    })
    setShowCart(true)
  }

  const removeFromCart = (itemId: string) => {
    setCart((prev) => prev.filter((i) => i.id !== itemId))
  }

  const updateQuantity = (itemId: string, delta: number) => {
    setCart((prev) =>
      prev.map((i) => {
        if (i.id === itemId) {
          const newQuantity = i.quantity + delta
          if (newQuantity <= 0) {
            return null
          }
          return { ...i, quantity: newQuantity }
        }
        return i
      }).filter((i): i is CartItem => i !== null)
    )
  }

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

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

  if (!outlet) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Outlet not found</p>
          <Link to="/airports" className="text-orange-600 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-24">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link to={`/airports/${airportId}/outlets${gateNumber ? `?gate=${gateNumber}` : ''}`} className="text-gray-600 hover:text-orange-600">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-xl font-bold text-gray-900">{outlet.name}</h1>
          <div className="flex items-center gap-4">
            <Link
              to={`/airports/${airportId}/outlets${gateNumber ? `?gate=${gateNumber}` : ''}`}
              className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors text-sm font-semibold"
            >
              Outlets
            </Link>
            <button
              onClick={() => setShowCart(!showCart)}
              className="relative text-gray-600 hover:text-orange-600"
            >
              <FaShoppingCart className="text-2xl" />
              {cart.length > 0 && (
                <span className="absolute -top-2 -right-2 bg-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                  {cart.reduce((sum, item) => sum + item.quantity, 0)}
                </span>
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-2xl font-bold mb-2">{outlet.name}</h2>
          <p className="text-orange-600 mb-3">{outlet.category}</p>
          {outlet.description && (
            <p className="text-gray-600 mb-3">{outlet.description}</p>
          )}
          <div className="flex flex-wrap gap-4 text-sm text-gray-600">
            {outlet.terminal && (
              <span className="flex items-center gap-1">
                <FaMapMarkerAlt />
                Terminal {outlet.terminal}
              </span>
            )}
            <span className="flex items-center gap-1">
              <FaClock />
              Open
            </span>
          </div>
        </div>

        {categories.length > 0 && (
          <div className="mb-6 flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategory('')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                selectedCategory === ''
                  ? 'bg-orange-500 text-white'
                  : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === category
                    ? 'bg-orange-500 text-white'
                    : 'bg-white text-gray-700 hover:bg-gray-100'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        )}

        <div className="space-y-4">
          {filteredItems.map((item) => {
            const cartItem = cart.find((i) => i.id === item.id)
            return (
              <div key={item.id} className="bg-white rounded-xl shadow-md p-4">
                <div className="flex justify-between items-start gap-4">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1">{item.name}</h3>
                    {item.description && (
                      <p className="text-gray-600 text-sm mb-2">{item.description}</p>
                    )}
                    <p className="text-orange-600 font-semibold">{formatCurrency(item.price)}</p>
                  </div>
                  {cartItem ? (
                    <div className="flex items-center gap-3 bg-orange-50 px-3 py-2 rounded-lg">
                      <button
                        onClick={() => updateQuantity(item.id, -1)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <FaMinus />
                      </button>
                      <span className="font-semibold w-8 text-center">{cartItem.quantity}</span>
                      <button
                        onClick={() => updateQuantity(item.id, 1)}
                        className="text-orange-600 hover:text-orange-700"
                      >
                        <FaPlus />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => addToCart(item)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors flex items-center gap-2"
                    >
                      <FaPlus />
                      Add
                    </button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {showCart && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50" onClick={() => setShowCart(false)}>
          <div
            className="fixed right-0 top-0 h-full w-full md:w-96 bg-white shadow-xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold">Your Cart</h2>
                <button
                  onClick={() => setShowCart(false)}
                  className="text-gray-600 hover:text-gray-900"
                >
                  ×
                </button>
              </div>

              {cart.length === 0 ? (
                <p className="text-gray-600 text-center py-8">Your cart is empty</p>
              ) : (
                <>
                  <div className="space-y-4 mb-6">
                    {cart.map((item) => (
                      <div key={item.id} className="flex items-center justify-between border-b pb-4">
                        <div className="flex-1">
                          <h3 className="font-semibold">{item.name}</h3>
                          <p className="text-sm text-gray-600">{formatCurrency(item.price)} × {item.quantity}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="font-semibold">{formatCurrency(item.price * item.quantity)}</span>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700"
                          >
                            ×
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="border-t pt-4 mb-6">
                    <div className="flex justify-between text-xl font-bold mb-6">
                      <span>Total:</span>
                      <span className="text-orange-600">{formatCurrency(totalAmount)}</span>
                    </div>
                    <Link
                      to={`/checkout?outletId=${outlet.id}&airportId=${airportId}${gateNumber ? `&gate=${gateNumber}` : ''}`}
                      onClick={() => {
                        sessionStorage.setItem('cart', JSON.stringify(cart))
                      }}
                      className="block w-full px-6 py-3 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                    >
                      Proceed to Checkout
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

