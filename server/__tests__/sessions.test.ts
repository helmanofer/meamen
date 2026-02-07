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

describe('GET /api/sessions', () => {
  test('trainer sees sessions they created', async () => {
    const trainer = await createTrainer(db)
    const trainee = await createTrainee(db)
    await linkTrainerTrainee(db, trainer.id, trainee.id)

    await db.session.create({
      data: { name: 'Upper Body', trainerId: trainer.id, traineeId: trainee.id },
    })

    const cookie = await loginAs(trainer.email)
    const res = await authRequest('/api/sessions', cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].name).toBe('Upper Body')
  })

  test('trainee sees only their sessions', async () => {
    const trainer = await createTrainer(db)
    const trainee = await createTrainee(db)
    await linkTrainerTrainee(db, trainer.id, trainee.id)

    await db.session.create({
      data: { name: 'Leg Day', trainerId: trainer.id, traineeId: trainee.id },
    })

    const cookie = await loginAs(trainee.email)
    const res = await authRequest('/api/sessions', cookie)
    expect(res.status).toBe(200)
    const body = await res.json()
    expect(body).toHaveLength(1)
    expect(body[0].name).toBe('Leg Day')
  })
})

describe('POST /api/sessions', () => {
  test('trainer creates a session', async () => {
    const trainer = await createTrainer(db)
    const trainee = await createTrainee(db)
    await linkTrainerTrainee(db, trainer.id, trainee.id)
    const cookie = await loginAs(trainer.email)

    const res = await authJSON('/api/sessions', cookie, 'POST', {
      name: 'New Session',
      traineeId: trainee.id,
    })

    expect(res.status).toBe(201)
    const body = await res.json()
    expect(body.name).toBe('New Session')
    expect(body.traineeId).toBe(trainee.id)
  })

  test('trainee cannot create sessions', async () => {
    await createTrainer(db)
    const trainee = await createTrainee(db)
    const cookie = await loginAs(trainee.email)

    const res = await authJSON('/api/sessions', cookie, 'POST', {
      name: 'Hack Session',
      traineeId: trainee.id,
    })

    expect(res.status).toBe(403)
  })
})

describe('DELETE /api/sessions/:id', () => {
  test('trainer deletes their session', async () => {
    const trainer = await createTrainer(db)
    const trainee = await createTrainee(db)
    await linkTrainerTrainee(db, trainer.id, trainee.id)

    const session = await db.session.create({
      data: { name: 'To Delete', trainerId: trainer.id, traineeId: trainee.id },
    })

    const cookie = await loginAs(trainer.email)
    const res = await authRequest(`/api/sessions/${session.id}`, cookie, { method: 'DELETE' })
    expect(res.status).toBe(200)

    // Verify session is gone
    const listRes = await authRequest('/api/sessions', cookie)
    const sessions = await listRes.json()
    expect(sessions).toHaveLength(0)
  })
})
