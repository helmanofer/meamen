import type { Context, Next } from 'hono'
import { getCookie } from 'hono/cookie'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export interface JwtPayload {
  userId: string
  role: string
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload
}

export async function authMiddleware(c: Context<{ Variables: { userId: string; role: string } }>, next: Next) {
  const token = getCookie(c, 'token')
  if (!token) {
    return c.json({ error: 'Unauthorized' }, 401)
  }

  try {
    const payload = verifyToken(token)
    c.set('userId', payload.userId)
    c.set('role', payload.role)
    await next()
  } catch {
    return c.json({ error: 'Invalid token' }, 401)
  }
}

export function trainerOnly(c: Context<{ Variables: { userId: string; role: string } }>, next: Next) {
  if (c.get('role') !== 'TRAINER') {
    return new Response(JSON.stringify({ error: 'Trainers only' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }
  return next()
}
