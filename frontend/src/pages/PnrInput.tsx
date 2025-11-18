import { useState, useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { FaPlane, FaMapMarkerAlt, FaClock } from 'react-icons/fa'
import { apiFetch } from '../lib/api'

export default function PnrInput() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/airports'
  const userId = sessionStorage.getItem('userId')

  const [pnr, setPnr] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [pnrData, setPnrData] = useState<any>(null)

  useEffect(() => {
    if (!userId) {
      navigate('/login?redirect=' + redirect)
    }
  }, [userId, navigate, redirect])

  const handlePnrLookup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch('/api/pnr/lookup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ pnr }),
      })

      const data = await response.json()

      if (response.ok) {
        setPnrData(data)
        
        // Save PNR to user's account
        await apiFetch('/api/pnr/save', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            pnr: data.pnr,
            flightNumber: data.flightNumber,
            gateNumber: data.gateNumber,
            terminal: data.terminal,
            boardingTime: data.boardingTime,
            airportId: data.airport?.id,
          }),
        })

        // Navigate to redirect with PNR data
        const pendingOutlet = sessionStorage.getItem('pendingOutlet')
        if (pendingOutlet) {
          const outletData = JSON.parse(pendingOutlet)
          sessionStorage.removeItem('pendingOutlet')
          navigate(`/outlets/${outletData.outletId}?airportId=${outletData.airportId}`)
        } else if (redirect) {
          navigate(redirect)
        } else {
          navigate('/')
        }
      } else {
        setError(data.error || 'Invalid PNR. Please check and try again.')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-6">
            <FaPlane className="text-orange-500 text-3xl" />
            <h1 className="text-2xl font-bold text-orange-600">Enter Your PNR</h1>
          </div>

          <p className="text-gray-600 text-center mb-6">
            Enter your PNR (Passenger Name Record) to fetch your flight details including gate number and boarding time.
          </p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          {pnrData && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
              <div className="flex items-center gap-2 mb-2">
                <FaMapMarkerAlt className="text-green-600" />
                <span className="font-semibold">Gate: {pnrData.gateNumber}</span>
              </div>
              <div className="flex items-center gap-2 mb-2">
                <FaClock className="text-green-600" />
                <span>Boarding: {new Date(pnrData.boardingTime).toLocaleString()}</span>
              </div>
              <p className="text-sm text-gray-600">Flight: {pnrData.flightNumber}</p>
            </div>
          )}

          <form onSubmit={handlePnrLookup} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                PNR Number
              </label>
              <input
                type="text"
                value={pnr}
                onChange={(e) => setPnr(e.target.value.toUpperCase())}
                placeholder="Enter 6-10 character PNR"
                required
                minLength={6}
                maxLength={10}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 text-lg uppercase"
              />
              <p className="text-xs text-gray-500 mt-1">
                Your PNR is usually found on your ticket or booking confirmation
              </p>
            </div>

            <button
              type="submit"
              disabled={loading || pnr.length < 6}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Looking up PNR...' : 'Continue'}
            </button>
          </form>

          <button
            onClick={() => {
              // Clear any pending outlet when skipping
              sessionStorage.removeItem('pendingOutlet')
              
              // If redirect is /airports, try to get nearest airport and go to its outlets
              if (redirect === '/airports' || redirect.includes('/airports')) {
                // Try to get airport ID from nearest airport or redirect to airports list
                const nearestAirport = sessionStorage.getItem('nearestAirport')
                if (nearestAirport) {
                  try {
                    const airport = JSON.parse(nearestAirport)
                    navigate(`/airports/${airport.id}/outlets`)
                  } catch {
                    navigate('/airports')
                  }
                } else {
                  navigate('/airports')
                }
              } else {
                navigate(redirect)
              }
            }}
            className="w-full mt-4 px-6 py-2 text-gray-600 hover:text-orange-600 transition-colors"
          >
            Skip for now
          </button>
        </div>
      </div>
    </div>
  )
}

