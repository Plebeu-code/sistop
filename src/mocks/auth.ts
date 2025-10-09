import { http, HttpResponse } from 'msw'
import type { User } from '../shared/types'

// Mock user data
const mockUser: User = {
  id: '1',
  name: 'Admin User',
  email: 'admin@sistop.com',
  roles: ['admin', 'manager'],
  avatar: 'https://via.placeholder.com/40'
}

export const authHandlers = [
  // Login endpoint
  http.post('/api/auth/login', async ({ request }) => {
    const { email, password } = await request.json() as { email: string; password: string }
    
    if (email === 'admin@sistop.com' && password === 'admin123') {
      return HttpResponse.json({
        user: mockUser,
        token: 'mock-jwt-token-123'
      })
    }
    
    return HttpResponse.json(
      { message: 'Invalid credentials' },
      { status: 401 }
    )
  }),

  // Get current user
  http.get('/api/auth/me', () => {
    return HttpResponse.json({ user: mockUser })
  }),

  // Logout
  http.post('/api/auth/logout', () => {
    return HttpResponse.json({ message: 'Logged out successfully' })
  })
]