import { PrismaClient } from '@prisma/client'
import { $ } from 'bun'
import { unlink } from 'node:fs/promises'

const TEST_DB_PATH = 'prisma/test.db'
const TEST_DB_URL = `file:${TEST_DB_PATH}`

// Set DATABASE_URL before any PrismaClient is instantiated (including server/db.ts)
process.env.DATABASE_URL = TEST_DB_URL

let prisma: PrismaClient

export async function setupTestDB() {
  // Remove old test DB to start fresh
  try { await unlink(TEST_DB_PATH) } catch { /* ignore */ }
  try { await unlink(`${TEST_DB_PATH}-journal`) } catch { /* ignore */ }

  // Push schema to create tables (fresh DB, no data loss possible)
  await $`bunx prisma db push --schema prisma/schema.sqlite.prisma --skip-generate`.quiet()

  // Create a fresh PrismaClient pointing at the test DB
  prisma = new PrismaClient({ datasourceUrl: TEST_DB_URL })
  return prisma
}

export async function teardownTestDB() {
  if (prisma) {
    await prisma.$disconnect()
  }
  try {
    await unlink(TEST_DB_PATH)
  } catch {
    // ignore if already removed
  }
  try {
    await unlink(`${TEST_DB_PATH}-journal`)
  } catch {
    // ignore
  }
}

export async function cleanDB(db: PrismaClient) {
  await db.exerciseLog.deleteMany()
  await db.exercise.deleteMany()
  await db.session.deleteMany()
  await db.templateExercise.deleteMany()
  await db.sessionTemplate.deleteMany()
  await db.trainerTrainee.deleteMany()
  await db.user.deleteMany()
}

export { prisma }
