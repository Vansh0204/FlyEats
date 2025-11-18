'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { FaArrowLeft, FaMapMarkerAlt, FaClock, FaUtensils } from 'react-icons/fa'

interface Gate {
  id: string
  number: string
  terminal?: string
}

interface Outlet {
  id: string
  name: string
  category: string
  terminal?: string
  distance?: number
}

interface Airport {
  id: string
  name: string
  code: string
  gates: Gate[]
  outlets: Outlet[]
}

export default function AirportDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [airport, setAirport] = useState<Airport | null>(null)
  const [loading, setLoading] = useState(true)
  const [gateNumber, setGateNumber] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('')

  useEffect(() => {
    fetch(`/api/airports/${params.id}`)
      .then((res) => res.json())
      .then((data) => {
        setAirport(data.airport)
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [params.id])

  const handleViewOutlets = () => {
    if (gateNumber) {
      router.push(`/airports/${params.id}/outlets?gate=${gateNumber}${selectedCategory ? `&category=${selectedCategory}` : ''}`)
    } else {
      router.push(`/airports/${params.id}/outlets${selectedCategory ? `?category=${selectedCategory}` : ''}`)
    }
  }

  const categories = Array.from(new Set(airport?.outlets.map((o) => o.category) || []))

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

  if (!airport) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-600 mb-4">Airport not found</p>
          <Link href="/airports" className="text-orange-600 hover:underline">
            Go back
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/airports" className="text-gray-600 hover:text-orange-600">
            <FaArrowLeft className="text-xl" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{airport.name}</h1>
            <p className="text-orange-600">{airport.code}</p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Gate Selection */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
            <FaMapMarkerAlt className="text-orange-500" />
            Select Your Boarding Gate (Optional)
          </h2>
          <p className="text-gray-600 mb-4 text-sm">
            Enter your gate number to find restaurants closest to you
          </p>
          <select
            value={gateNumber}
            onChange={(e) => setGateNumber(e.target.value)}
            className="w-full md:w-64 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          >
            <option value="">Select a gate</option>
            {airport.gates.map((gate) => (
              <option key={gate.id} value={gate.number}>
                Gate {gate.number} {gate.terminal ? `(Terminal ${gate.terminal})` : ''}
              </option>
            ))}
          </select>
        </div>

        {/* Category Filter */}
        {categories.length > 0 && (
          <div className="bg-white rounded-xl shadow-md p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <FaUtensils className="text-orange-500" />
              Filter by Category
            </h2>
            <div className="flex flex-wrap gap-2">
              <button
                onClick={() => setSelectedCategory('')}
                className={`px-4 py-2 rounded-lg transition-colors ${
                  selectedCategory === ''
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold mb-2 flex items-center gap-2">
                <FaClock className="text-orange-500" />
                Browse Outlets
              </h2>
              <p className="text-gray-600 text-sm">
                {airport.outlets.length} {airport.outlets.length === 1 ? 'outlet' : 'outlets'} available
              </p>
            </div>
            <button
              onClick={handleViewOutlets}
              className="px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
            >
              View Outlets
            </button>
          </div>
        </div>

        {/* Outlets Preview */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {airport.outlets.slice(0, 6).map((outlet) => (
            <Link
              key={outlet.id}
              href={`/outlets/${outlet.id}?airportId=${airport.id}${gateNumber ? `&gate=${gateNumber}` : ''}`}
              className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-4"
            >
              <h3 className="font-semibold text-lg mb-2">{outlet.name}</h3>
              <p className="text-sm text-gray-600 mb-2">{outlet.category}</p>
              {outlet.terminal && (
                <p className="text-xs text-gray-500">Terminal {outlet.terminal}</p>
              )}
              {outlet.distance !== undefined && outlet.distance !== null && (
                <p className="text-xs text-orange-600 mt-2">
                  {outlet.distance.toFixed(2)} km away
                </p>
              )}
            </Link>
          ))}
        </div>
      </main>
    </div>
  )
}

