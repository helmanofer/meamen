import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { serveStatic } from 'hono/bun'
import auth from './routes/auth.js'
import trainees from './routes/trainees.js'
import sessions from './routes/sessions.js'
import exercises from './routes/exercises.js'
import templates from './routes/templates.js'

const app = new Hono<{ Variables: { userId: string; role: string } }>()

app.use('*', logger())

// CORS only needed in development (in production, client is served from same origin)
if (process.env.NODE_ENV !== 'production') {
  app.use('*', cors({
    origin: 'http://localhost:5173',
    credentials: true,
  }))
}

app.route('/api/auth', auth)
app.route('/api/trainees', trainees)
app.route('/api/sessions', sessions)
app.route('/api/exercises', exercises)
app.route('/api/templates', templates)

app.get('/api/health', (c) => c.json({ status: 'ok' }))

// Serve static client build in production
if (process.env.NODE_ENV === 'production') {
  app.use('*', serveStatic({ root: './client/dist' }))
  // SPA fallback: serve index.html for all non-API routes
  app.get('*', serveStatic({ path: './client/dist/index.html' }))
}

const port = Number(process.env.PORT) || 3000
console.log(`Server running on http://localhost:${port}`)

export default {
  port,
  fetch: app.fetch,
}
