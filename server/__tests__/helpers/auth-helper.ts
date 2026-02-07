import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'
import { app } from '../../index.js'

const DEFAULT_PASSWORD = 'password123'

export async function createTrainer(db: PrismaClient, overrides: { email?: string; name?: string } = {}) {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  return db.user.create({
    data: {
      email: overrides.email || 'trainer@test.com',
      name: overrides.name || 'Test Trainer',
      passwordHash: hash,
      role: 'TRAINER',
    },
  })
}

export async function createTrainee(db: PrismaClient, overrides: { email?: string; name?: string } = {}) {
  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  return db.user.create({
    data: {
      email: overrides.email || 'trainee@test.com',
      name: overrides.name || 'Test Trainee',
      passwordHash: hash,
      role: 'TRAINEE',
    },
  })
}

export async function linkTrainerTrainee(db: PrismaClient, trainerId: string, traineeId: string) {
  return db.trainerTrainee.create({
    data: { trainerId, traineeId },
  })
}

export async function loginAs(email: string, password = DEFAULT_PASSWORD): Promise<string> {
  const res = await app.request('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  })
  const setCookie = res.headers.get('set-cookie')
  if (!setCookie) throw new Error('No set-cookie header in login response')
  // Extract the token cookie value
  const match = setCookie.match(/token=([^;]+)/)
  if (!match) throw new Error('No token cookie found')
  return `token=${match[1]}`
}

export function authRequest(path: string, cookie: string, options: RequestInit = {}) {
  return app.request(path, {
    ...options,
    headers: {
      ...options.headers,
      Cookie: cookie,
    },
  })
}

export function authJSON(path: string, cookie: string, method: string, body: Record<string, unknown>) {
  return app.request(path, {
    method,
    headers: {
      'Content-Type': 'application/json',
      Cookie: cookie,
    },
    body: JSON.stringify(body),
  })
}
