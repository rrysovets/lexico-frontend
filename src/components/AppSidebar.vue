<template>
  <aside 
    class="sidebar" 
    :class="{ 
      'is-open': layoutStore.isSidebarOpen,
      'is-collapsed': layoutStore.isSidebarCollapsed && !layoutStore.isMobileView
    }"
  >
    <div class="sidebar-header">
      <div class="logo-container">
        <span class="logo">LEXICO</span>
        <span class="logo-collapsed">L</span>
      </div>
      
      <button 
        v-if="!layoutStore.isMobileView"
        class="collapse-button" 
        @click="layoutStore.toggleSidebar"
      >
        <el-icon><ArrowLeft /></el-icon>
      </button>
    </div>

    <nav class="sidebar-content">
      <el-menu
        :default-active="currentRoute"
        class="nav-menu"
        :collapse="layoutStore.isSidebarCollapsed && !layoutStore.isMobileView"
        @select="handleNavigation"
      >
        <el-menu-item 
          v-for="section in navigationStore.sections"
          :key="section.path"
          :index="section.path"
          :class="{ 'is-active': navigationStore.currentSectionId === section.id }"
        >
          <el-icon><component :is="section.icon" /></el-icon>
          <template #title>
            <span class="nav-title">{{ section.title }}</span>
          </template>
        </el-menu-item>

        <div class="menu-divider"></div>

        <el-menu-item index="/study" class="study-button">
          <el-icon><Reading /></el-icon>
          <template #title>
            <span class="nav-title">Изучение</span>
          </template>
        </el-menu-item>
      </el-menu>
    </nav>

    <div v-if="layoutStore.isMobileView" class="mobile-overlay" @click="layoutStore.toggleSidebar" />
  </aside>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useLayoutStore } from '@/stores/layout'
import { useNavigationStore } from '@/stores/navigation'
import { ArrowLeft, Reading } from '@element-plus/icons-vue'

const router = useRouter()
const route = useRoute()
const layoutStore = useLayoutStore()
const navigationStore = useNavigationStore()

const currentRoute = computed(() => route.path)

function handleNavigation(path: string) {
  if (path === '/study') {
    router.push(path)
    layoutStore.closeSidebarOnMobile()
    return
  }

  const section = navigationStore.sections.find(s => s.path === path)
  if (section) {
    navigationStore.setSection(section.id)
  }
  router.push(path)
  layoutStore.closeSidebarOnMobile()
}

function handleResize() {
  layoutStore.updateMobileView(window.innerWidth < 768)
}

onMounted(() => {
  handleResize()
  window.addEventListener('resize', handleResize)
  
  // Устанавливаем текущий раздел при монтировании
  const currentSection = navigationStore.sections.find(s => s.path === route.path)
  if (currentSection) {
    navigationStore.setSection(currentSection.id)
  }
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
})
</script>

<style scoped>
.sidebar {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: var(--sidebar-width, 260px);
  background: var(--el-bg-color);
  border-right: 1px solid var(--el-border-color-light);
  display: flex;
  flex-direction: column;
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  z-index: 1001;
  transform: translateX(-100%);
}

.sidebar.is-open {
  transform: translateX(0);
}

.sidebar.is-collapsed {
  width: var(--sidebar-collapsed-width, 64px);
  transform: translateX(0);
}

@media (min-width: 769px) {
  .sidebar {
    transform: translateX(0);
  }
  
  .sidebar.is-collapsed {
    transform: translateX(0);
  }
}

@media (max-width: 768px) {
  .sidebar {
    transform: translateX(-100%);
  }

  .sidebar.is-open {
    transform: translateX(0);
  }

  .mobile-overlay {
    position: fixed;
    inset: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: -1;
    opacity: 0;
    transition: opacity 0.3s ease;
    backdrop-filter: blur(4px);
  }

  .sidebar.is-open .mobile-overlay {
    opacity: 1;
  }
}

.sidebar-header {
  height: var(--header-height, 64px);
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  border-bottom: 1px solid var(--el-border-color-light);
  background: var(--el-bg-color);
  overflow: hidden;
}

.logo-container {
  position: relative;
  width: 100%;
  height: 32px;
  overflow: visible;
  display: flex;
  align-items: center;
}

.logo, .logo-collapsed {
  font-size: 24px;
  font-weight: 700;
  color: var(--el-color-primary);
  letter-spacing: 0.05em;
  transition: all 0.3s ease;
  white-space: nowrap;
}

.logo {
  opacity: 1;
  transform: translateX(0);
}

.logo-collapsed {
  position: absolute;
  left: 0;
  opacity: 0;
  transform: translateX(-20px);
}

.sidebar.is-collapsed .logo {
  opacity: 0;
  transform: translateX(20px);
}

.sidebar.is-collapsed .logo-collapsed {
  opacity: 1;
  transform: translateX(0);
}

.collapse-button {
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--el-text-color-secondary);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.3s ease;
  flex-shrink: 0;
}

.collapse-button:hover {
  color: var(--el-color-primary);
}

.sidebar.is-collapsed .collapse-button :deep(.el-icon) {
  transform: rotate(180deg);
}

.sidebar-content {
  flex: 1;
  overflow: hidden auto;
  padding: 16px 8px;
}

.nav-menu {
  border: none;
  background: transparent;
}

:deep(.el-menu) {
  border: none;
  background: transparent;
}

:deep(.el-menu--collapse) {
  width: var(--sidebar-collapsed-width);
}

:deep(.el-menu-item) {
  height: 40px;
  line-height: 40px;
  margin: 4px 0;
  padding: 0 12px !important;
  border-radius: var(--el-border-radius-base);
}

:deep(.el-menu-item:hover) {
  background-color: var(--el-fill-color-light) !important;
  color: var(--el-color-primary) !important;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9) !important;
  color: var(--el-color-primary) !important;
  font-weight: 600;
}

:deep(.el-menu-item .el-icon) {
  font-size: 18px;
}

.nav-title {
  font-size: 14px;
  margin-left: 8px;
}

.menu-divider {
  height: 1px;
  background-color: var(--el-border-color-light);
  margin: 8px 16px;
}

.sidebar.is-collapsed .menu-divider {
  margin: 8px 4px;
}

:deep(.study-button) {
  margin-top: 8px;
}

:deep(.el-menu) {
  border-right: none;
}

:deep(.el-menu-item) {
  height: 50px;
  line-height: 50px;
}

:deep(.el-menu-item.is-active) {
  background-color: var(--el-color-primary-light-9);
}

:deep(.el-menu-item:hover) {
  background-color: var(--el-fill-color-light);
}

:deep(.el-menu--collapse) .menu-divider {
  margin: 8px 4px;
}
</style> 