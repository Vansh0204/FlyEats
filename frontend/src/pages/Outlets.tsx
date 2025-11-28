import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaMapMarkerAlt, FaUtensils, FaSearch } from 'react-icons/fa'
import { apiFetch } from '../lib/api'

interface Outlet {
  id: string
  name: string
  description?: string
  category: string
  terminal?: string
  distance?: number
  image?: string
  menuItems: Array<{ id: string }>
}

export default function Outlets() {
  const { id } = useParams<{ id: string }>()
  const [searchParams] = useSearchParams()
  const gateNumber = searchParams.get('gate') || ''
  const category = searchParams.get('category') || ''
  const [outlets, setOutlets] = useState<Outlet[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')

  useEffect(() => {
    const url = `/api/outlets?airportId=${id}${gateNumber ? `&gateNumber=${gateNumber}` : ''}${category ? `&category=${category}` : ''}`
    apiFetch(url)
      .then((res) => res.json())
      .then((data) => {
        console.log('Fetched outlets:', data.outlets)
        setOutlets(data.outlets || [])
        setLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setLoading(false)
      })
  }, [id, gateNumber, category])

  const filteredOutlets = outlets.filter((outlet) =>
    outlet.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    outlet.category.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 font-sans">
      <header className="fixed w-full top-0 z-50 glass shadow-sm transition-all duration-300">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-orange-600 transition-colors p-2 hover:bg-orange-50 rounded-full">
            <FaArrowLeft className="text-xl" />
          </Link>
          <div className="flex items-center gap-3">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <FaUtensils className="text-xl" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 font-display">Food <span className="text-orange-600">Outlets</span></h1>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <Link
              to="/pnr?redirect=/airports"
              className="px-4 py-2 text-sm text-gray-700 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors font-medium"
            >
              Change PNR
            </Link>
            {gateNumber && (
              <span className="text-sm text-gray-600 bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100 font-medium">
                Gate {gateNumber}
              </span>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 pt-28 pb-12">
        <div className="mb-6 relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search outlets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 glass border border-white/50 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all"
          />
        </div>

        {loading ? (
          <div className="text-center py-12 animate-fade-in">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading outlets...</p>
          </div>
        ) : filteredOutlets.length === 0 ? (
          <div className="text-center py-20 animate-fade-in">
            <p className="text-gray-600 mb-6 text-lg">No outlets found.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-6 py-3 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-colors font-medium">
              Go back home
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 animate-slide-up">
            {filteredOutlets.map((outlet) => (
              <Link
                key={outlet.id}
                to={`/outlets/${outlet.id}?airportId=${id}${gateNumber ? `&gate=${gateNumber}` : ''}`}
                className="glass rounded-2xl overflow-hidden hover:shadow-xl transition-all duration-300 group border border-white/50 hover:border-orange-200 transform hover:-translate-y-2 block"
              >
                {/* Outlet Image */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-100 to-orange-50">
                  {outlet.image ? (
                    <img
                      src={outlet.image}
                      alt={outlet.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        const svg = `data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23f97316'/%3E%3Ctext x='50%25' y='50%25' dominant-baseline='middle' text-anchor='middle' font-family='sans-serif' font-size='24' fill='white'%3E${encodeURIComponent(outlet.name)}%3C/text%3E%3C/svg%3E`
                        e.currentTarget.src = svg
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <FaUtensils className="text-6xl text-orange-300" />
                    </div>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent group-hover:from-black/30 transition-all duration-300"></div>
                </div>

                {/* Card Content */}
                <div className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="text-xl font-bold text-gray-900 font-display mb-2 group-hover:text-orange-600 transition-colors">{outlet.name}</h3>
                      <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
                        <FaUtensils />
                        <span className="font-medium">{outlet.category}</span>
                      </div>
                    </div>
                  </div>
                  {outlet.description && (
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2">{outlet.description}</p>
                  )}
                  <div className="flex items-center justify-between text-sm pt-3 border-t border-gray-100">
                    {outlet.terminal && (
                      <span className="text-gray-500 flex items-center gap-1">
                        <FaMapMarkerAlt />
                        Terminal {outlet.terminal}
                      </span>
                    )}
                    {outlet.distance !== undefined && outlet.distance !== null && (
                      <span className="text-orange-600 font-medium">
                        {outlet.distance.toFixed(2)} km
                      </span>
                    )}
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-100">
                    <p className="text-xs text-gray-500 flex items-center justify-between">
                      <span>{outlet.menuItems.length} {outlet.menuItems.length === 1 ? 'item' : 'items'} available</span>
                      <span className="text-orange-600 font-semibold group-hover:translate-x-1 transition-transform">View Menu →</span>
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  )
}
