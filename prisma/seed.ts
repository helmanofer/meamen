import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Check if data already exists - skip seeding if it does
  const existingUsers = await prisma.user.count()
  if (existingUsers > 0) {
    console.log('Database already seeded, skipping...')
    return
  }

  const passwordHash = await bcrypt.hash('password123', 10)

  // Create trainer
  const trainer = await prisma.user.create({
    data: {
      name: 'Coach Dan',
      email: 'trainer@meamen.com',
      passwordHash,
      role: 'TRAINER',
    },
  })

  // Create trainees
  const trainee1 = await prisma.user.create({
    data: {
      name: 'Ofer',
      email: 'ofer@meamen.com',
      passwordHash,
      role: 'TRAINEE',
    },
  })

  const trainee2 = await prisma.user.create({
    data: {
      name: 'Sarah',
      email: 'sarah@meamen.com',
      passwordHash,
      role: 'TRAINEE',
    },
  })

  // Link trainer to trainees
  await prisma.trainerTrainee.createMany({
    data: [
      { trainerId: trainer.id, traineeId: trainee1.id },
      { trainerId: trainer.id, traineeId: trainee2.id },
    ],
  })

  // Create sessions for Ofer
  const session1 = await prisma.session.create({
    data: {
      name: 'Upper Body A',
      trainerId: trainer.id,
      traineeId: trainee1.id,
      order: 0,
    },
  })

  const session2 = await prisma.session.create({
    data: {
      name: 'Leg Day',
      trainerId: trainer.id,
      traineeId: trainee1.id,
      order: 1,
    },
  })

  // Create session for Sarah
  const session3 = await prisma.session.create({
    data: {
      name: 'Full Body',
      trainerId: trainer.id,
      traineeId: trainee2.id,
      order: 0,
    },
  })

  // Helper: date N days ago
  const daysAgo = (n: number) => new Date(Date.now() - n * 24 * 60 * 60 * 1000)

  // Exercises for Upper Body A (Ofer)
  const benchPress = await prisma.exercise.create({
    data: { sessionId: session1.id, name: 'Bench Press', sets: 4, reps: 10, weight: 60, order: 0, youtubeUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
  })
  const ohp = await prisma.exercise.create({
    data: { sessionId: session1.id, name: 'Overhead Press', sets: 3, reps: 8, weight: 30, order: 1 },
  })
  const dbRow = await prisma.exercise.create({
    data: { sessionId: session1.id, name: 'Dumbbell Row', sets: 3, reps: 12, weight: 20, order: 2 },
  })

  // Exercises for Leg Day (Ofer)
  const squat = await prisma.exercise.create({
    data: { sessionId: session2.id, name: 'Squat', sets: 4, reps: 8, weight: 80, order: 0, youtubeUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8' },
  })
  const plank = await prisma.exercise.create({
    data: { sessionId: session2.id, name: 'Plank', sets: 3, duration: 60, order: 1, notes: 'Hold as long as possible' },
  })

  // Exercises for Full Body (Sarah)
  const deadlift = await prisma.exercise.create({
    data: { sessionId: session3.id, name: 'Deadlift', sets: 3, reps: 5, weight: 60, order: 0 },
  })
  const pushups = await prisma.exercise.create({
    data: { sessionId: session3.id, name: 'Push-ups', sets: 3, reps: 15, order: 1 },
  })
  const pullups = await prisma.exercise.create({
    data: { sessionId: session3.id, name: 'Pull-ups', sets: 3, reps: 8, order: 2 },
  })

  // Exercise logs for Ofer — showing progression over 4 weeks
  await prisma.exerciseLog.createMany({
    data: [
      // Bench Press progression
      { exerciseId: benchPress.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 8, weightUsed: 50, completedAt: daysAgo(28), notes: 'First session, warming up' },
      { exerciseId: benchPress.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 9, weightUsed: 55, completedAt: daysAgo(21) },
      { exerciseId: benchPress.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 10, weightUsed: 55, completedAt: daysAgo(14), notes: 'Felt strong, ready to go up' },
      { exerciseId: benchPress.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 8, weightUsed: 60, completedAt: daysAgo(7) },
      { exerciseId: benchPress.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 10, weightUsed: 60, completedAt: daysAgo(1), notes: 'Hit all reps!' },

      // Overhead Press progression
      { exerciseId: ohp.id, traineeId: trainee1.id, setsCompleted: 3, repsCompleted: 6, weightUsed: 25, completedAt: daysAgo(28) },
      { exerciseId: ohp.id, traineeId: trainee1.id, setsCompleted: 3, repsCompleted: 7, weightUsed: 25, completedAt: daysAgo(21) },
      { exerciseId: ohp.id, traineeId: trainee1.id, setsCompleted: 3, repsCompleted: 8, weightUsed: 27.5, completedAt: daysAgo(14) },
      { exerciseId: ohp.id, traineeId: trainee1.id, setsCompleted: 3, repsCompleted: 8, weightUsed: 30, completedAt: daysAgo(7), notes: 'Last rep was tough' },

      // Dumbbell Row progression
      { exerciseId: dbRow.id, traineeId: trainee1.id, setsCompleted: 3, repsCompleted: 10, weightUsed: 16, completedAt: daysAgo(28) },
      { exerciseId: dbRow.id, traineeId: trainee1.id, setsCompleted: 3, repsCompleted: 12, weightUsed: 16, completedAt: daysAgo(21) },
      { exerciseId: dbRow.id, traineeId: trainee1.id, setsCompleted: 3, repsCompleted: 10, weightUsed: 18, completedAt: daysAgo(14) },
      { exerciseId: dbRow.id, traineeId: trainee1.id, setsCompleted: 3, repsCompleted: 12, weightUsed: 20, completedAt: daysAgo(7), notes: 'Good form throughout' },

      // Squat progression
      { exerciseId: squat.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 6, weightUsed: 60, completedAt: daysAgo(26), notes: 'Working on depth' },
      { exerciseId: squat.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 7, weightUsed: 65, completedAt: daysAgo(19) },
      { exerciseId: squat.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 8, weightUsed: 70, completedAt: daysAgo(12), notes: 'Depth is improving' },
      { exerciseId: squat.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 8, weightUsed: 75, completedAt: daysAgo(5) },
      { exerciseId: squat.id, traineeId: trainee1.id, setsCompleted: 4, repsCompleted: 7, weightUsed: 80, completedAt: daysAgo(1), notes: 'New PR weight!' },

      // Plank progression
      { exerciseId: plank.id, traineeId: trainee1.id, setsCompleted: 3, notes: 'Held 40s, 35s, 30s', completedAt: daysAgo(26) },
      { exerciseId: plank.id, traineeId: trainee1.id, setsCompleted: 3, notes: 'Held 45s, 40s, 35s', completedAt: daysAgo(19) },
      { exerciseId: plank.id, traineeId: trainee1.id, setsCompleted: 3, notes: 'Held 50s, 45s, 40s', completedAt: daysAgo(12) },
      { exerciseId: plank.id, traineeId: trainee1.id, setsCompleted: 3, notes: 'Held 55s, 50s, 45s', completedAt: daysAgo(5) },
    ],
  })

  // Exercise logs for Sarah — 3 weeks of progress
  await prisma.exerciseLog.createMany({
    data: [
      // Deadlift progression
      { exerciseId: deadlift.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 5, weightUsed: 40, completedAt: daysAgo(21), notes: 'Learning the movement' },
      { exerciseId: deadlift.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 5, weightUsed: 45, completedAt: daysAgo(14) },
      { exerciseId: deadlift.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 5, weightUsed: 50, completedAt: daysAgo(7), notes: 'Form is clicking' },
      { exerciseId: deadlift.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 5, weightUsed: 55, completedAt: daysAgo(2) },

      // Push-ups progression
      { exerciseId: pushups.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 8, completedAt: daysAgo(21) },
      { exerciseId: pushups.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 10, completedAt: daysAgo(14) },
      { exerciseId: pushups.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 12, completedAt: daysAgo(7), notes: 'Getting easier' },
      { exerciseId: pushups.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 14, completedAt: daysAgo(2) },

      // Pull-ups progression
      { exerciseId: pullups.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 3, completedAt: daysAgo(21), notes: 'Used band assist' },
      { exerciseId: pullups.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 4, completedAt: daysAgo(14), notes: 'Lighter band' },
      { exerciseId: pullups.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 5, completedAt: daysAgo(7), notes: 'No band!' },
      { exerciseId: pullups.id, traineeId: trainee2.id, setsCompleted: 3, repsCompleted: 6, completedAt: daysAgo(2) },
    ],
  })

  // Create session templates for the trainer
  const legDayTemplate = await prisma.sessionTemplate.create({
    data: {
      name: 'Leg Day',
      trainerId: trainer.id,
    },
  })

  await prisma.templateExercise.createMany({
    data: [
      { templateId: legDayTemplate.id, name: 'Squat', sets: 4, reps: 10, order: 0 },
      { templateId: legDayTemplate.id, name: 'Leg Press', sets: 3, reps: 12, order: 1 },
      { templateId: legDayTemplate.id, name: 'Romanian Deadlift', sets: 3, reps: 10, order: 2 },
      { templateId: legDayTemplate.id, name: 'Leg Curl', sets: 3, reps: 12, order: 3 },
      { templateId: legDayTemplate.id, name: 'Calf Raise', sets: 4, reps: 15, order: 4 },
    ],
  })

  const upperBodyTemplate = await prisma.sessionTemplate.create({
    data: {
      name: 'Upper Body Push',
      trainerId: trainer.id,
    },
  })

  await prisma.templateExercise.createMany({
    data: [
      { templateId: upperBodyTemplate.id, name: 'Bench Press', sets: 4, reps: 8, order: 0 },
      { templateId: upperBodyTemplate.id, name: 'Overhead Press', sets: 3, reps: 10, order: 1 },
      { templateId: upperBodyTemplate.id, name: 'Incline Dumbbell Press', sets: 3, reps: 10, order: 2 },
      { templateId: upperBodyTemplate.id, name: 'Tricep Pushdown', sets: 3, reps: 12, order: 3 },
      { templateId: upperBodyTemplate.id, name: 'Lateral Raise', sets: 3, reps: 15, order: 4 },
    ],
  })

  const fullBodyTemplate = await prisma.sessionTemplate.create({
    data: {
      name: 'Full Body',
      trainerId: trainer.id,
    },
  })

  await prisma.templateExercise.createMany({
    data: [
      { templateId: fullBodyTemplate.id, name: 'Squat', sets: 3, reps: 8, order: 0 },
      { templateId: fullBodyTemplate.id, name: 'Bench Press', sets: 3, reps: 8, order: 1 },
      { templateId: fullBodyTemplate.id, name: 'Barbell Row', sets: 3, reps: 8, order: 2 },
      { templateId: fullBodyTemplate.id, name: 'Overhead Press', sets: 3, reps: 10, order: 3 },
      { templateId: fullBodyTemplate.id, name: 'Deadlift', sets: 3, reps: 5, order: 4 },
    ],
  })

  console.log('Seed complete!')
  console.log('')
  console.log('Test accounts:')
  console.log('  Trainer: trainer@meamen.com / password123')
  console.log('  Trainee: ofer@meamen.com / password123')
  console.log('  Trainee: sarah@meamen.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
