import { Hono } from 'hono'
import { prisma } from '../db.js'
import { authMiddleware, trainerOnly } from '../middleware/auth.js'

const templates = new Hono<{ Variables: { userId: string; role: string } }>()

templates.use('*', authMiddleware)
templates.use('*', trainerOnly)

// List trainer's templates with exercises
templates.get('/', async (c) => {
  const trainerId = c.get('userId')

  const list = await prisma.sessionTemplate.findMany({
    where: { trainerId },
    include: {
      exercises: { orderBy: { order: 'asc' } },
    },
    orderBy: { createdAt: 'desc' },
  })

  return c.json(list)
})

// Create a template with exercises
templates.post('/', async (c) => {
  const trainerId = c.get('userId')
  const { name, exercises } = await c.req.json()

  const template = await prisma.sessionTemplate.create({
    data: {
      name,
      trainerId,
      exercises: exercises?.length
        ? {
            create: exercises.map((ex: { name: string; sets?: number; reps?: number; weight?: number; duration?: number; youtubeUrl?: string; notes?: string }, i: number) => ({
              name: ex.name,
              sets: ex.sets ?? 3,
              reps: ex.reps,
              weight: ex.weight,
              duration: ex.duration,
              youtubeUrl: ex.youtubeUrl,
              notes: ex.notes,
              order: i,
            })),
          }
        : undefined,
    },
    include: {
      exercises: { orderBy: { order: 'asc' } },
    },
  })

  return c.json(template, 201)
})

// Update template name
templates.put('/:id', async (c) => {
  const trainerId = c.get('userId')
  const templateId = c.req.param('id')
  const { name } = await c.req.json()

  const template = await prisma.sessionTemplate.findUnique({ where: { id: templateId } })
  if (!template || template.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  const updated = await prisma.sessionTemplate.update({
    where: { id: templateId },
    data: { name },
    include: { exercises: { orderBy: { order: 'asc' } } },
  })

  return c.json(updated)
})

// Delete template (cascade deletes exercises)
templates.delete('/:id', async (c) => {
  const trainerId = c.get('userId')
  const templateId = c.req.param('id')

  const template = await prisma.sessionTemplate.findUnique({ where: { id: templateId } })
  if (!template || template.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  await prisma.sessionTemplate.delete({ where: { id: templateId } })

  return c.json({ ok: true })
})

// Add exercise to template
templates.post('/:id/exercises', async (c) => {
  const trainerId = c.get('userId')
  const templateId = c.req.param('id')

  const template = await prisma.sessionTemplate.findUnique({ where: { id: templateId } })
  if (!template || template.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  const data = await c.req.json()
  const maxOrder = await prisma.templateExercise.findFirst({
    where: { templateId },
    orderBy: { order: 'desc' },
    select: { order: true },
  })

  const exercise = await prisma.templateExercise.create({
    data: {
      templateId,
      name: data.name,
      sets: data.sets ?? 3,
      reps: data.reps,
      weight: data.weight,
      duration: data.duration,
      youtubeUrl: data.youtubeUrl,
      notes: data.notes,
      order: data.order ?? (maxOrder ? maxOrder.order + 1 : 0),
    },
  })

  return c.json(exercise, 201)
})

// Update template exercise
templates.put('/:id/exercises/:exerciseId', async (c) => {
  const trainerId = c.get('userId')
  const templateId = c.req.param('id')
  const exerciseId = c.req.param('exerciseId')

  const template = await prisma.sessionTemplate.findUnique({ where: { id: templateId } })
  if (!template || template.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  const exercise = await prisma.templateExercise.findUnique({ where: { id: exerciseId } })
  if (!exercise || exercise.templateId !== templateId) {
    return c.json({ error: 'Exercise not found' }, 404)
  }

  const data = await c.req.json()
  const updated = await prisma.templateExercise.update({
    where: { id: exerciseId },
    data: {
      name: data.name,
      sets: data.sets,
      reps: data.reps,
      weight: data.weight,
      duration: data.duration,
      youtubeUrl: data.youtubeUrl,
      notes: data.notes,
      order: data.order,
    },
  })

  return c.json(updated)
})

// Delete template exercise
templates.delete('/:id/exercises/:exerciseId', async (c) => {
  const trainerId = c.get('userId')
  const templateId = c.req.param('id')
  const exerciseId = c.req.param('exerciseId')

  const template = await prisma.sessionTemplate.findUnique({ where: { id: templateId } })
  if (!template || template.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  const exercise = await prisma.templateExercise.findUnique({ where: { id: exerciseId } })
  if (!exercise || exercise.templateId !== templateId) {
    return c.json({ error: 'Exercise not found' }, 404)
  }

  await prisma.templateExercise.delete({ where: { id: exerciseId } })

  return c.json({ ok: true })
})

export default templates
