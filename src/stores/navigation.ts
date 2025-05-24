import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { House, Collection, Star, TrendCharts, Folder, Files, View, Hide } from '@element-plus/icons-vue'

export interface NavSection {
  id: string
  title: string
  icon: any
  path: string
  filters?: {
    id: string
    title: string
    icon: any
  }[]
}

export const useNavigationStore = defineStore('navigation', () => {
  // Основные разделы
  const sections: NavSection[] = [
    {
      id: 'home',
      title: 'Главная',
      icon: House,
      path: '/',
      filters: [
        { id: 'all', title: 'Все', icon: Collection },
        { id: 'public', title: 'Публичные', icon: View },
        { id: 'private', title: 'Приватные', icon: Hide }
      ]
    },
    {
      id: 'my-library',
      title: 'Моя библиотека',
      icon: Collection,
      path: '/library',
      filters: [
        { id: 'modules', title: 'Модули', icon: Files },
        { id: 'folders', title: 'Папки', icon: Folder }
      ]
    },
    {
      id: 'favorites',
      title: 'Избранное',
      icon: Star,
      path: '/favorites',
      filters: [
        { id: 'favorite-modules', title: 'Модули', icon: Files },
        { id: 'favorite-folders', title: 'Папки', icon: Folder }
      ]
    },
    {
      id: 'statistics',
      title: 'Статистика',
      icon: TrendCharts,
      path: '/statistics'
    }
  ]

  // Текущий раздел
  const currentSectionId = ref('home')
  const currentFilterId = ref('all')

  // Вычисляемые свойства
  const currentSection = computed(() => 
    sections.find(section => section.id === currentSectionId.value)
  )

  const availableFilters = computed(() => 
    currentSection.value?.filters || []
  )

  // Actions
  function setSection(sectionId: string) {
    currentSectionId.value = sectionId
    // Сбрасываем фильтр при смене раздела на первый доступный
    if (currentSection.value?.filters?.length) {
      currentFilterId.value = currentSection.value.filters[0].id
    } else {
      currentFilterId.value = ''
    }
  }

  function setFilter(filterId: string) {
    currentFilterId.value = filterId
  }

  return {
    // State
    sections,
    currentSectionId,
    currentFilterId,
    
    // Computed
    currentSection,
    availableFilters,
    
    // Actions
    setSection,
    setFilter
  }
}) 