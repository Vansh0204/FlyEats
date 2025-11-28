import { Request, Response, NextFunction } from 'express'
import { verifyToken, TokenPayload } from '../lib/jwt'

// Extend Express Request type to include user
export interface AuthRequest extends Request {
    user?: TokenPayload
}

export function authMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        // Get token from Authorization header
        const authHeader = req.headers.authorization

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({ error: 'No token provided' })
            return
        }

        const token = authHeader.substring(7) // Remove 'Bearer ' prefix

        // Verify token
        const decoded = verifyToken(token)

        // Check if it's an access token
        if (decoded.type !== 'access') {
            res.status(401).json({ error: 'Invalid token type' })
            return
        }

        // Attach user info to request
        req.user = decoded

        next()
    } catch (error) {
        res.status(401).json({ error: 'Invalid or expired token' })
    }
}

// Optional middleware - doesn't fail if no token
export function optionalAuthMiddleware(
    req: AuthRequest,
    res: Response,
    next: NextFunction
): void {
    try {
        const authHeader = req.headers.authorization

        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.substring(7)
            const decoded = verifyToken(token)

            if (decoded.type === 'access') {
                req.user = decoded
            }
        }
    } catch (error) {
        // Silently fail for optional auth
    }

    next()
}
