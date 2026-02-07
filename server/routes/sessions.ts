import { Hono } from 'hono'
import { prisma } from '../db.js'
import { authMiddleware, trainerOnly } from '../middleware/auth.js'

const sessions = new Hono<{ Variables: { userId: string; role: string } }>()

sessions.use('*', authMiddleware)

// List sessions - trainer sees all their created sessions, trainee sees only their own
sessions.get('/', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const traineeId = c.req.query('traineeId')

  const where =
    role === 'TRAINER'
      ? { trainerId: userId, ...(traineeId ? { traineeId } : {}) }
      : { traineeId: userId }

  const list = await prisma.session.findMany({
    where,
    include: {
      trainee: { select: { id: true, name: true } },
      exercises: { orderBy: { order: 'asc' } },
    },
    orderBy: { order: 'asc' },
  })

  return c.json(list)
})

// Global progress - all exercises across all sessions with ALL logs
// NOTE: must be before /:id to avoid "progress" matching as an id
sessions.get('/progress', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const traineeId = c.req.query('traineeId')

  const where =
    role === 'TRAINER'
      ? { trainerId: userId, ...(traineeId ? { traineeId } : {}) }
      : { traineeId: userId }

  const list = await prisma.session.findMany({
    where,
    include: {
      trainee: { select: { id: true, name: true } },
      exercises: {
        orderBy: { order: 'asc' },
        include: {
          logs: {
            orderBy: { completedAt: 'asc' },
          },
        },
      },
    },
    orderBy: { order: 'asc' },
  })

  return c.json(list)
})

// Get a single session with exercises
sessions.get('/:id', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const sessionId = c.req.param('id')

  const session = await prisma.session.findUnique({
    where: { id: sessionId },
    include: {
      trainee: { select: { id: true, name: true } },
      exercises: {
        orderBy: { order: 'asc' },
        include: {
          logs: {
            orderBy: { completedAt: 'desc' },
            take: 5,
          },
        },
      },
    },
  })

  if (!session) {
    return c.json({ error: 'Session not found' }, 404)
  }

  // Trainee can only see their own sessions
  if (role === 'TRAINEE' && session.traineeId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  // Trainer can only see sessions they created
  if (role === 'TRAINER' && session.trainerId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  return c.json(session)
})

// Create a session from a template (trainer only)
sessions.post('/from-template', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const { templateId, traineeId } = await c.req.json()

  const template = await prisma.sessionTemplate.findUnique({
    where: { id: templateId },
    include: { exercises: { orderBy: { order: 'asc' } } },
  })

  if (!template || template.trainerId !== trainerId) {
    return c.json({ error: 'Template not found' }, 404)
  }

  // Count existing sessions for order
  const count = await prisma.session.count({ where: { trainerId, traineeId } })

  const session = await prisma.session.create({
    data: {
      name: template.name,
      trainerId,
      traineeId,
      order: count,
      exercises: {
        create: template.exercises.map((ex) => ({
          name: ex.name,
          sets: ex.sets,
          reps: ex.reps,
          weight: ex.weight,
          duration: ex.duration,
          youtubeUrl: ex.youtubeUrl,
          notes: ex.notes,
          order: ex.order,
        })),
      },
    },
    include: {
      exercises: { orderBy: { order: 'asc' } },
    },
  })

  return c.json(session, 201)
})

// Create a session (trainer only)
sessions.post('/', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const { name, traineeId, order } = await c.req.json()

  const session = await prisma.session.create({
    data: { name, trainerId, traineeId, order: order ?? 0 },
  })

  return c.json(session, 201)
})

// Update a session (trainer only)
sessions.put('/:id', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const sessionId = c.req.param('id')
  const data = await c.req.json()

  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!session || session.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  const updated = await prisma.session.update({
    where: { id: sessionId },
    data: { name: data.name, order: data.order },
  })

  return c.json(updated)
})

// Delete a session (trainer only)
sessions.delete('/:id', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const sessionId = c.req.param('id')

  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!session || session.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  await prisma.session.delete({ where: { id: sessionId } })

  return c.json({ ok: true })
})

export default sessions
