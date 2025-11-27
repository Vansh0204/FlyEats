import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaShoppingCart, FaPlus, FaMinus, FaMapMarkerAlt, FaClock, FaTrash, FaShoppingBasket, FaUtensils } from 'react-icons/fa'
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
  // const navigate = useNavigate()
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

  const subtotal = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const tax = subtotal * 0.05 // 5% tax
  const totalAmount = subtotal + tax

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
              className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === ''
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
                className={`px-4 py-2 rounded-lg transition-colors ${selectedCategory === category
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
                  <div className="w-24 h-24 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                    {item.image ? (
                      <img
                        src={item.image}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          e.currentTarget.src = 'https://placehold.co/400x300?text=No+Image'
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        <FaUtensils className="text-2xl" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg mb-1 text-gray-900">{item.name}</h3>
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
                      <span className="font-semibold w-8 text-center text-gray-900">{cartItem.quantity}</span>
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
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 backdrop-blur-sm" onClick={() => setShowCart(false)}>
          <div
            className="fixed right-0 top-0 h-full w-full md:w-[450px] bg-white shadow-2xl flex flex-col"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b flex items-center justify-between bg-white z-10">
              <h2 className="text-2xl font-bold flex items-center gap-2 text-gray-900">
                <FaShoppingCart className="text-orange-500" />
                Your Cart
              </h2>
              <button
                onClick={() => setShowCart(false)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-500"
              >
                <span className="text-2xl leading-none">&times;</span>
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-gray-500 space-y-4">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center">
                    <FaShoppingBasket className="text-4xl text-gray-400" />
                  </div>
                  <p className="text-lg font-medium text-gray-900">Your cart is empty</p>
                  <p className="text-sm">Looks like you haven't added anything yet.</p>
                  <button
                    onClick={() => setShowCart(false)}
                    className="mt-4 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors"
                  >
                    Start Ordering
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {cart.map((item) => (
                    <div key={item.id} className="flex gap-4">
                      {/* Item Image */}
                      <div className="w-20 h-20 bg-gray-100 rounded-lg overflow-hidden shrink-0">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-400">
                            <FaShoppingCart />
                          </div>
                        )}
                      </div>

                      {/* Item Details */}
                      <div className="flex-1 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start">
                            <h3 className="font-semibold text-gray-900 line-clamp-1">{item.name}</h3>
                            <span className="font-semibold text-gray-900">{formatCurrency(item.price * item.quantity)}</span>
                          </div>
                          <p className="text-sm text-gray-500">{formatCurrency(item.price)} each</p>
                        </div>

                        <div className="flex items-center justify-between mt-2">
                          <div className="flex items-center gap-3 bg-gray-50 rounded-lg p-1">
                            <button
                              onClick={() => updateQuantity(item.id, -1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-orange-600 transition-colors"
                            >
                              <FaMinus size={10} />
                            </button>
                            <span className="font-semibold w-6 text-center text-sm text-gray-900">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.id, 1)}
                              className="w-8 h-8 flex items-center justify-center bg-white rounded-md shadow-sm text-gray-600 hover:text-orange-600 transition-colors"
                            >
                              <FaPlus size={10} />
                            </button>
                          </div>
                          <button
                            onClick={() => removeFromCart(item.id)}
                            className="text-red-500 hover:text-red-700 p-2 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove item"
                          >
                            <FaTrash size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="border-t bg-gray-50 p-6 space-y-4">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal</span>
                    <span>{formatCurrency(subtotal)}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Tax (5%)</span>
                    <span>{formatCurrency(tax)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                    <span>Total</span>
                    <span className="text-orange-600">{formatCurrency(totalAmount)}</span>
                  </div>
                </div>
                <Link
                  to={`/checkout?outletId=${outlet.id}&airportId=${airportId}${gateNumber ? `&gate=${gateNumber}` : ''}`}
                  onClick={() => {
                    sessionStorage.setItem('cart', JSON.stringify(cart))
                  }}
                  className="block w-full py-3.5 bg-orange-500 text-white text-center rounded-xl hover:bg-orange-600 transition-all shadow-lg hover:shadow-orange-500/30 font-semibold text-lg"
                >
                  Proceed to Checkout
                </Link>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

