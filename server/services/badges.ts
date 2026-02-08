import { prisma } from '../db.js'
import { computeStreak } from './streaks.js'
import { BADGES, type BadgeCheckContext } from '../badges.js'

/** Count PRs: for each exercise, find logs where weightUsed exceeded all previous logs */
function countPRs(logs: Array<{ exerciseId: string; weightUsed: number | null; completedAt: Date }>): number {
  // Group by exercise, sorted by time
  const byExercise = new Map<string, Array<{ weightUsed: number | null; completedAt: Date }>>()
  for (const log of logs) {
    if (!byExercise.has(log.exerciseId)) byExercise.set(log.exerciseId, [])
    byExercise.get(log.exerciseId)!.push(log)
  }

  let prCount = 0
  for (const exerciseLogs of byExercise.values()) {
    exerciseLogs.sort((a, b) => new Date(a.completedAt).getTime() - new Date(b.completedAt).getTime())
    let maxWeight = -1
    for (const log of exerciseLogs) {
      if (log.weightUsed != null && log.weightUsed > maxWeight) {
        if (maxWeight >= 0) prCount++ // first entry isn't a PR, it's the baseline
        maxWeight = log.weightUsed
      }
    }
  }
  return prCount
}

export async function checkAndAwardBadges(traineeId: string): Promise<string[]> {
  // Fetch all logs for this trainee
  const logs = await prisma.exerciseLog.findMany({
    where: { traineeId },
    select: { exerciseId: true, weightUsed: true, completedAt: true },
    orderBy: { completedAt: 'asc' },
  })

  // Get minWeeklyFrequency from trainer relationship
  const trainerTrainee = await prisma.trainerTrainee.findFirst({
    where: { traineeId },
    select: { minWeeklyFrequency: true },
  })
  const minWeeklyFrequency = trainerTrainee?.minWeeklyFrequency ?? 3

  // Existing badges
  const existing = await prisma.traineeBadge.findMany({
    where: { traineeId },
    select: { badgeKey: true },
  })
  const earnedKeys = new Set(existing.map((b) => b.badgeKey))

  // Build context
  const streaks = computeStreak(logs, minWeeklyFrequency)

  // Count weekend workout days
  const weekendDays = new Set<string>()
  for (const log of logs) {
    const d = new Date(log.completedAt)
    const day = d.getDay()
    if (day === 0 || day === 6) {
      weekendDays.add(d.toISOString().slice(0, 10))
    }
  }

  const prCount = countPRs(logs)

  const ctx: BadgeCheckContext = {
    totalWorkoutDays: streaks.totalWorkoutDays,
    streaks,
    weekendWorkoutDays: weekendDays.size,
    prCount,
  }

  // Check each badge
  const newBadges: string[] = []
  for (const badge of BADGES) {
    if (earnedKeys.has(badge.key)) continue
    if (badge.check(ctx)) {
      await prisma.traineeBadge.create({
        data: { traineeId, badgeKey: badge.key },
      })
      newBadges.push(badge.key)
    }
  }

  return newBadges
}
