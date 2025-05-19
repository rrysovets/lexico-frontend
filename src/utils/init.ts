import { useAuthStore } from '@/stores/auth'

export async function initializeApp() {
  const authStore = useAuthStore()
  
  // Если есть токен, но нет данных пользователя, загружаем их
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser()
    } catch (error) {
      console.error('Failed to fetch user data:', error)
      // В случае ошибки, выходим из системы
      authStore.logout()
    }
  }
} 