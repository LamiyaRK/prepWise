import { Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'

export type Role = 'USER' | 'ADMIN'

export interface AuthRequest extends Request {
  userId?: string
  userRole?: Role
}

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const token = req.headers.authorization?.split(' ')[1]
  if (!token) return res.status(401).json({ error: 'No token provided' })

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { userId: string; role: Role }
    req.userId = decoded.userId
    req.userRole = decoded.role
    next()
  } catch {
    res.status(401).json({ error: 'Invalid token' })
  }
}

/**
 * Role-gate a route. Must be used AFTER `protect` since it relies on
 * `req.userRole` being populated from the JWT.
 *
 * Usage: router.post('/', protect, requireRole('ADMIN'), postJob)
 */
export const requireRole = (...allowed: Role[]) => {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.userRole || !allowed.includes(req.userRole)) {
      return res.status(403).json({ error: 'You do not have permission to perform this action' })
    }
    next()
  }
}
