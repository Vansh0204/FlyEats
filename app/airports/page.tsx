'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { FaPlane, FaArrowLeft } from 'react-icons/fa'

interface Airport {
  id: string
  name: string
  code: string
  city: string
  country: string
  outlets: Array<{ id: string }>
}

export default function AirportsPage() {
  const [airports, setAirports] = useState<Airport[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch('/api/airports')
      .then((res) => res.json())
      .then((data) => {
        setAirports(data.airports || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [])

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link href="/" className="text-gray-600 hover:text-orange-600">
            <FaArrowLeft className="text-xl" />
          </Link>
          <div className="flex items-center gap-2">
            <FaPlane className="text-orange-500 text-2xl" />
            <h1 className="text-2xl font-bold text-orange-600">Select Airport</h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading airports...</p>
          </div>
        ) : airports.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No airports available yet.</p>
            <Link href="/" className="text-orange-600 hover:underline">
              Go back home
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {airports.map((airport) => (
              <Link
                key={airport.id}
                href={`/airports/${airport.id}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 hover:border-orange-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">{airport.name}</h3>
                    <p className="text-orange-600 font-medium">{airport.code}</p>
                  </div>
                  <FaPlane className="text-orange-400 text-2xl" />
                </div>
                <p className="text-gray-600 mb-2">{airport.city}, {airport.country}</p>
                <p className="text-sm text-gray-500">
                  {airport.outlets.length} {airport.outlets.length === 1 ? 'outlet' : 'outlets'} available
                </p>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

