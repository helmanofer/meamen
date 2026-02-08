import { Hono } from 'hono'
import { prisma } from '../db.js'
import { authMiddleware, trainerOnly } from '../middleware/auth.js'
import { computeStreak } from '../services/streaks.js'
import { checkAndAwardBadges } from '../services/badges.js'
import { BADGES, BADGE_MAP } from '../badges.js'

const dedication = new Hono<{ Variables: { userId: string; role: string } }>()

// Public config endpoint (no auth)
dedication.get('/config', (c) => {
  return c.json({ leaderboardEnabled: process.env.ENABLE_LEADERBOARD === 'true' })
})

// All other routes require auth
dedication.use('*', authMiddleware)

// GET /stats - trainee stats (streak, badges, totalWorkoutDays)
dedication.get('/stats', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const traineeId = c.req.query('traineeId')

  // Determine target trainee
  let targetId = userId
  if (traineeId) {
    if (role === 'TRAINER') {
      // Verify trainer owns this trainee
      const rel = await prisma.trainerTrainee.findFirst({
        where: { trainerId: userId, traineeId },
      })
      if (!rel) return c.json({ error: 'Trainee not found' }, 404)
      targetId = traineeId
    } else if (traineeId !== userId) {
      return c.json({ error: 'Forbidden' }, 403)
    }
  }

  const logs = await prisma.exerciseLog.findMany({
    where: { traineeId: targetId },
    select: { completedAt: true },
    orderBy: { completedAt: 'asc' },
  })

  const trainerTrainee = await prisma.trainerTrainee.findFirst({
    where: { traineeId: targetId },
    select: { minWeeklyFrequency: true },
  })
  const minWeeklyFrequency = trainerTrainee?.minWeeklyFrequency ?? 3

  const streaks = computeStreak(logs, minWeeklyFrequency)

  // Build per-day activity counts for heatmap
  const activityDays: Record<string, number> = {}
  for (const log of logs) {
    const day = new Date(log.completedAt).toISOString().slice(0, 10)
    activityDays[day] = (activityDays[day] || 0) + 1
  }

  const badges = await prisma.traineeBadge.findMany({
    where: { traineeId: targetId },
    select: { badgeKey: true, earnedAt: true },
  })

  return c.json({
    ...streaks,
    activityDays,
    minWeeklyFrequency,
    badges: badges.map((b) => ({
      key: b.badgeKey,
      earnedAt: b.earnedAt,
      ...(() => {
        const def = BADGE_MAP.get(b.badgeKey)
        return def ? { name: def.name, icon: def.icon } : {}
      })(),
    })),
  })
})

// GET /badges - all badge definitions
dedication.get('/badges', (c) => {
  return c.json(
    BADGES.map((b) => ({
      key: b.key,
      name: b.name,
      description: b.description,
      category: b.category,
      icon: b.icon,
    }))
  )
})

// GET /leaderboard - per-trainer leaderboard
dedication.get('/leaderboard', async (c) => {
  if (process.env.ENABLE_LEADERBOARD !== 'true') {
    return c.json({ error: 'Leaderboard is disabled' }, 403)
  }

  const userId = c.get('userId')
  const role = c.get('role')

  // Get trainer ID: for trainee, find their trainer; for trainer, use self
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

  // Get all trainees for this trainer who haven't opted out
  const relations = await prisma.trainerTrainee.findMany({
    where: { trainerId },
    include: {
      trainee: {
        select: { id: true, name: true, leaderboardOptOut: true },
      },
    },
  })

  const entries = []
  for (const rel of relations) {
    if (rel.trainee.leaderboardOptOut) continue

    const logs = await prisma.exerciseLog.findMany({
      where: { traineeId: rel.traineeId },
      select: { completedAt: true },
      orderBy: { completedAt: 'asc' },
    })

    const streaks = computeStreak(logs, rel.minWeeklyFrequency)

    const badgeCount = await prisma.traineeBadge.count({
      where: { traineeId: rel.traineeId },
    })

    entries.push({
      traineeId: rel.traineeId,
      name: rel.trainee.name,
      currentStreakWeeks: streaks.currentStreakWeeks,
      totalWorkoutDays: streaks.totalWorkoutDays,
      badgeCount,
    })
  }

  // Sort by current streak desc, then total workout days desc
  entries.sort((a, b) => b.currentStreakWeeks - a.currentStreakWeeks || b.totalWorkoutDays - a.totalWorkoutDays)

  return c.json(entries.map((e, i) => ({ rank: i + 1, ...e })))
})

// GET /rewards - rewards for trainee's trainer
dedication.get('/rewards', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const traineeId = c.req.query('traineeId')

  let targetTraineeId = userId
  let trainerId: string

  if (role === 'TRAINER') {
    trainerId = userId
    if (traineeId) {
      const rel = await prisma.trainerTrainee.findFirst({
        where: { trainerId: userId, traineeId },
      })
      if (!rel) return c.json({ error: 'Trainee not found' }, 404)
      targetTraineeId = traineeId
    }
  } else {
    const rel = await prisma.trainerTrainee.findFirst({
      where: { traineeId: userId },
      select: { trainerId: true },
    })
    if (!rel) return c.json({ error: 'No trainer found' }, 404)
    trainerId = rel.trainerId
    targetTraineeId = userId
  }

  const rewards = await prisma.reward.findMany({
    where: { trainerId },
    orderBy: { createdAt: 'desc' },
  })

  // Compute whether each reward condition is met for the target trainee
  const logs = await prisma.exerciseLog.findMany({
    where: { traineeId: targetTraineeId },
    select: { exerciseId: true, weightUsed: true, completedAt: true },
    orderBy: { completedAt: 'asc' },
  })
  const trainerTrainee = await prisma.trainerTrainee.findFirst({
    where: { traineeId: targetTraineeId },
    select: { minWeeklyFrequency: true },
  })
  const streaks = computeStreak(logs, trainerTrainee?.minWeeklyFrequency ?? 3)
  const badges = await prisma.traineeBadge.findMany({
    where: { traineeId: targetTraineeId },
    select: { badgeKey: true },
  })
  const earnedBadgeKeys = new Set(badges.map((b) => b.badgeKey))

  const rewardsWithStatus = rewards.map((r) => ({
    ...r,
    met: evaluateCondition(r.condition, streaks, earnedBadgeKeys),
  }))

  return c.json(rewardsWithStatus)
})

function evaluateCondition(
  condition: string,
  streaks: { currentStreakWeeks: number; longestStreakWeeks: number; totalWorkoutDays: number },
  earnedBadgeKeys: Set<string>,
): boolean {
  const [type, value] = condition.split(':')
  if (type === 'streak') return streaks.currentStreakWeeks >= Number(value)
  if (type === 'workouts') return streaks.totalWorkoutDays >= Number(value)
  if (type === 'badge') return earnedBadgeKeys.has(value)
  return false
}

// POST /rewards - create reward (trainer only)
dedication.post('/rewards', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const { condition, description } = await c.req.json()

  if (!condition || !description) {
    return c.json({ error: 'condition and description required' }, 400)
  }

  const reward = await prisma.reward.create({
    data: { trainerId, condition, description },
  })

  return c.json(reward, 201)
})

// DELETE /rewards/:id - delete reward (trainer only)
dedication.delete('/rewards/:id', trainerOnly, async (c) => {
  const trainerId = c.get('userId')
  const rewardId = c.req.param('id')

  const reward = await prisma.reward.findUnique({ where: { id: rewardId } })
  if (!reward || reward.trainerId !== trainerId) {
    return c.json({ error: 'Not found' }, 404)
  }

  await prisma.reward.delete({ where: { id: rewardId } })
  return c.json({ ok: true })
})

// PUT /settings - update dedication settings
dedication.put('/settings', async (c) => {
  const userId = c.get('userId')
  const role = c.get('role')
  const data = await c.req.json()

  if (role === 'TRAINEE') {
    if (data.leaderboardOptOut !== undefined) {
      await prisma.user.update({
        where: { id: userId },
        data: { leaderboardOptOut: data.leaderboardOptOut },
      })
    }
    return c.json({ ok: true })
  }

  // Trainer: update trainee's minWeeklyFrequency
  if (data.traineeId && data.minWeeklyFrequency !== undefined) {
    const rel = await prisma.trainerTrainee.findFirst({
      where: { trainerId: userId, traineeId: data.traineeId },
    })
    if (!rel) return c.json({ error: 'Trainee not found' }, 404)

    await prisma.trainerTrainee.update({
      where: { id: rel.id },
      data: { minWeeklyFrequency: data.minWeeklyFrequency },
    })
    return c.json({ ok: true })
  }

  return c.json({ error: 'Invalid request' }, 400)
})

export default dedication
