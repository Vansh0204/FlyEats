import { useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'

/**
 * AirportDetail page - automatically redirects to outlets page
 * Gate number is fetched from PNR booking if available
 * Users can change gate number during checkout if needed
 */
export default function AirportDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()

  useEffect(() => {
    // Get gate number from PNR booking if available
    const userId = sessionStorage.getItem('userId')
    
    if (userId) {
      fetch(`/api/pnr/user/${userId}`)
        .then((res) => res.json())
        .then((data) => {
          const gateNumber = data.booking?.gateNumber || ''
          // Redirect directly to outlets page with gate number from PNR
          navigate(`/airports/${id}/outlets${gateNumber ? `?gate=${gateNumber}` : ''}`)
        })
        .catch(() => {
          // If no booking or error, just redirect to outlets
          navigate(`/airports/${id}/outlets`)
        })
    } else {
      // No user, just redirect to outlets
      navigate(`/airports/${id}/outlets`)
    }
  }, [id, navigate])

  // Show loading while redirecting
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
        <p className="mt-4 text-gray-600">Loading outlets...</p>
      </div>
    </div>
  )
}
