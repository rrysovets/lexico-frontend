import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axios'

interface User {
  id: number
  username: string
  email: string
}

interface AuthState {
  token: string | null
  user: User | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    token: localStorage.getItem('token'),
    user: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(username: string, password: string) {
      try {
        console.log('Attempting login...')
        const response = await axiosInstance.post('/api/v1/auth/token/login/', {
          username,
          password
        })
        
        const token = response.data.auth_token
        this.token = token
        localStorage.setItem('token', token)
        
        await this.fetchUser()
        
        return true
      } catch (error) {
        console.error('Login error:', error)
        return false
      }
    },

    async register(username: string, email: string, password: string) {
      try {
        await axiosInstance.post('/api/v1/auth/users/', {
          username,
          email,
          password
        })
        return true
      } catch (error) {
        console.error('Registration error:', error)
        return false
      }
    },

    async fetchUser() {
      try {
        const response = await axiosInstance.get('/api/v1/auth/users/me/')
        this.user = response.data
      } catch (error) {
        console.error('Fetch user error:', error)
      }
    },

    async logout() {
      try {
        await axiosInstance.post('/api/v1/auth/token/logout/')
      } catch (error) {
        console.error('Logout error:', error)
      } finally {
        this.token = null
        this.user = null
        localStorage.removeItem('token')
      }
    }
  }
}) 