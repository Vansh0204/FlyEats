import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { formatCurrency } from '../utils'
import { apiFetch } from '../lib/api'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function Checkout() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const outletId = searchParams.get('outletId') || ''
  const airportId = searchParams.get('airportId') || ''
  const gateNumber = searchParams.get('gate') || ''

  const [cart, setCart] = useState<CartItem[]>([])
  const [gate, setGate] = useState(gateNumber)
  const [deliveryAddress] = useState('')
  const [preOrderTime, setPreOrderTime] = useState('')
  const [specialNotes, setSpecialNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [booking, setBooking] = useState<any>(null)
  const [outlet, setOutlet] = useState<any>(null)
  const [timingWarning, setTimingWarning] = useState('')


  useEffect(() => {
    const storedCart = sessionStorage.getItem('cart')
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    } else {
      navigate('/airports')
    }

    // Fetch user's booking (PNR) data to pre-fill gate and boarding time
    const userId = sessionStorage.getItem('userId')

    if (userId) {
      apiFetch(`/api/pnr/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.booking) {
            setBooking(data.booking)
            // Pre-fill gate from PNR if not already set
            if (!gate && data.booking.gateNumber) {
              setGate(data.booking.gateNumber)
            }
            // Pre-fill pre-order time (30 minutes before boarding)
            if (!preOrderTime && data.booking.boardingTime) {
              const boardingTime = new Date(data.booking.boardingTime)
              const preOrder = new Date(boardingTime.getTime() - 30 * 60 * 1000)
              setPreOrderTime(preOrder.toISOString().slice(0, 16))
            }
          }
        })
        .catch((err) => console.error('Error fetching booking:', err))
    }

    // Fetch outlet information
    if (outletId) {
      apiFetch(`/api/outlets/${outletId}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.outlet) {
            setOutlet(data.outlet)
          }
        })
        .catch((err) => console.error('Error fetching outlet:', err))
    }
  }, [navigate, gate, preOrderTime, outletId])

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)


  const validateTiming = async () => {
    if (!booking?.boardingTime || cart.length === 0) return

    setTimingWarning('')

    try {
      const boardingTime = new Date(booking.boardingTime)
      const now = new Date()
      const minutesUntilBoarding = Math.floor((boardingTime.getTime() - now.getTime()) / (1000 * 60))

      console.log('🔍 AI Timing Validation:', {
        boardingTime: boardingTime.toLocaleTimeString(),
        minutesUntilBoarding,
        cart: cart.map(item => `${item.quantity}x ${item.name}`)
      })

      const response = await apiFetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `URGENT: My flight boards in ${minutesUntilBoarding} minutes at ${boardingTime.toLocaleTimeString()}. I'm ordering: ${cart.map(item => `${item.quantity}x ${item.name}`).join(', ')}. Is there enough time to prepare this order AND pick it up before boarding? If timing is tight (less than 45 minutes), warn me and suggest faster alternatives. Be direct and concise.`,
          outletId,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        console.log('🤖 AI Response:', data.response)

        // Check if AI response contains warning keywords or if time is very tight
        const warningKeywords = ['tight', 'rush', 'hurry', 'quick', 'fast', 'might not', 'may not', 'consider', 'suggest', 'recommend', 'warning', 'concern', 'risky', 'cut it close']
        const hasWarning = warningKeywords.some(keyword =>
          data.response.toLowerCase().includes(keyword)
        )

        // Force warning if less than 45 minutes
        if (hasWarning || minutesUntilBoarding < 45) {
          console.log('⚠️ Showing timing warning')
          setTimingWarning(data.response)
        } else {
          console.log('✅ Timing is safe, no warning needed')
        }
      }
    } catch (error) {
      console.error('Error validating timing:', error)
    }
  }

  // Validate timing when cart or boarding time changes
  useEffect(() => {
    if (booking?.boardingTime && cart.length > 0) {
      const timer = setTimeout(() => {
        validateTiming()
      }, 1000) // Debounce
      return () => clearTimeout(timer)
    }
  }, [cart, booking?.boardingTime])

  const handlePlaceOrder = async () => {
    const userId = sessionStorage.getItem('userId') || 'demo-user-id'

    if (!userId || userId === 'demo-user-id') {
      alert('Please login to place an order')
      navigate('/login?redirect=/checkout')
      return
    }

    setLoading(true)

    try {
      const preOrderDateTime = preOrderTime
        ? new Date(preOrderTime).toISOString()
        : undefined

      const response = await apiFetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId,
          outletId,
          airportId,
          gateNumber: gate || undefined,
          preOrderTime: preOrderDateTime,
          deliveryAddress: deliveryAddress || undefined,
          specialNotes: specialNotes || undefined,
          items: cart.map((item) => ({
            menuItemId: item.id,
            quantity: item.quantity,
          })),
        }),
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.removeItem('cart')
        navigate(`/orders/${data.order.id}`)
      } else {
        alert(data.error || 'Failed to place order')
      }
    } catch (error) {
      console.error('Error placing order:', error)
      alert('Failed to place order')
    } finally {
      setLoading(false)
    }
  }

  const minDateTime = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to={`/outlets/${outletId}?airportId=${airportId}${gate ? `&gate=${gate}` : ''}`} className="text-gray-600 hover:text-orange-600">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Outlet Pickup Location */}
        {outlet && (
          <div className="bg-gradient-to-r from-orange-50 to-orange-100 border-2 border-orange-300 rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-3 flex items-center gap-2 text-gray-900">
              <FaMapMarkerAlt className="text-orange-600" />
              Pickup Location
            </h2>
            <div className="bg-white rounded-lg p-4 space-y-2">
              <p className="text-lg font-semibold text-gray-900">{outlet.name}</p>
              {outlet.terminal && (
                <p className="text-gray-700">
                  <span className="font-medium">Terminal:</span> {outlet.terminal}
                </p>
              )}
              {outlet.description && (
                <p className="text-gray-600 text-sm">{outlet.description}</p>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600 mt-3 pt-3 border-t">
                <FaClock />
                <span>Open: {outlet.openTime} - {outlet.closeTime}</span>
              </div>
            </div>
          </div>
        )}

        {/* AI Timing Warning */}
        {timingWarning && (
          <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl shadow-md p-6 mb-6">
            <h3 className="text-lg font-bold text-yellow-900 mb-2 flex items-center gap-2">
              <FaClock className="text-yellow-600" />
              Timing Alert
            </h3>
            <p className="text-yellow-800">{timingWarning}</p>
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-gray-700 text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-3">
                <div>
                  <p className="text-gray-700 font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="text-gray-700 font-semibold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className=" text-gray-700 flex justify-between text-xl font-bold">
            <span className='text-gray-700'>Total:</span>
            <span className="text-orange-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-gray-700 text-xl font-bold mb-4 flex items-center gap-2">
            <FaClock className="text-orange-500" />
            When do you want your food?
          </h2>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Pre-order Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={preOrderTime}
              onChange={(e) => setPreOrderTime(e.target.value)}
              min={minDateTime}
              step="60"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
              style={{ color: '#111827' }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for immediate preparation. Minimum 30 minutes from now.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-gray-700 text-xl font-bold mb-4">Special Instructions</h2>
          <textarea
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="Any special requests or dietary restrictions..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-gray-900 bg-white"
            style={{ color: '#111827' }}
          />
        </div>

        <button
          onClick={handlePlaceOrder}
          disabled={loading || cart.length === 0}
          className="w-full px-6 py-4 bg-orange-500 text-white text-lg font-semibold rounded-lg hover:bg-orange-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Placing Order...' : 'Place Order'}
        </button>
      </main>
    </div>
  )
}

