export interface StreakResult {
  currentStreakWeeks: number
  longestStreakWeeks: number
  perfectWeeks: number
  totalWorkoutDays: number
}

interface LogEntry {
  completedAt: Date | string
}

/** Get ISO week key (Mon-Sun) as "YYYY-WW" */
function isoWeekKey(date: Date): string {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  // Thursday of the same ISO week determines the year
  const day = d.getDay() || 7 // Mon=1 ... Sun=7
  d.setDate(d.getDate() + 4 - day) // move to Thursday
  const yearStart = new Date(d.getFullYear(), 0, 1)
  const weekNum = Math.ceil(((d.getTime() - yearStart.getTime()) / 86400000 + 1) / 7)
  return `${d.getFullYear()}-${String(weekNum).padStart(2, '0')}`
}

/** Get the Monday of an ISO week key */
function mondayOfWeek(weekKey: string): Date {
  const [year, week] = weekKey.split('-').map(Number)
  // Jan 4 is always in week 1
  const jan4 = new Date(year, 0, 4)
  const dayOfWeek = jan4.getDay() || 7
  const monday = new Date(jan4)
  monday.setDate(jan4.getDate() - (dayOfWeek - 1) + (week - 1) * 7)
  monday.setHours(0, 0, 0, 0)
  return monday
}

/** Advance a week key by one week */
function nextWeekKey(weekKey: string): string {
  const monday = mondayOfWeek(weekKey)
  monday.setDate(monday.getDate() + 7)
  return isoWeekKey(monday)
}

export function computeStreak(logs: LogEntry[], minWeeklyFrequency: number): StreakResult {
  if (logs.length === 0) {
    return { currentStreakWeeks: 0, longestStreakWeeks: 0, perfectWeeks: 0, totalWorkoutDays: 0 }
  }

  // Count distinct calendar dates per ISO week
  const weekDays = new Map<string, Set<string>>()
  for (const log of logs) {
    const d = new Date(log.completedAt)
    const wk = isoWeekKey(d)
    const dayStr = d.toISOString().slice(0, 10)
    if (!weekDays.has(wk)) weekDays.set(wk, new Set())
    weekDays.get(wk)!.add(dayStr)
  }

  // Total unique workout days
  const allDays = new Set<string>()
  for (const days of weekDays.values()) {
    for (const d of days) allDays.add(d)
  }
  const totalWorkoutDays = allDays.size

  // Build sorted list of all week keys from first log to now
  const allWeekKeys = Array.from(weekDays.keys()).sort()
  const firstWeek = allWeekKeys[0]
  const nowWeek = isoWeekKey(new Date())

  const timeline: string[] = []
  let cursor = firstWeek
  while (cursor <= nowWeek) {
    timeline.push(cursor)
    cursor = nextWeekKey(cursor)
  }

  // Determine met status for each week
  const metWeeks = timeline.map((wk) => {
    const days = weekDays.get(wk)
    return days ? days.size >= minWeeklyFrequency : false
  })

  // Perfect weeks = count of met weeks
  const perfectWeeks = metWeeks.filter(Boolean).length

  // Longest streak
  let longest = 0
  let run = 0
  for (const met of metWeeks) {
    if (met) {
      run++
      if (run > longest) longest = run
    } else {
      run = 0
    }
  }
  const longestStreakWeeks = longest

  // Current streak: count backwards from last completed week
  // Current in-progress week counts only if threshold already met
  let currentStreakWeeks = 0
  for (let i = metWeeks.length - 1; i >= 0; i--) {
    if (metWeeks[i]) {
      currentStreakWeeks++
    } else {
      // If this is the current (in-progress) week and not yet met, skip it and keep looking
      if (i === metWeeks.length - 1 && timeline[i] === nowWeek) {
        continue
      }
      break
    }
  }

  return { currentStreakWeeks, longestStreakWeeks, perfectWeeks, totalWorkoutDays }
}
