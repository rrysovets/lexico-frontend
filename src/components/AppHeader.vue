<template>
  <header 
    class="app-header"
    :class="{
      'has-sidebar': layoutStore.isSidebarOpen && !layoutStore.isMobileView,
      'sidebar-collapsed': layoutStore.isSidebarCollapsed && !layoutStore.isMobileView
    }"
  >
    <!-- Мобильная кнопка меню -->
    <button 
      v-if="layoutStore.isMobileView"
      class="mobile-menu-button" 
      @click="layoutStore.toggleSidebar"
    >
      <el-icon><Menu /></el-icon>
    </button>

    <!-- Поиск -->
    <div class="search-section">
      <el-input
        v-model="searchQuery"
        placeholder="Поиск..."
        class="search-input"
        :prefix-icon="Search"
        clearable
        @input="handleSearch"
      />
    </div>

    <!-- Кнопка создания -->
    <div class="create-section">
      <el-dropdown trigger="click" @command="handleCreate">
        <el-button 
          type="primary" 
          circle
          class="create-button"
        >
          <el-icon><Plus /></el-icon>
        </el-button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item command="module">
              <el-icon><Files /></el-icon>
              <span>Модуль</span>
            </el-dropdown-item>
            <el-dropdown-item command="folder">
              <el-icon><Folder /></el-icon>
              <span>Папка</span>
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>

    <!-- Профиль -->
    <div class="profile-section">
      <el-dropdown trigger="click" class="profile-dropdown">
        <button class="profile-button">
          <el-avatar 
            :size="32"
            :icon="User"
          />
          <span class="username">{{ username }}</span>
          <el-icon class="dropdown-icon"><ArrowDown /></el-icon>
        </button>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="router.push('/statistics')">
              <el-icon><TrendCharts /></el-icon>
              Статистика
            </el-dropdown-item>
            <el-dropdown-item divided @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
              Выйти
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
  </div>
  </header>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useAuthStore } from '@/stores/auth'
import { useLayoutStore } from '@/stores/layout'
import { useRouter } from 'vue-router'
import { 
  Menu,
  ArrowDown, 
  User, 
  SwitchButton,
  Search,
  Plus,
  Files,
  Folder,
  TrendCharts
} from '@element-plus/icons-vue'
import { ElMessageBox } from 'element-plus'

const emit = defineEmits<{
  (e: 'show-create-module'): void
  (e: 'show-create-folder'): void
}>()

const authStore = useAuthStore()
const layoutStore = useLayoutStore()
const router = useRouter()
const searchQuery = ref('')

const username = computed(() => authStore.user?.username || '')

function handleSearch(value: string) {
  // Emit search event
  console.log('Search query:', value)
}

async function handleLogout() {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите выйти?',
      'Подтверждение выхода',
      {
        confirmButtonText: 'Выйти',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    )
  await authStore.logout()
  router.push('/login')
  } catch {
    // Пользователь отменил выход
  }
}

function handleCreate(command: string) {
  switch (command) {
    case 'module':
      emit('show-create-module')
      break
    case 'folder':
      emit('show-create-folder')
      break
  }
}
</script>

<style scoped>
.app-header {
  height: var(--header-height, 64px);
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 0 24px;
  background: var(--el-bg-color);
  border-bottom: 1px solid var(--el-border-color-light);
  position: fixed;
  top: 0;
  right: 0;
  left: var(--sidebar-collapsed-width, 64px);
  z-index: 1000;
  transition: left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  width: auto;
}

.app-header.has-sidebar {
  left: var(--sidebar-collapsed-width, 64px);
}

.app-header.sidebar-collapsed {
  width: calc(100% - var(--sidebar-collapsed-width, 64px));
  left: var(--sidebar-collapsed-width, 64px);
}

@media (max-width: 768px) {
  .app-header {
    left: 0;
    padding: 0 16px;
  }

  .mobile-menu-button {
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .search-section {
    margin: 0;
    max-width: none;
  }

  .username {
    display: none;
  }

  .profile-button {
    padding: 6px;
  }

  .create-section {
    margin-left: 8px;
  }
}

.mobile-menu-button {
  display: none;
  width: 40px;
  height: 40px;
  border-radius: var(--el-border-radius-base);
  border: none;
  background: transparent;
  color: var(--el-text-color-primary);
  cursor: pointer;
}

.search-section {
  flex: 1;
  max-width: 600px;
  margin: 0 auto;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: var(--el-border-radius-base);
  box-shadow: none !important;
  border: 1px solid var(--el-border-color);
  transition: all 0.3s ease;
}

.search-input :deep(.el-input__wrapper:hover) {
  border-color: var(--el-color-primary-light-7);
}

.search-input :deep(.el-input__wrapper.is-focus) {
  border-color: var(--el-color-primary);
  box-shadow: 0 0 0 1px var(--el-color-primary) !important;
}

.create-section {
  margin-left: auto;
}

.create-button {
  width: 40px;
  height: 40px;
  font-size: 20px;
  border: none;
  background: var(--el-color-primary);
  color: white;
  transition: all 0.3s ease;
}

.create-button:hover {
  transform: rotate(90deg);
  background: var(--el-color-primary-dark-2);
}

.profile-section {
  display: flex;
  align-items: center;
  gap: 8px;
}

.profile-button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--el-border-color);
  background: var(--el-bg-color);
  color: var(--el-text-color-primary);
  cursor: pointer;
  transition: all 0.3s ease;
}

.profile-button:hover {
  border-color: var(--el-color-primary-light-7);
  background: var(--el-fill-color-light);
}

.username {
  font-size: 14px;
  font-weight: 500;
}

.dropdown-icon {
  font-size: var(--font-size-sm);
  color: var(--color-secondary-500);
  transition: all 0.2s ease;
}

.profile-button:hover .dropdown-icon {
  transform: translateY(2px);
}

:deep(.el-dropdown-menu) {
  padding: 4px;
  border-radius: var(--el-border-radius-base);
  border: 1px solid var(--el-border-color-light);
  box-shadow: var(--el-box-shadow-light);
}

:deep(.el-dropdown-menu__item) {
  padding: 8px 16px;
  border-radius: var(--el-border-radius-base);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 8px;
}

:deep(.el-dropdown-menu__item .el-icon) {
  margin: 0;
  font-size: 16px;
}
</style> 