import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Определение типизированных маршрутов
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('@/views/HomeView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Главная'
    }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/LoginView.vue'),
    meta: { 
      title: 'Вход',
      hideForAuth: true // Скрыть для авторизованных пользователей
    }
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('@/views/RegisterView.vue'),
    meta: { 
      title: 'Регистрация',
      hideForAuth: true
    }
  },
  {
    path: '/module/:id',
    name: 'module',
    component: () => import('@/views/ModuleView.vue'),
    props: true,
    meta: { 
      requiresAuth: true,
      title: 'Просмотр модуля'
    }
  },
  {
    path: '/study',
    name: 'study',
    component: () => import('@/views/StudyView.vue'),
    meta: { 
      requiresAuth: true,
      title: 'Изучение'
    }
  },
  {
    path: '/:pathMatch(.*)*', // Обработка ошибок маршрутизации
    name: 'not-found',
    redirect: { name: 'home' }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Улучшенный навигационный guard с обработкой ошибок
router.beforeEach(async (to: RouteLocationNormalized, from: RouteLocationNormalized, next: NavigationGuardNext) => {
  // Обновляем заголовок страницы
  document.title = to.meta.title ? `Qizlet | ${to.meta.title}` : 'Qizlet Revival'
  
  // Проверка аутентификации для защищенных маршрутов
  try {
    const authStore = useAuthStore()
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth)
    const hideForAuth = to.matched.some(record => record.meta.hideForAuth)
    
    // Если пользователь авторизован и пытается попасть на страницу, скрытую для авторизованных
    if (authStore.isAuthenticated && hideForAuth) {
      next({ name: 'home' })
      return
    }
    
    // Если требуется авторизация и пользователь не авторизован
    if (requiresAuth && !authStore.isAuthenticated) {
      next({ name: 'login', query: { redirect: to.fullPath } })
      return
    }
    
    // В остальных случаях продолжаем навигацию
    next()
  } catch (error) {
    console.error('Navigation guard error:', error)
    next({ name: 'login' })
  }
})

export default router 