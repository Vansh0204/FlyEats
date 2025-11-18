import { useEffect, useState } from 'react'
import { useParams, useSearchParams, Link } from 'react-router-dom'
import { FaArrowLeft, FaMapMarkerAlt, FaUtensils, FaSearch } from 'react-icons/fa'

interface Outlet {
  id: string
  name: string
  description?: string
  category: string
  terminal?: string
  distance?: number
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
    fetch(url)
      .then((res) => res.json())
      .then((data) => {
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
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/" className="text-gray-600 hover:text-orange-600">
            <FaArrowLeft className="text-xl" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 flex-1">Outlets</h1>
          <Link
            to="/pnr?redirect=/airports"
            className="px-3 py-2 text-sm text-gray-700 border border-orange-500 rounded-lg hover:bg-orange-50 transition-colors"
          >
            Change PNR
          </Link>
          {gateNumber && (
            <span className="text-sm text-gray-600 bg-gray-100 px-3 py-1 rounded-full">
              Gate {gateNumber}
            </span>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="mb-6 relative">
          <FaSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search outlets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-12 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
          />
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-600">Loading outlets...</p>
          </div>
        ) : filteredOutlets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No outlets found.</p>
            <Link to="/" className="text-orange-600 hover:underline">
              Go back home
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredOutlets.map((outlet) => (
              <Link
                key={outlet.id}
                to={`/outlets/${outlet.id}?airportId=${id}${gateNumber ? `&gate=${gateNumber}` : ''}`}
                className="bg-white rounded-xl shadow-md hover:shadow-lg transition-shadow p-6 border border-gray-100 hover:border-orange-200"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-gray-900 mb-1">{outlet.name}</h3>
                    <div className="flex items-center gap-2 text-sm text-orange-600 mb-2">
                      <FaUtensils />
                      <span>{outlet.category}</span>
                    </div>
                  </div>
                </div>
                {outlet.description && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">{outlet.description}</p>
                )}
                <div className="flex items-center justify-between text-sm">
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
                  <p className="text-xs text-gray-500">
                    {outlet.menuItems.length} {outlet.menuItems.length === 1 ? 'item' : 'items'} available
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

