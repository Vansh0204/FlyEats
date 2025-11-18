'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaTruck, FaCheckCircle, FaClock, FaSpinner, FaMapMarkerAlt } from 'react-icons/fa'

interface Delivery {
  id: string
  status: string
  deliveryPersonName?: string
  estimatedTime?: string
  deliveredAt?: string
  trackingNotes?: string
  order: {
    id: string
    outlet: {
      name: string
    }
    gateNumber?: string
    deliveryAddress?: string
  }
}

const statusSteps = [
  { key: 'PENDING', label: 'Order Received', icon: <FaClock /> },
  { key: 'ASSIGNED', label: 'Delivery Assigned', icon: <FaTruck /> },
  { key: 'PICKED_UP', label: 'Picked Up', icon: <FaCheckCircle /> },
  { key: 'IN_TRANSIT', label: 'On The Way', icon: <FaTruck /> },
  { key: 'DELIVERED', label: 'Delivered', icon: <FaCheckCircle /> },
]

export default function TrackDeliveryPage() {
  const params = useParams()
  const router = useRouter()
  const [delivery, setDelivery] = useState<Delivery | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDelivery = () => {
      fetch(`/api/delivery/${params.id}/track`)
        .then((res) => res.json())
        .then((data) => {
          setDelivery(data.delivery)
          setLoading(false)
        })
        .catch((err) => {
          console.error(err)
          setLoading(false)
        })
    }

    fetchDelivery()

    // Poll for updates every 5 seconds
    const interval = setInterval(fetchDelivery, 5000)

    return () => clearInterval(interval)
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
          <p className="mt-4 text-gray-600">Loading tracking...</p>
        </div>
      </div>
    )
  }

  if (!delivery) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Delivery not found</p>
          <Link href="/airports" className="text-orange-600 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  const currentStepIndex = statusSteps.findIndex((step) => step.key === delivery.status)

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href={`/orders/${params.id}`} className="text-gray-600 hover:text-orange-600">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900">Track Delivery</h1>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Delivery Info */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">{delivery.order.outlet.name}</h2>
          <div className="space-y-2 text-sm">
            {delivery.order.gateNumber && (
              <p className="text-gray-700 flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" />
                <span>Gate: {delivery.order.gateNumber}</span>
              </p>
            )}
            {delivery.order.deliveryAddress && (
              <p className="text-gray-700 flex items-center gap-2">
                <FaMapMarkerAlt className="text-orange-500" />
                <span>{delivery.order.deliveryAddress}</span>
              </p>
            )}
            {delivery.deliveryPersonName && (
              <p className="text-gray-700">
                <span className="font-semibold">Delivery Person:</span> {delivery.deliveryPersonName}
              </p>
            )}
          </div>
        </div>

        {/* Status Timeline */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-bold mb-6">Delivery Status</h2>
          <div className="space-y-6">
            {statusSteps.map((step, index) => {
              const isCompleted = index <= currentStepIndex
              const isCurrent = index === currentStepIndex

              return (
                <div key={step.key} className="flex items-start gap-4">
                  <div className={`flex-shrink-0 w-12 h-12 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-200 text-gray-400'
                  }`}>
                    {isCurrent && !isCompleted ? (
                      <FaSpinner className="animate-spin" />
                    ) : (
                      step.icon
                    )}
                  </div>
                  <div className="flex-1 pt-2">
                    <p className={`font-semibold ${
                      isCompleted ? 'text-gray-900' : 'text-gray-400'
                    }`}>
                      {step.label}
                    </p>
                    {isCurrent && delivery.trackingNotes && (
                      <p className="text-sm text-gray-600 mt-1">{delivery.trackingNotes}</p>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Additional Info */}
        {delivery.estimatedTime && (
          <div className="bg-orange-50 border border-orange-200 rounded-xl p-6 mb-6">
            <p className="text-orange-800 font-semibold mb-2">Estimated Arrival</p>
            <p className="text-orange-700">
              {new Date(delivery.estimatedTime).toLocaleString()}
            </p>
          </div>
        )}

        {delivery.deliveredAt && (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-6">
            <p className="text-green-800 font-semibold mb-2 flex items-center gap-2">
              <FaCheckCircle />
              Delivered!
            </p>
            <p className="text-green-700">
              Delivered at {new Date(delivery.deliveredAt).toLocaleString()}
            </p>
          </div>
        )}
      </main>
    </div>
  )
}

