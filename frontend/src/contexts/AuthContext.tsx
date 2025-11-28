import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { apiFetch } from '../lib/api'
import {
    saveTokens,
    getAccessToken,
    getRefreshToken,
    removeTokens,
    saveUser,
    getUser,
    removeUser,
    isTokenExpired,
    User,
} from '../lib/authUtils'

interface AuthContextType {
    user: User | null
    isAuthenticated: boolean
    isLoading: boolean
    login: (email: string, password: string) => Promise<void>
    register: (email: string, password: string, name?: string, phone?: string) => Promise<void>
    logout: () => void
    refreshAccessToken: () => Promise<boolean>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null)
    const [isLoading, setIsLoading] = useState(true)

    // Initialize auth state from localStorage
    useEffect(() => {
        const initAuth = async () => {
            const storedUser = getUser()
            const accessToken = getAccessToken()

            if (storedUser && accessToken) {
                // Check if token is expired
                if (isTokenExpired(accessToken)) {
                    // Try to refresh the token
                    const refreshed = await refreshAccessToken()
                    if (!refreshed) {
                        // Refresh failed, clear auth state
                        removeTokens()
                        removeUser()
                        setUser(null)
                    } else {
                        setUser(storedUser)
                    }
                } else {
                    setUser(storedUser)
                }
            }

            setIsLoading(false)
        }

        initAuth()
    }, [])

    // Auto-refresh token before expiration
    useEffect(() => {
        if (!user) return

        const interval = setInterval(async () => {
            const accessToken = getAccessToken()
            if (accessToken && isTokenExpired(accessToken)) {
                await refreshAccessToken()
            }
        }, 5 * 60 * 1000) // Check every 5 minutes

        return () => clearInterval(interval)
    }, [user])

    const login = async (email: string, password: string) => {
        const response = await apiFetch('/api/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Login failed')
        }

        const data = await response.json()
        saveTokens(data.accessToken, data.refreshToken)
        saveUser(data.user)
        setUser(data.user)
    }

    const register = async (
        email: string,
        password: string,
        name?: string,
        phone?: string
    ) => {
        const response = await apiFetch('/api/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password, name, phone }),
        })

        if (!response.ok) {
            const error = await response.json()
            throw new Error(error.error || 'Registration failed')
        }

        const data = await response.json()
        saveTokens(data.accessToken, data.refreshToken)
        saveUser(data.user)
        setUser(data.user)
    }

    const logout = () => {
        removeTokens()
        removeUser()
        setUser(null)

        // Optional: Call backend logout endpoint
        const accessToken = getAccessToken()
        if (accessToken) {
            apiFetch('/api/auth/logout', {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            }).catch(() => {
                // Ignore errors on logout
            })
        }
    }

    const refreshAccessToken = async (): Promise<boolean> => {
        try {
            const refreshToken = getRefreshToken()
            if (!refreshToken) return false

            const response = await apiFetch('/api/auth/refresh', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ refreshToken }),
            })

            if (!response.ok) return false

            const data = await response.json()
            const currentRefreshToken = getRefreshToken()
            if (currentRefreshToken) {
                saveTokens(data.accessToken, currentRefreshToken)
            }
            return true
        } catch {
            return false
        }
    }

    const value: AuthContextType = {
        user,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        refreshAccessToken,
    }

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextType {
    const context = useContext(AuthContext)
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}
