import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { PrismaClient } from '@prisma/client'
// Import setup FIRST to set DATABASE_URL before app loads PrismaClient
import { setupTestDB, teardownTestDB, cleanDB } from './helpers/setup.js'
import { app } from '../index.js'
import { createTrainer, createTrainee, loginAs, authRequest } from './helpers/auth-helper.js'

let db: PrismaClient

beforeAll(async () => {
  db = await setupTestDB()
})

afterAll(async () => {
  await teardownTestDB()
})

beforeEach(async () => {
  await cleanDB(db)
})

describe('POST /api/auth/login', () => {
  test('returns user and sets cookie on valid credentials', async () => {
    const trainer = await createTrainer(db)

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: trainer.email, password: 'password123' }),
    })

    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(trainer.id)
    expect(body.email).toBe(trainer.email)
    expect(body.role).toBe('TRAINER')
    expect(res.headers.get('set-cookie')).toContain('token=')
  })

  test('returns 401 for wrong password', async () => {
    await createTrainer(db)

    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'trainer@test.com', password: 'wrong' }),
    })

    expect(res.status).toBe(401)
  })

  test('returns 401 for non-existent user', async () => {
    const res = await app.request('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'nobody@test.com', password: 'password123' }),
    })

    expect(res.status).toBe(401)
  })
})

describe('POST /api/auth/logout', () => {
  test('clears the token cookie', async () => {
    await createTrainer(db)
    const cookie = await loginAs('trainer@test.com')

    const res = await authRequest('/api/auth/logout', cookie, { method: 'POST' })
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toEqual({ ok: true })
  })
})

describe('GET /api/auth/me', () => {
  test('returns current user when authenticated', async () => {
    const trainer = await createTrainer(db)
    const cookie = await loginAs(trainer.email)

    const res = await authRequest('/api/auth/me', cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body.id).toBe(trainer.id)
    expect(body.email).toBe(trainer.email)
  })

  test('returns 401 without auth cookie', async () => {
    const res = await app.request('/api/auth/me')
    expect(res.status).toBe(401)
  })
})
