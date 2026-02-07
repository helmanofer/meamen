import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Clean existing data
  await prisma.templateExercise.deleteMany()
  await prisma.sessionTemplate.deleteMany()
  await prisma.exerciseLog.deleteMany()
  await prisma.exercise.deleteMany()
  await prisma.session.deleteMany()
  await prisma.trainerTrainee.deleteMany()
  await prisma.user.deleteMany()

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

  // Exercises for Upper Body A
  await prisma.exercise.createMany({
    data: [
      { sessionId: session1.id, name: 'Bench Press', sets: 4, reps: 10, weight: 60, order: 0, youtubeUrl: 'https://www.youtube.com/watch?v=rT7DgCr-3pg' },
      { sessionId: session1.id, name: 'Overhead Press', sets: 3, reps: 8, weight: 30, order: 1 },
      { sessionId: session1.id, name: 'Dumbbell Row', sets: 3, reps: 12, weight: 20, order: 2 },
    ],
  })

  // Exercises for Leg Day
  await prisma.exercise.createMany({
    data: [
      { sessionId: session2.id, name: 'Squat', sets: 4, reps: 8, weight: 80, order: 0, youtubeUrl: 'https://www.youtube.com/watch?v=ultWZbUMPL8' },
      { sessionId: session2.id, name: 'Plank', sets: 3, duration: 60, order: 1, notes: 'Hold as long as possible' },
    ],
  })

  // Exercises for Full Body
  await prisma.exercise.createMany({
    data: [
      { sessionId: session3.id, name: 'Deadlift', sets: 3, reps: 5, weight: 60, order: 0 },
      { sessionId: session3.id, name: 'Push-ups', sets: 3, reps: 15, order: 1 },
      { sessionId: session3.id, name: 'Pull-ups', sets: 3, reps: 8, order: 2 },
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
