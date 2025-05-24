import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import HomeView from '@/views/HomeView.vue'
import LoginView from '@/views/LoginView.vue'
import RegisterView from '@/views/RegisterView.vue'
import StudyView from '@/views/StudyView.vue'
import StatisticsView from '@/views/StatisticsView.vue'

// Определение типизированных маршрутов
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: HomeView,
    meta: { 
      requiresAuth: true,
      title: 'Главная'
    },
    children: [
      {
        path: '',
        name: 'popular',
        component: HomeView,
        meta: {
          section: 'home',
          filter: 'popular-modules'
        }
      },
      {
        path: 'public',
        name: 'public',
        component: HomeView,
        meta: {
          section: 'home',
          filter: 'public'
        }
      },
      {
        path: 'private',
        name: 'private',
        component: HomeView,
        meta: {
          section: 'home',
          filter: 'private'
        }
      }
    ]
  },
  {
    path: '/library',
    name: 'library',
    component: HomeView,
    meta: {
      requiresAuth: true,
      title: 'Моя библиотека'
    },
    children: [
      {
        path: '',
        name: 'my-modules',
        component: HomeView,
        meta: {
          section: 'library',
          filter: 'my-modules'
        }
      },
      {
        path: 'folders',
        name: 'my-folders',
        component: HomeView,
        meta: {
          section: 'library',
          filter: 'my-folders'
        }
      },
      {
        path: 'recent',
        name: 'recent',
        component: HomeView,
        meta: {
          section: 'library',
          filter: 'recent'
        }
      }
    ]
  },
  {
    path: '/favorites',
    name: 'favorites',
    component: HomeView,
    meta: {
      requiresAuth: true,
      title: 'Избранное'
    },
    children: [
      {
        path: '',
        name: 'favorite-modules',
        component: HomeView,
        meta: {
          section: 'favorites',
          filter: 'modules'
        }
      },
      {
        path: 'folders',
        name: 'favorite-folders',
        component: HomeView,
        meta: {
          section: 'favorites',
          filter: 'folders'
        }
      }
    ]
  },
  {
    path: '/login',
    name: 'login',
    component: LoginView,
    meta: { 
      title: 'Вход',
      hideForAuth: true // Скрыть для авторизованных пользователей
    }
  },
  {
    path: '/register',
    name: 'register',
    component: RegisterView,
    meta: { 
      title: 'Регистрация',
      hideForAuth: true
    }
  },
  {
    path: '/study',
    name: 'study',
    component: StudyView,
    meta: { 
      requiresAuth: true,
      title: 'Изучение'
    }
  },
  {
    path: '/statistics',
    name: 'statistics',
    component: StatisticsView,
    meta: { 
      requiresAuth: true,
      title: 'Статистика'
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
  document.title = to.meta.title ? `LEXICO | ${to.meta.title}` : 'LEXICO'
  
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