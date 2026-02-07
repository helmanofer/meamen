import { Hono } from 'hono'
import type { Context, Next } from 'hono'
import { setCookie, deleteCookie } from 'hono/cookie'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.js'
import { signToken, authMiddleware } from '../middleware/auth.js'

const auth = new Hono<{ Variables: { userId: string; role: string } }>()

auth.post('/login', async (c) => {
  const { email, password } = await c.req.json()

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const valid = await bcrypt.compare(password, user.passwordHash)
  if (!valid) {
    return c.json({ error: 'Invalid credentials' }, 401)
  }

  const token = signToken({ userId: user.id, role: user.role })
  setCookie(c, 'token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Lax',
    maxAge: 60 * 60 * 24 * 7,
    path: '/',
  })

  return c.json({ id: user.id, name: user.name, email: user.email, role: user.role })
})

auth.post('/logout', (c) => {
  deleteCookie(c, 'token', { path: '/' })
  return c.json({ ok: true })
})

auth.get('/me', authMiddleware, async (c) => {
  const userId = c.get('userId')
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, email: true, role: true },
  })
  if (!user) {
    return c.json({ error: 'User not found' }, 404)
  }
  return c.json(user)
})

export default auth
