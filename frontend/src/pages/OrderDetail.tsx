import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaCheckCircle, FaClock, FaSpinner, FaTruck, FaMapMarkerAlt } from 'react-icons/fa'
import { formatCurrency, formatTime } from '../utils'
import { apiFetch } from '../lib/api'

interface OrderItem {
  id: string
  quantity: number
  price: number
  menuItem: {
    id: string
    name: string
  }
}

interface Delivery {
  id: string
  status: string
  estimatedTime?: string
  trackingNotes?: string
}

interface Order {
  id: string
  status: string
  totalAmount: number
  gateNumber?: string
  preOrderTime?: string
  deliveryAddress?: string
  createdAt: string
  items: OrderItem[]
  outlet: {
    id: string
    name: string
  }
  delivery?: Delivery
}

const statusConfig: Record<string, { label: string; icon: React.ReactNode; color: string }> = {
  PENDING: { label: 'Pending', icon: <FaClock />, color: 'text-yellow-600' },
  CONFIRMED: { label: 'Confirmed', icon: <FaCheckCircle />, color: 'text-blue-600' },
  PREPARING: { label: 'Preparing', icon: <FaSpinner className="animate-spin" />, color: 'text-orange-600' },
  READY: { label: 'Ready', icon: <FaCheckCircle />, color: 'text-green-600' },
  OUT_FOR_DELIVERY: { label: 'Out for Delivery', icon: <FaTruck />, color: 'text-purple-600' },
  DELIVERED: { label: 'Delivered', icon: <FaCheckCircle />, color: 'text-green-600' },
  CANCELLED: { label: 'Cancelled', icon: <FaClock />, color: 'text-red-600' },
}

export default function OrderDetail() {
  const { id } = useParams<{ id: string }>()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    apiFetch(`/api/orders/${id}`)
      .then((res) => res.json())
      .then((data) => {
        setOrder(data.order)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })

    const interval = setInterval(() => {
      apiFetch(`/api/orders/${id}`)
        .then((res) => res.json())
        .then((data) => {
          setOrder(data.order)
        })
        .catch((err) => console.error(err))
    }, 10000)

    return () => clearInterval(interval)
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading order...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Order not found</p>
          <Link to="/airports" className="text-orange-600 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  const statusInfo = statusConfig[order.status] || statusConfig.PENDING

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/airports" className="text-gray-600 hover:text-orange-600">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Order Details</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold">Order Status</h2>
            <div className={`flex items-center gap-2 ${statusInfo.color} font-semibold`}>
              {statusInfo.icon}
              <span>{statusInfo.label}</span>
            </div>
          </div>
          <p className="text-sm text-gray-600">Order ID: {order.id}</p>
          <p className="text-sm text-gray-600">Placed at: {new Date(order.createdAt).toLocaleString()}</p>
          {order.preOrderTime && (
            <p className="text-sm text-orange-600 mt-2">
              Scheduled for: {new Date(order.preOrderTime).toLocaleString()}
            </p>
          )}
        </div>

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-2">{order.outlet.name}</h2>
          <Link
            to={`/outlets/${order.outlet.id}`}
            className="text-orange-600 hover:underline text-sm"
          >
            View Outlet →
          </Link>
        </div>

        {(order.gateNumber || order.deliveryAddress || order.delivery) && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <FaMapMarkerAlt className="text-orange-500" />
              Delivery Information
            </h2>
            {order.gateNumber && (
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Gate:</span> {order.gateNumber}
              </p>
            )}
            {order.deliveryAddress && (
              <p className="text-gray-700 mb-2">
                <span className="font-semibold">Location:</span> {order.deliveryAddress}
              </p>
            )}
            {order.delivery && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  <span className="font-semibold">Delivery Status:</span> {order.delivery.status}
                </p>
                {order.delivery.estimatedTime && (
                  <p className="text-sm text-orange-600">
                    Estimated delivery: {formatTime(order.delivery.estimatedTime)}
                  </p>
                )}
                {order.delivery.trackingNotes && (
                  <p className="text-sm text-gray-600 mt-2">{order.delivery.trackingNotes}</p>
                )}
              </div>
            )}
          </div>
        )}

        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Order Items</h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between border-b pb-3">
                <div>
                  <p className="font-semibold">{item.menuItem.name}</p>
                  <p className="text-sm text-gray-600">Qty: {item.quantity}</p>
                </div>
                <p className="font-semibold">{formatCurrency(item.price * item.quantity)}</p>
              </div>
            ))}
          </div>
          <div className="mt-4 pt-4 border-t flex justify-between text-xl font-bold">
            <span>Total:</span>
            <span className="text-orange-600">{formatCurrency(order.totalAmount)}</span>
          </div>
        </div>

        {order.delivery && (
          <Link
            to={`/orders/${order.id}/track`}
            className="block w-full px-6 py-3 bg-orange-500 text-white text-center rounded-lg hover:bg-orange-600 transition-colors font-semibold mb-6"
          >
            Track Delivery
          </Link>
        )}
      </main>
    </div>
  )
}

