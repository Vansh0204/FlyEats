// Token storage keys
const ACCESS_TOKEN_KEY = 'flyeats_access_token'
const REFRESH_TOKEN_KEY = 'flyeats_refresh_token'
const USER_KEY = 'flyeats_user'

export interface User {
    id: string
    email: string
    name: string | null
    phone: string | null
}

// Token storage functions
export function saveTokens(accessToken: string, refreshToken: string): void {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken)
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken)
}

export function getAccessToken(): string | null {
    return localStorage.getItem(ACCESS_TOKEN_KEY)
}

export function getRefreshToken(): string | null {
    return localStorage.getItem(REFRESH_TOKEN_KEY)
}

export function removeTokens(): void {
    localStorage.removeItem(ACCESS_TOKEN_KEY)
    localStorage.removeItem(REFRESH_TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
}

// User storage functions
export function saveUser(user: User): void {
    localStorage.setItem(USER_KEY, JSON.stringify(user))
    // Also save userId to sessionStorage for backward compatibility
    sessionStorage.setItem('userId', user.id)
}

export function getUser(): User | null {
    const userStr = localStorage.getItem(USER_KEY)
    if (!userStr) return null

    try {
        return JSON.parse(userStr)
    } catch {
        return null
    }
}

export function removeUser(): void {
    localStorage.removeItem(USER_KEY)
    sessionStorage.removeItem('userId')
}

// Decode JWT token (without verification - for client-side only)
export function decodeToken(token: string): any {
    try {
        const base64Url = token.split('.')[1]
        const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
        const jsonPayload = decodeURIComponent(
            atob(base64)
                .split('')
                .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                .join('')
        )
        return JSON.parse(jsonPayload)
    } catch {
        return null
    }
}

// Check if token is expired
export function isTokenExpired(token: string): boolean {
    const decoded = decodeToken(token)
    if (!decoded || !decoded.exp) return true

    // Check if token expires in the next 5 minutes
    const expirationTime = decoded.exp * 1000
    const now = Date.now()
    const bufferTime = 5 * 60 * 1000 // 5 minutes

    return expirationTime - now < bufferTime
}

// Validate token format
export function isValidTokenFormat(token: string): boolean {
    return token.split('.').length === 3
}
