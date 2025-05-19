import axios from 'axios'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { AxiosRequestConfig } from 'axios'

// Создаем экземпляр axios с базовым URL
const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:80',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
})

// Добавляем перехватчик запросов
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    
    // Уменьшаем количество логов, чтобы не засорять консоль
    if (process.env.NODE_ENV === 'development') {
      console.log(`[REQUEST] ${config.method?.toUpperCase()} ${config.url}`)
    }
    
    // Устанавливаем заголовок авторизации, если токен есть
    if (token) {
      config.headers.Authorization = `Token ${token}`
    }
    return config
  },
  (error) => {
    console.error('Request preparation error:', error)
    return Promise.reject(error)
  }
)

// Добавляем перехватчик ответов
axiosInstance.interceptors.response.use(
  (response) => {
    // Минимизируем логи, только для разработки
    if (process.env.NODE_ENV === 'development') {
      console.log(`[RESPONSE] ${response.config.method?.toUpperCase()} ${response.config.url} - ${response.status}`)
    }
    return response
  },
  (error) => {
    // Логируем только важную информацию об ошибке
    if (process.env.NODE_ENV === 'development') {
      console.error(`[ERROR] ${error.config?.method?.toUpperCase()} ${error.config?.url} - ${error.response?.status || 'Network Error'}`)
      
      if (error.response?.data) {
        console.error('Error details:', error.response.data)
      }
    }

    // Обработка различных ошибок
    if (error.response) {
      // Важно: сначала проверяем статус 401 и только потом используем authStore
      if (error.response.status === 401) {
        // Создаем authStore только при необходимости и вне цикла
        try {
          const authStore = useAuthStore()
          authStore.logout()
          ElMessage.error('Сессия истекла. Пожалуйста, войдите снова.')
        } catch (storeError) {
          console.error('Error using auth store:', storeError)
          // Принудительная редирекция, если не удалось использовать store
          window.location.href = '/login'
        }
        return Promise.reject(error)
      }
      
      switch (error.response.status) {
        case 403:
          ElMessage.error('Доступ запрещен')
          break
        case 404:
          ElMessage.error('Ресурс не найден')
          break
        case 400:
          const errorMessage = extractErrorMessage(error.response.data)
          ElMessage.error(errorMessage)
          break
        case 500:
          ElMessage.error('Ошибка сервера')
          break
        default:
          ElMessage.error(`Ошибка ${error.response.status}`)
      }
    } else if (error.request) {
      ElMessage.error('Сервер не отвечает. Проверьте подключение к интернету.')
    } else {
      ElMessage.error('Ошибка при отправке запроса')
    }
    return Promise.reject(error)
  }
)

// Вспомогательная функция для извлечения сообщения об ошибке из разных форматов
function extractErrorMessage(errorData: any): string {
  if (!errorData) return 'Неизвестная ошибка'
  
  if (typeof errorData === 'string') return errorData
  
  if (errorData.detail) return errorData.detail
  
  if (errorData.non_field_errors && Array.isArray(errorData.non_field_errors)) {
    return errorData.non_field_errors.join(', ')
  }
  
  // Для ошибок валидации полей
  const fieldErrors = Object.entries(errorData)
    .filter(([key]) => key !== 'detail')
    .map(([field, errors]: [string, any]) => {
      const errorMsg = Array.isArray(errors) ? errors.join(', ') : errors
      return `${field}: ${errorMsg}`
    })
  
  if (fieldErrors.length) return fieldErrors.join('; ')
  
  return 'Ошибка в запросе'
}

export default axiosInstance 