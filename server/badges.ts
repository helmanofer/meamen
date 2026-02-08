import type { StreakResult } from './services/streaks.js'

export interface BadgeCheckContext {
  totalWorkoutDays: number
  streaks: StreakResult
  weekendWorkoutDays: number
  prCount: number
}

export interface BadgeDefinition {
  key: string
  name: string
  description: string
  category: 'milestone' | 'consistency' | 'performance'
  icon: string
  check: (ctx: BadgeCheckContext) => boolean
}

export const BADGES: BadgeDefinition[] = [
  // Milestone badges
  {
    key: 'first_workout',
    name: 'First Steps',
    description: 'Complete your first workout',
    category: 'milestone',
    icon: '👟',
    check: (ctx) => ctx.totalWorkoutDays >= 1,
  },
  {
    key: 'ten_workouts',
    name: 'Getting Serious',
    description: 'Work out on 10 different days',
    category: 'milestone',
    icon: '💪',
    check: (ctx) => ctx.totalWorkoutDays >= 10,
  },
  {
    key: 'twenty_five_workouts',
    name: 'Quarter Century',
    description: 'Work out on 25 different days',
    category: 'milestone',
    icon: '⭐',
    check: (ctx) => ctx.totalWorkoutDays >= 25,
  },
  {
    key: 'fifty_workouts',
    name: 'Half Century',
    description: 'Work out on 50 different days',
    category: 'milestone',
    icon: '🏅',
    check: (ctx) => ctx.totalWorkoutDays >= 50,
  },
  {
    key: 'hundred_workouts',
    name: 'Centurion',
    description: 'Work out on 100 different days',
    category: 'milestone',
    icon: '🏆',
    check: (ctx) => ctx.totalWorkoutDays >= 100,
  },

  // Consistency badges
  {
    key: 'perfect_week',
    name: 'Perfect Week',
    description: 'Meet your weekly workout goal for a full week',
    category: 'consistency',
    icon: '✅',
    check: (ctx) => ctx.streaks.perfectWeeks >= 1,
  },
  {
    key: 'four_week_streak',
    name: 'Monthly Machine',
    description: 'Maintain a 4-week streak',
    category: 'consistency',
    icon: '🔥',
    check: (ctx) => ctx.streaks.longestStreakWeeks >= 4,
  },
  {
    key: 'eight_week_streak',
    name: 'Two-Month Titan',
    description: 'Maintain an 8-week streak',
    category: 'consistency',
    icon: '⚡',
    check: (ctx) => ctx.streaks.longestStreakWeeks >= 8,
  },
  {
    key: 'weekend_warrior',
    name: 'Weekend Warrior',
    description: 'Work out on 5 weekend days',
    category: 'consistency',
    icon: '🌅',
    check: (ctx) => ctx.weekendWorkoutDays >= 5,
  },

  // Performance badges
  {
    key: 'first_pr',
    name: 'New Record',
    description: 'Set your first personal record',
    category: 'performance',
    icon: '📈',
    check: (ctx) => ctx.prCount >= 1,
  },
  {
    key: 'five_prs',
    name: 'PR Machine',
    description: 'Set 5 personal records',
    category: 'performance',
    icon: '🚀',
    check: (ctx) => ctx.prCount >= 5,
  },
]

export const BADGE_MAP = new Map(BADGES.map((b) => [b.key, b]))
