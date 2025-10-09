import { setupWorker } from 'msw/browser'
import { authHandlers } from './auth'

// Combine all handlers
const handlers = [
  ...authHandlers
]

// Setup the worker
export const worker = setupWorker(...handlers)

// Start worker in development
if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass'
  })
}