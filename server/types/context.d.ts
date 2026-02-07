import type { JwtPayload } from './middleware/auth.js'

declare module 'hono' {
  interface ContextVariableMap {
    userId: string
    role: string
  }
}
