import { Hono } from 'hono'
import bcrypt from 'bcryptjs'
import { prisma } from '../db.js'
import { authMiddleware, trainerOnly } from '../middleware/auth.js'

const trainees = new Hono<{ Variables: { userId: string; role: string } }>()

trainees.use('*', authMiddleware, trainerOnly)

// List all trainees for the current trainer
trainees.get('/', async (c) => {
  const trainerId = c.get('userId')

  const relations = await prisma.trainerTrainee.findMany({
    where: { trainerId },
    include: {
      trainee: {
        select: { id: true, name: true, email: true, createdAt: true },
      },
    },
  })

  return c.json(relations.map((r) => r.trainee))
})

// Add a new trainee
trainees.post('/', async (c) => {
  const trainerId = c.get('userId')
  const body = await c.req.json()
  const { name, email, password } = body

  if (!name || !email || !password) {
    return c.text('Missing required fields', 400)
  }

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    return c.text('Email already in use', 400)
  }

  const passwordHash = await bcrypt.hash(password, 10)

  const trainee = await prisma.user.create({
    data: { name, email, passwordHash, role: 'TRAINEE' },
  })

  await prisma.trainerTrainee.create({
    data: { trainerId, traineeId: trainee.id },
  })

  c.status(201)
  return c.json(
    { id: trainee.id, name: trainee.name, email: trainee.email }
  )
})

// Update a trainee
trainees.put('/:id', async (c) => {
  const trainerId = c.get('userId')
  const traineeId = c.req.param('id')
  const { name, email } = await c.req.json()

  // Verify trainer-trainee relationship
  const relation = await prisma.trainerTrainee.findFirst({
    where: { trainerId, traineeId },
  })
  if (!relation) {
    return c.json({ error: 'Not found' }, 404)
  }

  // Check email uniqueness if changing email
  if (email) {
    const existing = await prisma.user.findUnique({ where: { email } })
    if (existing && existing.id !== traineeId) {
      return c.json({ error: 'Email already in use' }, 400)
    }
  }

  const updated = await prisma.user.update({
    where: { id: traineeId },
    data: {
      ...(name !== undefined ? { name } : {}),
      ...(email !== undefined ? { email } : {}),
    },
    select: { id: true, name: true, email: true },
  })

  return c.json(updated)
})

// Delete a trainee relationship
trainees.delete('/:id', async (c) => {
  const trainerId = c.get('userId')
  const traineeId = c.req.param('id')

  await prisma.trainerTrainee.deleteMany({
    where: { trainerId, traineeId },
  })

  return c.json({ ok: true })
})

export default trainees
