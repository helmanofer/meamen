import { test, expect } from 'bun:test'
import { app } from '../index.js'

test('GET /api/health returns ok', async () => {
  const res = await app.request('/api/health')
  expect(res.status).toBe(200)
  const body = await res.json()
  expect(body).toEqual({ status: 'ok' })
})
