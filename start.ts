import { $ } from 'bun'

// Push schema to database (needed for Render free tier)
console.log('Pushing database schema...')
await $`bunx prisma db push --schema prisma/schema.prisma`

// Start the server
console.log('Starting server...')
await $`bun run server/index.ts`
