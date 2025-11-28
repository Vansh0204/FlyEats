import { useState } from 'react'
import { useNavigate, useSearchParams, Link } from 'react-router-dom'
import { FaPlane, FaArrowLeft } from 'react-icons/fa'
import { useAuth } from '../contexts/AuthContext'
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

export default function Register() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const redirect = searchParams.get('redirect') || '/airports'
  const { register } = useAuth()

  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      await register(email, password, name || undefined, phone || undefined)

      // Get user ID from the register response
      const response = await apiFetch('/api/auth/me')
      const { user } = await response.json()

      // Check if there's a pending outlet or if user needs to enter PNR
      const pendingOutlet = sessionStorage.getItem('pendingOutlet')
      const hasBooking = await checkUserBooking(user.id)

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
      } else {
        // For all other cases, check PNR first
        if (!hasBooking) {
          // If redirect is already /pnr, don't loop
          if (redirect.startsWith('/pnr')) {
            navigate(redirect)
          } else {
            // Redirect to PNR, then to original destination
            navigate(`/pnr?redirect=${encodeURIComponent(redirect)}`)
          }
        } else {
          navigate(redirect)
        }
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-orange-100 flex items-center justify-center px-4 font-sans relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-20 -right-20 w-96 h-96 bg-orange-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-20 -left-20 w-96 h-96 bg-blue-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>

      <div className="w-full max-w-md relative z-10">
        <Link to="/" className="inline-flex items-center gap-2 text-gray-600 hover:text-orange-600 mb-8 transition-colors group">
          <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" />
          <span className="font-medium">Back to home</span>
        </Link>

        <div className="glass p-8 rounded-2xl shadow-xl border border-white/50">
          <div className="flex items-center justify-center gap-2 mb-8">
            <div className="bg-orange-500 p-2 rounded-lg text-white">
              <FaPlane className="text-2xl" />
            </div>
            <h1 className="text-3xl font-bold text-gray-900 font-display">Fly<span className="text-orange-600">Eats</span></h1>
          </div>

          <h2 className="text-2xl font-bold text-center mb-2 font-display text-gray-900">Create Account</h2>
          <p className="text-center text-gray-500 mb-8">Join us to order food seamlessly</p>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Name (Optional)
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                placeholder="John Doe"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Email *
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                placeholder="name@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Phone (Optional)
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                placeholder="+1 234 567 8900"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Password *
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
                className="w-full px-4 py-3 bg-white/50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-all outline-none"
                placeholder="••••••••"
              />
              <p className="text-xs text-gray-500 mt-1.5 ml-1">Minimum 6 characters</p>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-6 py-3.5 bg-orange-600 text-white rounded-xl hover:bg-orange-700 transition-all transform hover:scale-[1.02] active:scale-[0.98] font-semibold shadow-lg shadow-orange-200 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p className="mt-8 text-center text-gray-600 text-sm">
            Already have an account?{' '}
            <Link to={`/login?redirect=${redirect}`} className="text-orange-600 hover:text-orange-700 font-semibold hover:underline">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

