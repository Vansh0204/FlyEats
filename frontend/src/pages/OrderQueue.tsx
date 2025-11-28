import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { FaArrowLeft, FaClock, FaListOl, FaStore, FaCheckCircle, FaHourglass } from 'react-icons/fa'
import { apiFetch } from '../lib/api'

interface MenuItem {
    id: string
    name: string
    price: number
    quantity: number
}

interface Order {
    id: string
    createdAt: string
    status: string
    totalAmount: number
    items: { menuItem: MenuItem; quantity: number }[]
    outlet: {
        id: string
        name: string
        terminal: string
    }
}

interface OrderAhead {
    position: number
    orderNumber: string
    placedAt: string
    status: string
}

interface QueueData {
    order: Order
    queuePosition: number
    ordersAhead: OrderAhead[]
    estimatedWaitMinutes: number
    totalInQueue: number
    message?: string
}

export default function OrderQueue() {
    const { id } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const [queueData, setQueueData] = useState<QueueData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')

    const fetchQueueData = async () => {
        try {
            const response = await apiFetch(`/api/orders/${id}/queue`)
            if (response.ok) {
                const data = await response.json()
                setQueueData(data)
                setError('')
            } else {
                setError('Failed to fetch queue data')
            }
        } catch (err) {
            console.error('Error fetching queue:', err)
            setError('Failed to load queue information')
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        if (!id) return

        fetchQueueData()

        // Auto-refresh every 30 seconds
        const interval = setInterval(fetchQueueData, 30000)
        return () => clearInterval(interval)
    }, [id])

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'PENDING':
                return 'bg-gray-100 text-gray-800'
            case 'CONFIRMED':
                return 'bg-blue-100 text-blue-800'
            case 'PREPARING':
                return 'bg-orange-100 text-orange-800'
            default:
                return 'bg-gray-100 text-gray-800'
        }
    }

    const getPositionSuffix = (position: number) => {
        if (position === 1) return 'st'
        if (position === 2) return 'nd'
        if (position === 3) return 'rd'
        return 'th'
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading queue information...</p>
                </div>
            </div>
        )
    }

    if (error || !queueData) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">
                <div className="max-w-2xl mx-auto">
                    <button
                        onClick={() => navigate('/orders')}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
                    >
                        <FaArrowLeft /> Back to Orders
                    </button>
                    <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                        <p className="text-red-800">{error || 'Order not found'}</p>
                    </div>
                </div>
            </div>
        )
    }

    const { order, queuePosition, ordersAhead, estimatedWaitMinutes, message } = queueData

    return (
        <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 p-6">
            <div className="max-w-2xl mx-auto">
                {/* Header */}
                <button
                    onClick={() => navigate('/orders')}
                    className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors"
                >
                    <FaArrowLeft /> Back to Orders
                </button>

                <h1 className="text-3xl font-bold text-gray-900 mb-6">Order Queue</h1>

                {/* Your Order Card */}
                <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-xl p-6 text-white shadow-lg mb-6">
                    <div className="flex items-start justify-between mb-4">
                        <div>
                            <p className="text-orange-100 text-sm mb-1">Your Order</p>
                            <h2 className="text-2xl font-bold">#{order.id.slice(-6).toUpperCase()}</h2>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(order.status)} bg-white bg-opacity-90`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                        <div className="flex items-center gap-2">
                            <FaStore className="text-orange-200" />
                            <div>
                                <p className="text-xs text-orange-100">Outlet</p>
                                <p className="font-medium">{order.outlet.name}</p>
                                <p className="text-xs text-orange-100">Terminal {order.outlet.terminal}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <FaClock className="text-orange-200" />
                            <div>
                                <p className="text-xs text-orange-100">Placed At</p>
                                <p className="font-medium">{new Date(order.createdAt).toLocaleTimeString()}</p>
                            </div>
                        </div>
                    </div>

                    {message ? (
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                            <p className="text-sm">{message}</p>
                        </div>
                    ) : (
                        <>
                            <div className="bg-white bg-opacity-20 rounded-lg p-4 mb-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <FaListOl className="text-2xl" />
                                        <div>
                                            <p className="text-xs text-orange-100">Queue Position</p>
                                            <p className="text-3xl font-bold">{queuePosition}{getPositionSuffix(queuePosition)}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-xs text-orange-100">Estimated Wait</p>
                                        <p className="text-2xl font-bold">~{estimatedWaitMinutes} min</p>
                                    </div>
                                </div>
                            </div>

                            {queuePosition === 1 && (
                                <div className="bg-green-500 bg-opacity-90 rounded-lg p-3 flex items-center gap-2">
                                    <FaCheckCircle className="text-xl" />
                                    <p className="font-medium">You're next! Your order will be prepared soon.</p>
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Orders Ahead */}
                {ordersAhead.length > 0 && (
                    <div className="bg-white rounded-xl shadow-md p-6">
                        <div className="flex items-center gap-2 mb-4">
                            <FaHourglass className="text-orange-500 text-xl" />
                            <h3 className="text-xl font-bold text-gray-900">
                                Orders Ahead ({ordersAhead.length})
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {ordersAhead.map((orderAhead) => (
                                <div
                                    key={orderAhead.orderNumber}
                                    className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 bg-orange-100 text-orange-600 rounded-full flex items-center justify-center font-bold">
                                            {orderAhead.position}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Order #{orderAhead.orderNumber}</p>
                                            <p className="text-sm text-gray-500">
                                                {new Date(orderAhead.placedAt).toLocaleTimeString()}
                                            </p>
                                        </div>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(orderAhead.status)}`}>
                                        {orderAhead.status}
                                    </span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* No Orders Ahead */}
                {ordersAhead.length === 0 && !message && (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
                        <FaCheckCircle className="text-green-500 text-4xl mx-auto mb-3" />
                        <h3 className="text-xl font-bold text-green-900 mb-2">You're First in Line!</h3>
                        <p className="text-green-700">Your order will be prepared right away.</p>
                    </div>
                )}

                {/* Auto-refresh indicator */}
                <p className="text-center text-sm text-gray-500 mt-6">
                    <FaClock className="inline mr-1" />
                    Updates automatically every 30 seconds
                </p>
            </div>
        </div>
    )
}
