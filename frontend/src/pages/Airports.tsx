import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { FaPlane, FaArrowLeft } from 'react-icons/fa'
import { apiFetch } from '../lib/api'
import { CardSkeleton } from '../components/LoadingSkeleton'

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
    apiFetch('/api/airports')
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
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 font-sans">
      <header className="fixed w-full top-0 z-50 glass shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-full">
            <FaArrowLeft className="text-xl" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <FaPlane className="text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Select <span className="text-orange-600">Airport</span></h1>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-28 pb-12">
        {loading ? (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <CardSkeleton key={i} />
            ))}
          </div>
        ) : airports.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-gray-600 mb-6 text-lg">No airports available yet.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium">
              Go back home
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
            {airports.map((airport) => (
              <Link
                key={airport.id}
                to={`/airports/${airport.id}/outlets`}
                className="glass p-6 rounded-2xl hover:shadow-xl transition-all duration-300 group border border-white/50 hover:border-orange-200 transform hover:-translate-y-1 block"
              >
                <div className="flex items-start justify-between mb-6">
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 font-display mb-1 group-hover:text-orange-600 transition-colors">{airport.name}</h3>
                    <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 rounded-lg text-sm font-bold font-mono">
                      {airport.code}
                    </div>
                  </div>
                  <div className="w-12 h-12 bg-orange-50 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors duration-300 shrink-0">
                    <FaPlane className="text-orange-500 text-xl group-hover:text-white transition-colors duration-300 transform -rotate-45 group-hover:rotate-0" />
                  </div>
                </div>

                <div className="space-y-2">
                  <p className="text-gray-600 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full"></span>
                    {airport.city}, {airport.country}
                  </p>
                  <p className="text-sm text-gray-500 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 bg-orange-400 rounded-full"></span>
                    {airport.outlets.length} {airport.outlets.length === 1 ? 'outlet' : 'outlets'} available
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}

