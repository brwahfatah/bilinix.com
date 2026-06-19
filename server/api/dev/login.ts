import { defineEventHandler, readBody } from 'h3'

export default defineEventHandler(async (event) => {
  // Only enable this route in development
  const runtime = useRuntimeConfig()
  if (runtime.public?.enableDevMocks !== true && process.env.NODE_ENV !== 'development') {
    return { statusCode: 404, statusMessage: 'Not found' }
  }

  const body = await readBody<{ email?: string; password?: string }>(event)

  // Accept any credentials and return a fake token/user for local testing
  const email = String(body?.email || 'dev@example.com')

  return {
    token: 'dev-token-12345',
    user: {
      id: 99999,
      email,
      first_name: 'Dev',
      last_name: 'User',
      full_name: 'Dev User'
    }
  }
})
