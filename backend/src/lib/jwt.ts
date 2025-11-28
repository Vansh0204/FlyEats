import jwt, { SignOptions } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'
const JWT_ACCESS_EXPIRY: string = process.env.JWT_ACCESS_EXPIRY || '1h'
const JWT_REFRESH_EXPIRY: string = process.env.JWT_REFRESH_EXPIRY || '7d'

export interface TokenPayload {
    userId: string
    email: string
    type: 'access' | 'refresh'
}

export function generateAccessToken(userId: string, email: string): string {
    const payload: TokenPayload = {
        userId,
        email,
        type: 'access',
    }

    const options: SignOptions = {
        expiresIn: JWT_ACCESS_EXPIRY as any,
    }

    return jwt.sign(payload, JWT_SECRET, options)
}

export function generateRefreshToken(userId: string, email: string): string {
    const payload: TokenPayload = {
        userId,
        email,
        type: 'refresh',
    }

    const options: SignOptions = {
        expiresIn: JWT_REFRESH_EXPIRY as any,
    }

    return jwt.sign(payload, JWT_SECRET, options)
}

export function verifyToken(token: string): TokenPayload {
    try {
        const decoded = jwt.verify(token, JWT_SECRET) as TokenPayload
        return decoded
    } catch (error) {
        throw new Error('Invalid or expired token')
    }
}

export function decodeToken(token: string): TokenPayload | null {
    try {
        const decoded = jwt.decode(token) as TokenPayload
        return decoded
    } catch (error) {
        return null
    }
}
