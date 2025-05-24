import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import axiosInstance from '@/utils/axios'
import { ElMessage } from 'element-plus'
import type { Module } from './modules'
import { useModulesStore } from './modules'

// Интерфейс папки
export interface Folder {
  id: number
  title: string
  modules: Module[]
  is_public: boolean
  author: string
  created_at: string
  updated_at: string
  rating: number
  is_liked: boolean
}

// Интерфейс для создания/обновления папки
interface FolderCreateUpdate {
  title: string
  modules: number[]
  is_public: boolean
}

export const useFoldersStore = defineStore('folders', () => {
  // Состояния
  const folders = ref<Folder[]>([])
  const currentFolder = ref<Folder | null>(null)
  const isLoading = ref<boolean>(false)
  const lastError = ref<string | null>(null)

  // Вычисляемые свойства
  const publicFolders = computed<Folder[]>(() => 
    folders.value.filter(f => f.is_public)
  )

  // Методы для работы с папками
  async function fetchFolders() {
    console.log('Starting fetchFolders...')
    if (isLoading.value) {
      console.log('fetchFolders: Loading in progress, skipping...')
      return
    }

    isLoading.value = true
    lastError.value = null

    try {
      console.log('fetchFolders: Making API request...')
      const response = await axiosInstance.get('/api/v1/folders/')
      console.log('fetchFolders: Received response:', response.data)

      // Обрабатываем данные в зависимости от формата ответа
      let foldersList: Folder[] = []
      if (Array.isArray(response.data)) {
        foldersList = response.data
      } else if (response.data.results && Array.isArray(response.data.results)) {
        foldersList = response.data.results
      } else {
        throw new Error('Unexpected data format')
      }

      // Валидируем полученные папки
      foldersList = foldersList.filter((folder: any) => {
        // Базовая валидация
        if (!folder || typeof folder !== 'object' || !folder.id || 
            typeof folder.id !== 'number' || !folder.title) {
          return false
        }
        
        // Убедимся, что modules всегда массив
        if (!Array.isArray(folder.modules)) {
          folder.modules = []
        }
        
        return true
      })

      // Важно: сохраняем новый массив для реактивности
      folders.value = foldersList
      console.log(`Updated folders state with ${folders.value.length} items`)
      
      return folders.value
    } catch (error: any) {
      console.error('Fetch folders error:', error)
      lastError.value = error.message || 'Ошибка при загрузке папок'
      throw error
    } finally {
      isLoading.value = false
      console.log('fetchFolders: Completed')
    }
  }

  async function createFolder(title: string, moduleIds: number[], is_public: boolean = true): Promise<boolean> {
    if (!title.trim() || moduleIds.length === 0) {
      ElMessage.error(moduleIds.length === 0 ? 'Выберите хотя бы один модуль' : 'Название папки не может быть пустым')
      return false
    }

    isLoading.value = true
    lastError.value = null

    try {
      // Убеждаемся, что модули загружены
      const modulesStore = useModulesStore()
      if (modulesStore.modules.length === 0) {
        await modulesStore.fetchModules()
      }

      // Создаем папку с модулями
      const folderData: FolderCreateUpdate = {
        title: title.trim(),
        modules: moduleIds,
        is_public
      }

      const response = await axiosInstance.post('/api/v1/folders/', folderData)
      const newFolder = response.data as Folder
      
      // Получаем информацию о модулях из стора
      const modules = moduleIds
        .map(id => modulesStore.getModuleById(id))
        .filter((module): module is Module => module !== undefined)

      // Добавляем папку в стор с полной информацией о модулях
      folders.value = [...folders.value, { ...newFolder, modules }]

      return true
    } catch (error: any) {
      console.error('Create folder error:', error)
      lastError.value = error.message || 'Ошибка при создании папки'
      ElMessage.error(error.response?.data?.detail || error.message || 'Ошибка при создании папки')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function updateFolder(id: number, title: string, moduleIds: number[], is_public: boolean = true): Promise<boolean> {
    if (!title.trim() || moduleIds.length === 0) {
      ElMessage.error(moduleIds.length === 0 ? 'Выберите хотя бы один модуль' : 'Название папки не может быть пустым')
      return false
    }

    isLoading.value = true
    lastError.value = null

    try {
      // Убеждаемся, что модули загружены
      const modulesStore = useModulesStore()
      if (modulesStore.modules.length === 0) {
        await modulesStore.fetchModules()
      }

      // Обновляем папку с новым списком модулей
      const updateData: FolderCreateUpdate = {
        title: title.trim(),
        modules: moduleIds,
        is_public
      }

      const response = await axiosInstance.patch(`/api/v1/folders/${id}/`, updateData)
      const updatedFolder = response.data as Folder

      // Получаем информацию о модулях из стора
      const modules = moduleIds
        .map(id => modulesStore.getModuleById(id))
        .filter((module): module is Module => module !== undefined)

      // Обновляем папку в сторе с полной информацией о модулях
      folders.value = folders.value.map(folder => 
        folder.id === id ? { ...updatedFolder, modules } : folder
      )

      ElMessage.success('Папка успешно обновлена')
      return true
    } catch (error: any) {
      console.error('Update folder error:', error)
      lastError.value = error.message || 'Ошибка при обновлении папки'
      ElMessage.error(error.response?.data?.detail || error.message || 'Ошибка при обновлении папки')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function deleteFolder(id: number) {
    isLoading.value = true
    lastError.value = null

    try {
      await axiosInstance.delete(`/api/v1/folders/${id}/`)
      folders.value = folders.value.filter(folder => folder.id !== id)
      if (currentFolder.value?.id === id) {
        currentFolder.value = null
      }
      return true
    } catch (error: any) {
      console.error('Delete folder error:', error)
      lastError.value = error.message || 'Ошибка при удалении папки'
      ElMessage.error(error.response?.data?.detail || error.message || 'Ошибка при удалении папки')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function toggleFolderLike(id: number): Promise<boolean> {
    try {
      const response = await axiosInstance.post(`/api/v1/folders/${id}/toggle_like/`)
      const { rating, liked } = response.data
      
      // Обновляем папку в списке
      folders.value = folders.value.map(folder => {
        if (folder.id === id) {
          return {
            ...folder,
            rating,
            is_liked: liked
          }
        }
        return folder
      })
      
      ElMessage.success(liked ? 'Папка добавлена в избранное' : 'Папка удалена из избранного')
      return true
    } catch (error: any) {
      console.error('Toggle folder like error:', error)
      ElMessage.error('Ошибка при обновлении лайка')
      return false
    }
  }

  function getFolderById(id: number): Folder | undefined {
    return folders.value.find(folder => folder.id === id)
  }

  async function addModulesToFolder(folderId: number, moduleIds: number[]): Promise<boolean> {
    if (!moduleIds.length) {
      ElMessage.error('Выберите хотя бы один модуль')
      return false
    }

    isLoading.value = true
    lastError.value = null

    try {
      const response = await axiosInstance.post(`/api/v1/folders/${folderId}/add_modules/`, {
        module_ids: moduleIds
      })

      // Получаем актуальную информацию о модулях из стора
      const modulesStore = useModulesStore()
      const addedModules = moduleIds
        .map(id => modulesStore.getModuleById(id))
        .filter((module): module is Module => module !== undefined)

      // Обновляем папку в сторе
      folders.value = folders.value.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            modules: [...folder.modules, ...addedModules]
          }
        }
        return folder
      })

      ElMessage.success(`Добавлено ${addedModules.length} модулей в папку`)
      return true
    } catch (error: any) {
      console.error('Add modules to folder error:', error)
      lastError.value = error.message || 'Ошибка при добавлении модулей'
      ElMessage.error(error.response?.data?.detail || error.message || 'Ошибка при добавлении модулей')
      return false
    } finally {
      isLoading.value = false
    }
  }

  async function removeModulesFromFolder(folderId: number, moduleIds: number[]): Promise<boolean> {
    if (!moduleIds.length) {
      ElMessage.error('Выберите хотя бы один модуль')
      return false
    }

    isLoading.value = true
    lastError.value = null

    try {
      const response = await axiosInstance.post(`/api/v1/folders/${folderId}/remove_modules/`, {
        module_ids: moduleIds
      })

      // Обновляем папку в сторе
      folders.value = folders.value.map(folder => {
        if (folder.id === folderId) {
          return {
            ...folder,
            modules: folder.modules.filter(module => !moduleIds.includes(module.id))
          }
        }
        return folder
      })

      ElMessage.success(`Удалено ${moduleIds.length} модулей из папки`)
      return true
    } catch (error: any) {
      console.error('Remove modules from folder error:', error)
      lastError.value = error.message || 'Ошибка при удалении модулей'
      ElMessage.error(error.response?.data?.detail || error.message || 'Ошибка при удалении модулей')
      return false
    } finally {
      isLoading.value = false
    }
  }

  return {
    folders,
    currentFolder,
    isLoading,
    lastError,
    publicFolders,
    fetchFolders,
    createFolder,
    updateFolder,
    deleteFolder,
    toggleFolderLike,
    getFolderById,
    addModulesToFolder,
    removeModulesFromFolder
  }
}) 