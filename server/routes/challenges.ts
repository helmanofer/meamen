import { Hono } from 'hono'
import { prisma } from '../db.js'
import { authMiddleware, trainerOnly } from '../middleware/auth.js'

const challenges = new Hono<{ Variables: { userId: string; role: string } }>()

challenges.use('*', authMiddleware)

// GET / - list challenges for the trainer (or the trainee's trainer)
challenges.get('/', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')

  let trainerId: string
  if (role === 'TRAINER') {
    trainerId = userId
  } else {
    const rel = await prisma.trainerTrainee.findFirst({
      where: { traineeId: userId },
      select: { trainerId: true },
    })
    if (!rel) return c.json({ error: 'No trainer found' }, 404)
    trainerId = rel.trainerId
  }

  const now = new Date()
  const allChallenges = await prisma.challenge.findMany({
    where: { trainerId },
    orderBy: { startDate: 'desc' },
  })

  // Separate into active and past
  const active = allChallenges.filter((ch) => new Date(ch.startDate) <= now && new Date(ch.endDate) >= now)
  const upcoming = allChallenges.filter((ch) => new Date(ch.startDate) > now)
  const past = allChallenges.filter((ch) => new Date(ch.endDate) < now)

  return c.json({ active, upcoming, past })
})

// GET /:id/scoreboard - compute live scores for a challenge
challenges.get('/:id/scoreboard', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const challengeId = c.req.param('id')

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge) return c.json({ error: 'Challenge not found' }, 404)

  // Verify access: trainer owns the challenge, or trainee belongs to that trainer
  if (role === 'TRAINER' && challenge.trainerId !== userId) {
    return c.json({ error: 'Forbidden' }, 403)
  }
  if (role === 'TRAINEE') {
    const rel = await prisma.trainerTrainee.findFirst({
      where: { traineeId: userId, trainerId: challenge.trainerId },
    })
    if (!rel) return c.json({ error: 'Forbidden' }, 403)
  }

  // Get all trainees for this trainer
  const relations = await prisma.trainerTrainee.findMany({
    where: { trainerId: challenge.trainerId },
    include: { trainee: { select: { id: true, name: true, leaderboardOptOut: true } } },
  })

  const startDate = new Date(challenge.startDate)
  const endDate = new Date(challenge.endDate)

  const scores: Array<{
    traineeId: string
    name: string
    score: number
    unit: string
  }> = []

  for (const rel of relations) {
    if (rel.trainee.leaderboardOptOut) continue

    const logs = await prisma.exerciseLog.findMany({
      where: {
        traineeId: rel.traineeId,
        completedAt: { gte: startDate, lte: endDate },
      },
      select: { completedAt: true, weightUsed: true, setsCompleted: true, repsCompleted: true },
    })

    let score = 0
    let unit = ''

    if (challenge.type === 'most_workouts') {
      // Count distinct workout days within the challenge period
      const days = new Set(logs.map((l) => new Date(l.completedAt).toISOString().slice(0, 10)))
      score = days.size
      unit = 'days'
    } else if (challenge.type === 'total_weight') {
      // Sum of (weight x reps x sets) for all logged exercises
      for (const log of logs) {
        const w = log.weightUsed ?? 0
        const r = log.repsCompleted ?? 0
        const s = log.setsCompleted ?? 1
        score += w * r * s
      }
      score = Math.round(score)
      unit = 'kg total volume'
    } else if (challenge.type === 'consistency') {
      // Percentage of days in the challenge period where the trainee worked out
      const totalDays = Math.max(1, Math.ceil((endDate.getTime() - startDate.getTime()) / 86400000))
      const activeDays = new Set(logs.map((l) => new Date(l.completedAt).toISOString().slice(0, 10)))
      score = Math.round((activeDays.size / totalDays) * 100)
      unit = '% days active'
    }

    scores.push({ traineeId: rel.traineeId, name: rel.trainee.name, score, unit })
  }

  // Sort by score descending
  scores.sort((a, b) => b.score - a.score)

  const scoreboard = scores.map((s, i) => ({ rank: i + 1, ...s }))

  return c.json({ challenge, scoreboard })
})

// POST / - create a challenge (trainer only)
challenges.post('/', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const { title, description, type, startDate, endDate } = await c.req.json()

  if (!title || !type || !startDate || !endDate) {
    return c.json({ error: 'title, type, startDate, and endDate are required' }, 400)
  }

  const validTypes = ['most_workouts', 'total_weight', 'consistency']
  if (!validTypes.includes(type)) {
    return c.json({ error: `type must be one of: ${validTypes.join(', ')}` }, 400)
  }

  const start = new Date(startDate)
  const end = new Date(endDate)
  if (end <= start) {
    return c.json({ error: 'endDate must be after startDate' }, 400)
  }

  const challenge = await prisma.challenge.create({
    data: {
      trainerId,
      title,
      description: description || '',
      type,
      startDate: start,
      endDate: end,
    },
  })

  return c.json(challenge, 201)
})

// DELETE /:id - delete a challenge (trainer only)
challenges.delete('/:id', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const challengeId = c.req.param('id')

  const challenge = await prisma.challenge.findUnique({ where: { id: challengeId } })
  if (!challenge || challenge.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  await prisma.challenge.delete({ where: { id: challengeId } })
  return c.json({ ok: true })
})

export default challenges
