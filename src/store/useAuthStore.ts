import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '../types/index'

interface AuthState {
  token: string | null
  user: User | null
  role: 'student' | 'teacher' | 'admin' | null
  login: (token: string, user: User) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      role: null,
      login: (token, user) => set({ token, user, role: user.role }),
      logout: () => set({ token: null, user: null, role: null }),
    }),
    {
      name: 'auth-storage'
    }
  )
)