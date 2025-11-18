import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { FaPlane, FaArrowLeft } from 'react-icons/fa'
import { apiFetch } from '../lib/api'

async function checkUserBooking(userId: string): Promise<boolean> {
  try {
    const response = await apiFetch(`/api/pnr/user/${userId}`)
    if (response.ok) {
      const data = await response.json()
      return !!data.booking
    }
    return false
  } catch {
    return false
  }
}

export default function Login() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/airports'

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await apiFetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      })

      const data = await response.json()

      if (response.ok) {
        sessionStorage.setItem('userId', data.user.id)
        sessionStorage.setItem('user', JSON.stringify(data.user))
        
        // Trigger storage event to update other components
        window.dispatchEvent(new Event('storage'))
        
        // Check if there's a pending outlet or if user needs to enter PNR
        const pendingOutlet = sessionStorage.getItem('pendingOutlet')
        const hasBooking = await checkUserBooking(data.user.id)
        
        if (pendingOutlet) {
          // User clicked a dish/outlet, check if they have PNR
          const outletData = JSON.parse(pendingOutlet)
          sessionStorage.removeItem('pendingOutlet')
          
          if (!hasBooking) {
            // No PNR, ask for it, then go to outlet
            navigate(`/pnr?redirect=/outlets/${outletData.outletId}?airportId=${outletData.airportId}`)
          } else {
            // Has PNR, go directly to outlet
            navigate(`/outlets/${outletData.outletId}?airportId=${outletData.airportId}`)
          }
        } else if (redirect === '/outlet') {
          // Handle redirect to outlet
          const pendingOutlet = sessionStorage.getItem('pendingOutlet')
          if (pendingOutlet) {
            const outletData = JSON.parse(pendingOutlet)
            sessionStorage.removeItem('pendingOutlet')
            if (!hasBooking) {
              navigate(`/pnr?redirect=/outlets/${outletData.outletId}?airportId=${outletData.airportId}`)
            } else {
              navigate(`/outlets/${outletData.outletId}?airportId=${outletData.airportId}`)
            }
          } else {
            // No pending outlet but redirect is /outlet - check PNR first
            if (!hasBooking) {
              navigate('/pnr?redirect=/airports')
            } else {
              navigate('/airports')
            }
          }
        } else if (redirect.includes('/dish/')) {
          // Handle old dish/outlets redirects - redirect to home
          navigate('/airports')
        } else if (redirect.includes('/outlets/')) {
          // If redirect is to an outlet page, check PNR first
          if (!hasBooking) {
            navigate(`/pnr?redirect=${redirect}`)
          } else {
            navigate(redirect)
          }
        } else {
          // Normal login - check if PNR is needed
          if (!hasBooking && redirect === '/airports') {
            // User logged in directly, ask for PNR
            navigate('/pnr?redirect=/airports')
          } else {
            navigate(redirect)
          }
        }
      } else {
        setError(data.error || 'Login failed')
      }
    } catch (err) {
      setError('An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 to-orange-100 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-6">
          <FaArrowLeft />
          <span>Back to home</span>
        </Link>

        <div className="bg-white rounded-xl shadow-lg p-8">
          <div className="flex items-center justify-center gap-2 mb-8">
            <FaPlane className="text-orange-500 text-3xl" />
            <h1 className="text-3xl font-bold text-orange-600">FlyEats</h1>
          </div>

          <h2 className="text-2xl font-bold text-center mb-6">Login</h2>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Password
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>

          <p className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to={`/register?redirect=${redirect}`} className="text-orange-600 hover:underline">
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

