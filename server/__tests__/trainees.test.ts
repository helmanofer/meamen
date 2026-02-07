import { describe, test, expect, beforeAll, afterAll, beforeEach } from 'bun:test'
import { PrismaClient } from '@prisma/client'
// Import setup FIRST to set DATABASE_URL before app loads PrismaClient
import { setupTestDB, teardownTestDB, cleanDB } from './helpers/setup.js'
import { createTrainer, createTrainee, linkTrainerTrainee, loginAs, authRequest, authJSON } from './helpers/auth-helper.js'

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

describe('GET /api/trainees', () => {
  test('trainer sees their trainees', async () => {
    const trainer = await createTrainer(db)
    const trainee = await createTrainee(db)
    await linkTrainerTrainee(db, trainer.id, trainee.id)
    const cookie = await loginAs(trainer.email)

    const res = await authRequest('/api/trainees', cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].id).toBe(trainee.id)
  })

  test('trainee gets 403', async () => {
    await createTrainee(db)
    const cookie = await loginAs('trainee@test.com')

    const res = await authRequest('/api/trainees', cookie)
    expect(res.status).toBe(403)
  })
})

describe('POST /api/trainees', () => {
  test('trainer creates a new trainee', async () => {
    await createTrainer(db)
    const cookie = await loginAs('trainer@test.com')

    const res = await authJSON('/api/trainees', cookie, 'POST', {
      name: 'New Trainee',
      email: 'new@test.com',
      password: 'password123',
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.name).toBe('New Trainee')
    expect(body.email).toBe('new@test.com')

    // Verify trainee is linked to trainer
    const listRes = await authRequest('/api/trainees', cookie)
    const trainees = await listRes.json()
    expect(trainees).toHaveLength(1)
  })
})

describe('DELETE /api/trainees/:id', () => {
  test('trainer removes trainee relationship', async () => {
    const trainer = await createTrainer(db)
    const trainee = await createTrainee(db)
    await linkTrainerTrainee(db, trainer.id, trainee.id)
    const cookie = await loginAs(trainer.email)

    const res = await authRequest(`/api/trainees/${trainee.id}`, cookie, { method: 'DELETE' })
    expect(res.status).toBe(200)

    // Verify trainee is no longer listed
    const listRes = await authRequest('/api/trainees', cookie)
    const trainees = await listRes.json()
    expect(trainees).toHaveLength(0)
  })
})
