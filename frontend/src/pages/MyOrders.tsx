import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaReceipt, FaClock, FaCheckCircle, FaTruck, FaSpinner } from 'react-icons/fa'
import { formatCurrency } from '../utils'
import { apiFetch } from '../lib/api'

interface Order {
    id: string
    status: string
    totalAmount: number
    createdAt: string
    preOrderTime?: string
    outlet: {
        id: string
        name: string
        terminal?: string
    }
    delivery?: {
        status: string
    }
    items: Array<{
        id: string
        quantity: number
        menuItem: {
            name: string
            price: number
        }
    }>
}

const statusConfig: Record<string, { label: string; icon: JSX.Element; color: string }> = {
    PENDING: { label: 'Pending', icon: <FaClock />, color: 'text-yellow-600 bg-yellow-50 border-yellow-200' },
    CONFIRMED: { label: 'Confirmed', icon: <FaCheckCircle />, color: 'text-blue-600 bg-blue-50 border-blue-200' },
    PREPARING: { label: 'Preparing', icon: <FaSpinner className="animate-spin" />, color: 'text-orange-600 bg-orange-50 border-orange-200' },
    READY: { label: 'Ready for Pickup', icon: <FaCheckCircle />, color: 'text-green-600 bg-green-50 border-green-200' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', icon: <FaTruck />, color: 'text-purple-600 bg-purple-50 border-purple-200' },
    DELIVERED: { label: 'Delivered', icon: <FaCheckCircle />, color: 'text-green-700 bg-green-100 border-green-300' },
    CANCELLED: { label: 'Cancelled', icon: <FaClock />, color: 'text-gray-600 bg-gray-50 border-gray-200' },
}

export default function MyOrders() {
    const navigate = useNavigate()
    const [orders, setOrders] = useState<Order[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const userId = sessionStorage.getItem('userId')

        if (!userId) {
            navigate('/login?redirect=/orders')
            return
        }

        apiFetch(`/api/orders?userId=${userId}`)
            .then((res) => res.json())
            .then((data) => {
                setOrders(data.orders || [])
                setLoading(false)
            })
            .catch((err) => {
                console.error('Error fetching orders:', err)
                setLoading(false)
            })
    }, [navigate])

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
                    <p className="mt-4 text-gray-600">Loading orders...</p>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="container mx-auto px-4 py-4 flex items-center gap-4">
                    <button
                        onClick={() => navigate('/')}
                        className="text-gray-600 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-full"
                    >
                        <FaArrowLeft className="text-xl" />
                    </button>
                    <div className="flex items-center gap-3">
                        <div className="bg-orange-500 p-2 rounded-lg text-white">
                            <FaReceipt className="text-xl" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900 font-display">
                            My <span className="text-orange-600">Orders</span>
                        </h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8 max-w-4xl">
                {orders.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-md p-12 text-center">
                        <FaReceipt className="text-6xl text-gray-300 mx-auto mb-4" />
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">No Orders Yet</h2>
                        <p className="text-gray-600 mb-6">Start ordering delicious food from airport outlets!</p>
                        <Link
                            to="/"
                            className="inline-block px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
                        >
                            Browse Outlets
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {orders.map((order) => {
                            const status = statusConfig[order.status] || statusConfig.PENDING

                            return (
                                <Link
                                    key={order.id}
                                    to={`/orders/${order.id}`}
                                    className="block bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6"
                                >
                                    <div className="flex items-start justify-between mb-4">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2 mb-2">
                                                <h3 className="text-lg font-bold text-gray-900">{order.outlet.name}</h3>
                                                {order.outlet.terminal && (
                                                    <span className="text-sm text-gray-600">• {order.outlet.terminal}</span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600">
                                                {new Date(order.createdAt).toLocaleDateString()} at{' '}
                                                {new Date(order.createdAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border ${status.color}`}>
                                            {status.icon}
                                            <span className="text-sm font-semibold">{status.label}</span>
                                        </div>
                                    </div>

                                    <div className="border-t pt-4 mb-4">
                                        <div className="space-y-1">
                                            {order.items.slice(0, 3).map((item) => (
                                                <p key={item.id} className="text-sm text-gray-700">
                                                    {item.quantity}x {item.menuItem.name}
                                                </p>
                                            ))}
                                            {order.items.length > 3 && (
                                                <p className="text-sm text-gray-500">
                                                    +{order.items.length - 3} more item{order.items.length - 3 > 1 ? 's' : ''}
                                                </p>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-orange-600">
                                            {formatCurrency(order.totalAmount)}
                                        </span>
                                        <div className="flex items-center gap-3">
                                            {['PENDING', 'CONFIRMED', 'PREPARING'].includes(order.status) && (
                                                <button
                                                    onClick={(e) => {
                                                        e.preventDefault()
                                                        navigate(`/orders/${order.id}/queue`)
                                                    }}
                                                    className="px-4 py-2 bg-orange-100 text-orange-700 rounded-lg hover:bg-orange-200 transition-colors font-semibold text-sm"
                                                >
                                                    View Queue
                                                </button>
                                            )}
                                            <span className="text-sm text-orange-600 font-semibold hover:underline">
                                                View Details →
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}
