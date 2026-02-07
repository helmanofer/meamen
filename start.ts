import { $ } from 'bun'

// Push schema to database (creates tables if they don't exist)
await $`bunx prisma db push --skip-generate`

// Run seed to populate initial data
await $`bun run prisma/seed.ts`

// Start the server
await $`bun run server/index.ts`
