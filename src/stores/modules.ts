import { defineStore } from 'pinia'
import axiosInstance from '@/utils/axios'
import { useAuthStore } from './auth'
import { ElMessage } from 'element-plus'
import { ref, computed, watch, toRaw } from 'vue'

// Строгая типизация словаря
export interface Dictionary {
  [key: string]: string
}

// Строгая типизация данных модуля
export interface Module {
  id: number
  title: string
  dictionary: Dictionary
  is_public: boolean
  created_at: string
  updated_at: string
  author: string
  username: string
  is_liked: boolean
  rating: number
}

// Состояние модулей
interface ModulesState {
  modules: Module[]
  selectedModules: number[]
  currentModule: Module | null
}

// Создание хранилища с улучшенной обработкой ошибок и типизацией
export const useModulesStore = defineStore('modules', () => {
  // Основные состояния
  const modules = ref<Module[]>([])
  const selectedModules = ref<number[]>([])
  const currentModule = ref<Module | null>(null)
  const isLoading = ref<boolean>(false)
  const lastError = ref<string | null>(null)

  // Добавим вычисляемое свойство для публичных модулей
  const publicModules = computed(() => 
    modules.value.filter(m => m.is_public)
  )

  // Метод для загрузки модулей с обработкой ошибок и состояния загрузки
  async function fetchModules() {
    if (isLoading.value) {
      console.log('Fetch already in progress, skipping duplicate request')
      return
    }
    
    isLoading.value = true
    lastError.value = null
    
    try {
      console.log('Fetching modules...')
      const response = await axiosInstance.get('/api/v1/modules/')
      
      if (!response.data) {
        throw new Error('No data received from server')
      }

      // Обрабатываем данные в зависимости от формата ответа
      let modulesList: Module[] = []
      if (Array.isArray(response.data)) {
        modulesList = response.data
      } else if (response.data.results && Array.isArray(response.data.results)) {
        modulesList = response.data.results
      } else {
        throw new Error('Unexpected data format')
      }

      // Валидируем полученные модули
      modulesList = modulesList.filter((module: any) => {
        // Базовая валидация
        if (!module || typeof module !== 'object' || !module.id || 
            typeof module.id !== 'number' || !module.title) {
          return false
        }
        
        // Убедимся, что dictionary всегда объект
        if (!module.dictionary || typeof module.dictionary !== 'object') {
          module.dictionary = {}
        }
        
        return true
      })

      // Важно: сохраняем новый массив для реактивности
      modules.value = modulesList
      console.log(`Updated modules state with ${modules.value.length} items`)
      
      return modules.value
    } catch (error: any) {
      console.error('Fetch modules error:', error)
      lastError.value = error.message || 'Ошибка при загрузке модулей'
      throw error
    } finally {
      isLoading.value = false
    }
  }

  // Создание модуля с улучшенной валидацией
  async function createModule(title: string, dictionary: Dictionary, is_public: boolean = true) {
    if (!title.trim()) {
      ElMessage.error('Название модуля не может быть пустым')
      return false
    }
    
    // Валидируем словарь
    const validatedDictionary = validateDictionary(dictionary)
    
    if (Object.keys(validatedDictionary).length === 0) {
      ElMessage.error('Словарь не может быть пустым')
      return false
    }
    
    isLoading.value = true
    lastError.value = null
    
    try {
      const moduleData = {
        title: title.trim(),
        dictionary: validatedDictionary,
        is_public
      }
      
      console.log('Creating module:', moduleData)
      const response = await axiosInstance.post('/api/v1/modules/', moduleData)
      
      if (!response.data?.id) {
        throw new Error('Не получен ID созданного модуля')
      }

      // Добавляем новый модуль в список
      const newModule = response.data as Module
      modules.value = [...modules.value, newModule]
      
      return true
    } catch (error: any) {
      console.error('Create module error:', error)
      lastError.value = error.message || 'Ошибка при создании модуля'
      ElMessage.error(error.response?.data?.detail || error.message || 'Ошибка при создании модуля')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Обновление модуля с оптимизированным взаимодействием с сервером
  async function updateModule(id: number, title: string, dictionary: Dictionary, is_public: boolean = true) {
    if (!title.trim()) {
      ElMessage.error('Название модуля не может быть пустым')
      return false
    }
    
    const validatedDictionary = validateDictionary(dictionary)
    
    if (Object.keys(validatedDictionary).length === 0) {
      ElMessage.error('Словарь не может быть пустым')
      return false
    }
    
    isLoading.value = true
    lastError.value = null
    
    try {
      const updateData = {
        title: title.trim(),
        dictionary: validatedDictionary,
        is_public
      }
      
      console.log(`Updating module ${id}:`, updateData)
      const response = await axiosInstance.patch(`/api/v1/modules/${id}/`, updateData)
      
      if (!response.data?.id) {
        throw new Error('Не получен корректный ответ от сервера')
      }

      // Создаем полную копию объекта из ответа, избегаем прокси
      const updatedModule = { ...response.data } as Module
      
      // Находим индекс модуля в массиве
      const moduleIndex = modules.value.findIndex(m => m.id === id)
      
      // Создаем новый массив с обновленным модулем для сохранения реактивности
      if (moduleIndex !== -1) {
        modules.value = modules.value.map(module => 
          module.id === id ? updatedModule : module
        )
      } else {
        // Если модуль не найден, добавляем его в список
        modules.value = [...modules.value, updatedModule]
      }
      
      // Обновляем текущий модуль, если это он
      if (currentModule.value?.id === id) {
        currentModule.value = updatedModule
      }
      
      console.log('Module updated successfully')
      ElMessage.success('Модуль успешно обновлен')
      return true
    } catch (error: any) {
      console.error('Update module error:', error)
      lastError.value = error.message || 'Ошибка при обновлении модуля'
      ElMessage.error(error.response?.data?.detail || error.message || 'Ошибка при обновлении модуля')
      return false
    } finally {
      isLoading.value = false
    }
  }

  // Удаление модуля с подтверждением
  async function deleteModule(id: number) {
    isLoading.value = true
    lastError.value = null
    
    try {
      console.log(`Deleting module ${id}`)
      const response = await axiosInstance.delete(`/api/v1/modules/${id}/`)
      
      // Проверяем код ответа на успешное удаление
      if (![200, 204].includes(response.status)) {
        throw new Error(`Unexpected response status: ${response.status}`)
      }
      
      // Удаляем модуль из всех коллекций
      modules.value = modules.value.filter(m => m.id !== id)
      selectedModules.value = selectedModules.value.filter(moduleId => moduleId !== id)
      
      // Если это был текущий модуль, очищаем его
      if (currentModule.value?.id === id) {
        currentModule.value = null
      }
      
      return true
    } catch (error: any) {
      console.error('Delete module error:', error)
      lastError.value = error.message || 'Ошибка при удалении модуля'
      throw new Error(error.response?.data?.detail || 'Ошибка при удалении модуля')
    } finally {
      isLoading.value = false
    }
  }

  // Функция для валидации словаря
  function validateDictionary(dictionary: Dictionary): Dictionary {
    const result: Dictionary = {}
    
    // Обрабатываем только пары, где есть и ключ и значение
    Object.entries(dictionary).forEach(([key, value]) => {
      const trimmedKey = String(key).trim()
      const trimmedValue = String(value).trim()
      
      if (trimmedKey && trimmedValue) {
        result[trimmedKey] = trimmedValue
      }
    })
    
    return result
  }

  // Добавляем функцию для получения конкретного модуля по ID
  function getModuleById(id: number): Module | undefined {
    return modules.value.find(m => m.id === id)
  }

  // Работа с выбранными модулями
  function toggleModuleSelection(moduleId: number) {
    const index = selectedModules.value.indexOf(moduleId)
    if (index === -1) {
      selectedModules.value = [...selectedModules.value, moduleId]
    } else {
      selectedModules.value = selectedModules.value.filter(id => id !== moduleId)
    }
  }

  function clearSelection() {
    selectedModules.value = []
  }

  // Функция генерации темы (оставляем как есть, так как она объемная)
  async function generateTheme(theme: string, onProgress?: () => void, count_of_words: number = 10) {
    try {
      console.log('Generating dictionary for theme:', theme, 'count_of_words:', count_of_words)
      const encodedTheme = encodeURIComponent(theme)
      const countParam = `&count_of_words=${count_of_words}`
      
      // Инициируем генерацию
      const response = await axiosInstance.post(`/api/v1/generate-theme?theme=${encodedTheme}${countParam}`)
      
      if (!response.data?.task_id) {
        throw new Error('Не получен идентификатор задачи')
      }

      const taskId = response.data.task_id
      console.log('Generation task started:', taskId)

      // Функция для одной попытки получения результата
      const checkResult = async () => {
        const resultResponse = await axiosInstance.get(`/api/v1/generate-theme-result/${taskId}`)
        console.log('Raw response:', resultResponse.data)
        
        const { status, data, error } = resultResponse.data

        if (!status) {
          throw new Error('Получен некорректный ответ от сервера')
        }

        console.log(`Task ${taskId} status:`, status, 'data:', data)

        // Приводим статус к нижнему регистру для сравнения
        const lowerStatus = String(status).toLowerCase()

        switch (lowerStatus) {
          case 'success':
            if (!data) {
              throw new Error('Получен успешный статус, но данные отсутствуют')
            }
            console.log('Success data:', data)
            return { finished: true, data }
          
          case 'failure':
            throw new Error(error || 'Ошибка при генерации словаря')
          
          case 'pending':
          case 'started':
            return { finished: false }
          
          default:
            console.error('Unexpected status:', status)
            console.error('Full response:', resultResponse.data)
            throw new Error(`Неожиданный статус: ${status}`)
        }
      }

      // Функция для повторных попыток с задержкой
      const retryWithDelay = async (retries: number, delay: number) => {
        for (let i = 0; i < retries; i++) {
          try {
            const result = await checkResult()
            if (result.finished) {
              return result.data
            }
          } catch (error) {
            console.error(`Attempt ${i + 1} failed:`, error)
            if (i === retries - 1) throw error
          }
          
          // Вызываем колбэк прогресса, если он предоставлен
          if (onProgress) {
            onProgress()
          }
          
          if (i < retries - 1) { // Не ждем после последней попытки
            await new Promise(resolve => setTimeout(resolve, delay))
          }
        }
        throw new Error('Превышено время ожидания генерации словаря')
      }

      // Запускаем процесс ожидания:
      // - 6 попыток
      // - 5 секунд между попытками
      // - Общее время ожидания: 30 секунд
      return await retryWithDelay(6, 5000)

    } catch (error: any) {
      console.error('Generate theme error:', error)
      ElMessage.error(error.response?.data?.detail || error.message || 'Ошибка при генерации словаря')
      return null
    }
  }

  // Добавляем функцию для переключения лайка
  async function toggleLike(moduleId: number) {
    try {
      const response = await axiosInstance.post(`/api/v1/modules/${moduleId}/toggle_like/`)
      
      if (response.status === 200) {
        // Обновляем состояние лайка и рейтинга в локальном хранилище
        modules.value = modules.value.map(module => {
          if (module.id === moduleId) {
            const newIsLiked = !module.is_liked
            return { 
              ...module, 
              is_liked: newIsLiked,
              rating: newIsLiked ? module.rating + 1 : module.rating - 1
            }
          }
          return module
        })
        return true
      }
      return false
    } catch (error: any) {
      console.error('Toggle like error:', error)
      ElMessage.error(error.response?.data?.detail || 'Ошибка при изменении лайка')
      return false
    }
  }

  return {
    modules,
    publicModules,
    selectedModules,
    currentModule,
    isLoading,
    lastError,
    fetchModules,
    createModule,
    updateModule,
    deleteModule,
    generateTheme,
    toggleModuleSelection,
    clearSelection,
    getModuleById,
    validateDictionary,
    toggleLike
  }
}) 