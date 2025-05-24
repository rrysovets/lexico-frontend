import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useLayoutStore = defineStore('layout', () => {
  // State
  const isSidebarOpen = ref(true)
  const isSidebarCollapsed = ref(false)
  const isMobileView = ref(false)

  // Actions
  function toggleSidebar() {
    if (isMobileView.value) {
      isSidebarOpen.value = !isSidebarOpen.value
    } else {
      isSidebarCollapsed.value = !isSidebarCollapsed.value
    }
  }

  function updateMobileView(value: boolean) {
    isMobileView.value = value
    if (value) {
      isSidebarOpen.value = false
      isSidebarCollapsed.value = false
    }
  }

  function closeSidebarOnMobile() {
    if (isMobileView.value) {
      isSidebarOpen.value = false
    }
  }

  return {
    // State
    isSidebarOpen,
    isSidebarCollapsed,
    isMobileView,
    
    // Actions
    toggleSidebar,
    updateMobileView,
    closeSidebarOnMobile
  }
}) 