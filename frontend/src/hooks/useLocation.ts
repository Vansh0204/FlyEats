import { useState, useEffect } from 'react'
import { apiFetch } from '../lib/api'

interface Location {
  latitude: number
  longitude: number
}

interface Airport {
  id: string
  name: string
  code: string
  city: string
  distance?: number
}

export function useLocation() {
  const [location, setLocation] = useState<Location | null>(null)
  const [nearestAirport, setNearestAirport] = useState<Airport | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [permissionDenied, setPermissionDenied] = useState(false)

  useEffect(() => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser')
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords
        console.log('📍 User location detected:', { latitude, longitude })
        setLocation({ latitude, longitude })

        // Find nearest airport
        try {
          const response = await apiFetch(
            `/api/airports/nearest?lat=${latitude}&lng=${longitude}`
          )
          if (response.ok) {
            const data = await response.json()
            console.log('✈️ Nearest airport:', data.airport)
            setNearestAirport(data.airport)
          } else {
            const errorData = await response.json()
            console.error('Error response:', errorData)
          }
        } catch (err) {
          console.error('Error finding nearest airport:', err)
        }
        setLoading(false)
      },
      (err) => {
        console.error('Geolocation error:', err)
        if (err.code === err.PERMISSION_DENIED) {
          setPermissionDenied(true)
        }
        setError(err.message)
        setLoading(false)
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 0, // Always get fresh location
      }
    )
  }, [])

  const requestLocation = () => {
    setPermissionDenied(false)
    setError(null)
    setLoading(true)
    // Trigger the effect again
    window.location.reload()
  }

  return {
    location,
    nearestAirport,
    loading,
    error,
    permissionDenied,
    requestLocation,
  }
}

