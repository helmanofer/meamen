import { Hono } from 'hono'
import { prisma } from '../db.js'
import { authMiddleware, trainerOnly } from '../middleware/auth.js'

const exercises = new Hono<{ Variables: { userId: string; role: string } }>()

exercises.use('*', authMiddleware)

// Add exercise to a session (trainer only)
exercises.post('/session/:sessionId', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const sessionId = c.req.param('sessionId')
  const data = await c.req.json()

  const session = await prisma.session.findUnique({ where: { id: sessionId } })
  if (!session || session.trainerId !== trainerId) {
    return c.json({ error: 'Session not found' }, 404)
  }

  const exercise = await prisma.exercise.create({
    data: {
      sessionId,
      name: data.name,
      sets: data.sets ?? 3,
      reps: data.reps,
      weight: data.weight,
      duration: data.duration,
      youtubeUrl: data.youtubeUrl,
      order: data.order ?? 0,
      notes: data.notes,
    },
  })

  return c.json(exercise, 201)
})

// Update exercise log (trainee or trainer)
exercises.put('/log/:logId', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const logId = c.req.param('logId')
  const data = await c.req.json()

  const log = await prisma.exerciseLog.findUnique({
    where: { id: logId },
    include: { exercise: { include: { session: true } } },
  })
  if (!log) {
    return c.json({ error: 'Not found' }, 404)
  }

  if (role === 'TRAINEE' && log.exercise.session.traineeId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  if (role === 'TRAINER' && log.exercise.session.trainerId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const updated = await prisma.exerciseLog.update({
    where: { id: logId },
    data: {
      setsCompleted: data.setsCompleted,
      repsCompleted: data.repsCompleted,
      weightUsed: data.weightUsed,
      notes: data.notes,
    },
  })

  return c.json(updated)
})

// Delete exercise log (trainee or trainer)
exercises.delete('/log/:logId', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const logId = c.req.param('logId')

  const log = await prisma.exerciseLog.findUnique({
    where: { id: logId },
    include: { exercise: { include: { session: true } } },
  })
  if (!log) {
    return c.json({ error: 'Not found' }, 404)
  }

  if (role === 'TRAINEE' && log.exercise.session.traineeId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  if (role === 'TRAINER' && log.exercise.session.trainerId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  await prisma.exerciseLog.delete({ where: { id: logId } })

  return c.json({ ok: true })
})

// Update an exercise (trainer only)
exercises.put('/:id', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const exerciseId = c.req.param('id')
  const data = await c.req.json()

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { session: true },
  })
  if (!exercise || exercise.session.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  const updated = await prisma.exercise.update({
    where: { id: exerciseId },
    data: {
      name: data.name,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight,
      duration: data.duration,
      youtubeUrl: data.youtubeUrl,
      order: data.order,
      notes: data.notes,
    },
  })

  return c.json(updated)
})

// Delete an exercise (trainer only)
exercises.delete('/:id', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const exerciseId = c.req.param('id')

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { session: true },
  })
  if (!exercise || exercise.session.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  await prisma.exercise.delete({ where: { id: exerciseId } })

  return c.json({ ok: true })
})

// Log exercise performance (trainee or trainer on behalf of trainee)
exercises.post('/:id/log', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const exerciseId = c.req.param('id')
  const data = await c.req.json()

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { session: true },
  })
  if (!exercise) {
    return c.json({ error: 'Not found' }, 404)
  }

  // Trainee can only log their own exercises
  if (role === 'TRAINEE' && exercise.session.traineeId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  // Trainer can only log for sessions they own
  if (role === 'TRAINER' && exercise.session.trainerId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const traineeId = exercise.session.traineeId

  const log = await prisma.exerciseLog.create({
    data: {
      exerciseId,
      traineeId,
      setsCompleted: data.setsCompleted,
      repsCompleted: data.repsCompleted,
      weightUsed: data.weightUsed,
      notes: data.notes,
    },
  })

  return c.json(log, 201)
})

// Get exercise logs
exercises.get('/:id/logs', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const exerciseId = c.req.param('id')

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    include: { session: true },
  })
  if (!exercise) {
    return c.json({ error: 'Not found' }, 404)
  }

  // Check access
  if (role === 'TRAINEE' && exercise.session.traineeId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  if (role === 'TRAINER' && exercise.session.trainerId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }

  const logs = await prisma.exerciseLog.findMany({
    where: { exerciseId },
    orderBy: { completedAt: 'desc' },
  })

  return c.json(logs)
})

export default exercises
