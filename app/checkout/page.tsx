'use client'

import { useEffect, useState } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaClock, FaMapMarkerAlt } from 'react-icons/fa'
import { formatCurrency } from '@/lib/utils'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const outletId = searchParams.get('outletId') || ''
  const airportId = searchParams.get('airportId') || ''
  const gateNumber = searchParams.get('gate') || ''

  const [cart, setCart] = useState<CartItem[]>([])
  const [gate, setGate] = useState(gateNumber)
  const [deliveryAddress, setDeliveryAddress] = useState('')
  const [preOrderTime, setPreOrderTime] = useState('')
  const [specialNotes, setSpecialNotes] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    const storedCart = sessionStorage.getItem('cart')
    if (storedCart) {
      setCart(JSON.parse(storedCart))
    } else {
      router.push('/airports')
    }
  }, [router])

  const totalAmount = cart.reduce((sum, item) => sum + item.price * item.quantity, 0)

  const handlePlaceOrder = async () => {
    // In a real app, you'd get userId from auth context
    const userId = sessionStorage.getItem('userId') || 'demo-user-id'

    if (!userId || userId === 'demo-user-id') {
      alert('Please login to place an order')
      router.push('/login?redirect=/checkout')
      return
    }

    setLoading(true)

    try {
      const preOrderDateTime = preOrderTime
        ? new Date(preOrderTime).toISOString()
        : undefined

      const response = await fetch('/api/orders', {
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
        router.push(`/orders/${data.order.id}`)
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

  // Calculate minimum time (current time + 30 minutes)
  const minDateTime = new Date(Date.now() + 30 * 60 * 1000).toISOString().slice(0, 16)

  return (
    <div className="min-h-screen bg-gray-50 pb-8">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/outlets/${outletId}?airportId=${airportId}${gate ? `&gate=${gate}` : ''}`} className="text-gray-600 hover:text-orange-600">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Checkout</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Order Summary */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Summary</h2>
          <div className="space-y-3">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-3">
                <div>
                  <p className="font-semibold">{item.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-orange-600">{formatCurrency(totalAmount)}</span>
          </div>
        </div>

        {/* Delivery Details */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-500" />
            Delivery Details
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Boarding Gate Number
              </label>
              <input
                type="text"
                value={gate}
                onChange={(e) => setGate(e.target.value)}
                placeholder="e.g., A12, B5"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-xs text-gray-500 mt-1">
                This helps us find outlets closest to you
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Specific Delivery Location (Optional)
              </label>
              <input
                type="text"
                value={deliveryAddress}
                onChange={(e) => setDeliveryAddress(e.target.value)}
                placeholder="e.g., Gate A12, Terminal 1, Near Starbucks"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>
          </div>
        </div>

        {/* Pre-Order Time */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
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
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
            />
            <p className="text-xs text-gray-500 mt-1">
              Leave empty for immediate preparation. Minimum 30 minutes from now.
            </p>
          </div>
        </div>

        {/* Special Notes */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Special Instructions</h2>
          <textarea
            value={specialNotes}
            onChange={(e) => setSpecialNotes(e.target.value)}
            placeholder="Any special requests or dietary restrictions..."
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {/* Place Order Button */}
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

