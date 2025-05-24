<template>
  <div 
    class="app-layout"
    :class="{
      'has-sidebar': layoutStore.isSidebarOpen && !layoutStore.isMobileView,
      'sidebar-collapsed': layoutStore.isSidebarCollapsed && !layoutStore.isMobileView
    }"
  >
    <app-sidebar />
    
    <div class="main-content">
      <app-header 
        @show-create-module="showCreateModuleDialog = true"
        @show-create-folder="showCreateFolderDialog = true"
      />

      <div class="page-content">
        <div class="page-container">
          <navigation-filters class="navigation-filters" />

          <div class="card-grid">
            <!-- Существующие модули -->
            <module-selection-card
              v-for="module in filteredModules"
            :key="module.id"
              :module="module"
              :is-selected="isModuleSelected(module.id)"
              :is-personal="isPersonalModule(module)"
              @select="modulesStore.toggleModuleSelection(module.id)"
              @toggle-like="toggleModuleLike(module.id)"
              @edit="editModule(module)"
              @delete="deleteModule(module.id)"
              @view="viewDictionary(module)"
            />

            <!-- Папки -->
            <folder-card
              v-for="folder in filteredFolders"
              :key="folder.id"
              :folder="folder"
              :is-personal="isPersonalFolder(folder)"
              :is-selected="isFolderSelected(folder.id)"
              @toggle-like="toggleFolderLike(folder.id)"
              @edit="editFolder(folder)"
              @delete="deleteFolder(folder.id)"
              @view="viewFolder(folder)"
              @select="handleFolderSelect(folder)"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- Форма создания/редактирования модуля -->
    <module-form
      v-model="showCreateModuleDialog"
      :initial-data="editingModule"
      @save="saveModule"
    />

    <!-- Форма создания/редактирования папки -->
    <folder-form
      v-model="showCreateFolderDialog"
      :initial-data="editingFolder"
      @save="saveFolder"
    />

    <!-- Диалог просмотра словаря -->
    <el-dialog
      v-model="showDetailsDialog"
      :title="viewingTitle"
      width="90%"
      class="dictionary-dialog"
    >
      <template v-if="viewingType === 'module'">
        <word-table :word-pairs="currentWordPairs" />
      </template>
      <template v-else-if="viewingType === 'folder'">
        <div class="folder-modules">
          <h3>Модули в папке:</h3>
          <el-table :data="currentFolderModules" style="width: 100%">
            <el-table-column prop="title" label="Название модуля" />
            <el-table-column prop="wordCount" label="Количество слов" />
            <el-table-column align="right">
              <template #default="{ row }">
                <el-button 
                  type="primary" 
                  @click="viewDictionary(row)"
                >
                  Посмотреть словарь
                </el-button>
                <el-button
                  :type="isModuleSelected(row.id) ? 'success' : 'default'"
                  @click="modulesStore.toggleModuleSelection(row.id)"
                >
                  {{ isModuleSelected(row.id) ? 'Выбрано' : 'Выбрать' }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useModulesStore } from '@/stores/modules'
import { useFoldersStore } from '@/stores/folders'
import { useAuthStore } from '@/stores/auth'
import { useLayoutStore } from '@/stores/layout'
import { useNavigationStore } from '@/stores/navigation'
import type { Module } from '@/stores/modules'
import type { Folder } from '@/stores/folders'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import NavigationFilters from '@/components/NavigationFilters.vue'
import ModuleSelectionCard from '@/components/ModuleSelectionCard.vue'
import FolderCard from '@/components/FolderCard.vue'
import ModuleForm from '@/components/forms/ModuleForm.vue'
import FolderForm from '@/components/forms/FolderForm.vue'
import WordTable from '@/components/WordTable.vue'

const modulesStore = useModulesStore()
const foldersStore = useFoldersStore()
const authStore = useAuthStore()
const layoutStore = useLayoutStore()
const navigationStore = useNavigationStore()
const route = useRoute()
const router = useRouter()

const showCreateModuleDialog = ref(false)
const showCreateFolderDialog = ref(false)
const showDetailsDialog = ref(false)
const viewingModule = ref<Module | undefined>(undefined)
const viewingFolder = ref<Folder | undefined>(undefined)
const viewingType = ref<'module' | 'folder'>('module')
const editingModule = ref<{
  id: number
  title: string
  is_public: boolean
  dictionary: Record<string, string>
} | undefined>(undefined)

interface EditingFolder {
  id: number
  title: string
  is_public: boolean
  modules: number[]
}

const editingFolder = ref<EditingFolder | undefined>()

const selectedFolders = ref<number[]>([])

// Фильтрация модулей и папок в зависимости от текущего раздела и фильтра
const filteredModules = computed(() => {
  let modules = [...modulesStore.modules]

  switch (navigationStore.currentSectionId) {
    case 'home':
      switch (navigationStore.currentFilterId) {
        case 'all':
          break
        case 'public':
          modules = modules.filter(m => m.is_public)
          break
        case 'private':
          modules = modules.filter(m => !m.is_public)
          break
      }
      break

    case 'my-library':
      if (navigationStore.currentFilterId === 'modules') {
        modules = modules.filter(m => m.author === authStore.user?.username)
      } else {
        modules = []
      }
      break

    case 'favorites':
      if (navigationStore.currentFilterId === 'favorite-modules') {
        modules = modules.filter(m => m.is_liked)
      } else {
        modules = []
      }
      break
  }

  return modules
})

const filteredFolders = computed(() => {
  let folders = [...foldersStore.folders]
  console.log('Filtering folders:', {
    totalFolders: folders.length,
    currentSection: navigationStore.currentSectionId,
    currentFilter: navigationStore.currentFilterId,
    user: authStore.user?.username
  })

  switch (navigationStore.currentSectionId) {
    case 'home':
      switch (navigationStore.currentFilterId) {
        case 'all':
          console.log('Home/All folders:', folders.length)
          break
        case 'public':
          folders = folders.filter(f => f.is_public)
          console.log('Home/Public folders:', folders.length)
          break
        case 'private':
          folders = folders.filter(f => !f.is_public)
          console.log('Home/Private folders:', folders.length)
          break
      }
      break

    case 'my-library':
      if (navigationStore.currentFilterId === 'folders') {
        folders = folders.filter(f => f.author === authStore.user?.username)
        console.log('My Library folders:', folders.length)
    } else {
        folders = []
        console.log('My Library: not showing folders for filter', navigationStore.currentFilterId)
      }
      break

    case 'favorites':
      if (navigationStore.currentFilterId === 'favorite-folders') {
        folders = folders.filter(f => f.is_liked)
        console.log('Favorite folders:', folders.length)
  } else {
        folders = []
        console.log('Favorites: not showing folders for filter', navigationStore.currentFilterId)
      }
      break
  }

  console.log('Filtered folders result:', folders.length)
  return folders
})

function isPersonalModule(module: Module) {
  return module.author === authStore.user?.username
}

function isPersonalFolder(folder: Folder) {
  return folder.author === authStore.user?.username
}

function isModuleSelected(moduleId: number) {
  return modulesStore.selectedModules.includes(moduleId)
}

function isFolderSelected(folderId: number) {
  return selectedFolders.value.includes(folderId)
}

const viewingTitle = computed(() => {
  if (viewingType.value === 'module') {
    return viewingModule.value?.title || ''
  } else {
    return viewingFolder.value?.title || ''
  }
})

const currentWordPairs = computed(() => {
  if (!viewingModule.value?.dictionary) return []
  return Object.entries(viewingModule.value.dictionary).map(([word, translation]) => ({
    word,
    translation
  }))
})

const currentFolderModules = computed(() => {
  if (!viewingFolder.value?.modules) return []
  return viewingFolder.value.modules.map(module => ({
    ...module,
    wordCount: Object.keys(module.dictionary || {}).length
  }))
})

const selectedModules = computed(() => {
  if (editingFolder.value) {
    return editingFolder.value.modules
  }
  return []
})

onMounted(async () => {
  try {
    if (authStore.isAuthenticated && !authStore.user) {
      await authStore.fetchUser()
    }

    await Promise.all([
      modulesStore.fetchModules(),
      foldersStore.fetchFolders()
    ])
    
    const action = route.query.action
    const moduleId = route.query.moduleId
    const folderId = route.query.folderId
    
    if (action === 'create-module') {
      showCreateModuleDialog.value = true
      await router.replace({ path: '/' })
    } else if (action === 'create-folder') {
      showCreateFolderDialog.value = true
      await router.replace({ path: '/' })
    } else if (action === 'edit' && moduleId) {
      const id = Number(moduleId)
      const moduleToEdit = modulesStore.modules.find(m => m.id === id)
      
      if (moduleToEdit) {
        editingModule.value = {
          id: moduleToEdit.id,
          title: moduleToEdit.title,
          is_public: moduleToEdit.is_public,
          dictionary: moduleToEdit.dictionary
        }
        showCreateModuleDialog.value = true
      } else {
        ElMessage.warning('Модуль для редактирования не найден')
      }
      
      await router.replace({ path: '/' })
    } else if (action === 'edit' && folderId) {
      const id = Number(folderId)
      const folderToEdit = foldersStore.folders.find(f => f.id === id)
      
      if (folderToEdit) {
        editingFolder.value = {
          id: folderToEdit.id,
          title: folderToEdit.title,
          is_public: folderToEdit.is_public,
          modules: folderToEdit.modules.map((m: Module) => m.id)
        }
        showCreateFolderDialog.value = true
  } else {
        ElMessage.warning('Папка для редактирования не найдена')
      }
      
      await router.replace({ path: '/' })
      }
  } catch (error: any) {
    console.error('Error in HomeView:', error)
    ElMessage.error(error.message || 'Ошибка при загрузке данных')
  }
})

async function deleteModule(moduleId: number) {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите удалить этот модуль? Это действие нельзя отменить.',
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    )

    await modulesStore.deleteModule(moduleId)
    ElMessage.success('Модуль успешно удален')
  } catch (error: any) {
    if (error.message === 'cancel') {
      return
    }
    console.error('Error deleting module:', error)
    ElMessage.error(error.message || 'Ошибка при удалении модуля')
  }
}

async function deleteFolder(folderId: number) {
  try {
    await ElMessageBox.confirm(
      'Вы уверены, что хотите удалить эту папку? Это действие нельзя отменить.',
      'Подтверждение удаления',
      {
        confirmButtonText: 'Удалить',
        cancelButtonText: 'Отмена',
        type: 'warning'
      }
    )

    await foldersStore.deleteFolder(folderId)
    ElMessage.success('Папка успешно удалена')
  } catch (error: any) {
    if (error.message === 'cancel') {
      return
    }
    console.error('Error deleting folder:', error)
    ElMessage.error(error.message || 'Ошибка при удалении папки')
  }
}

async function saveModule(moduleData: { id?: number, title: string, dictionary: Record<string, string>, is_public: boolean }) {
  try {
    let success = false
    
    if (moduleData.id) {
      success = await modulesStore.updateModule(
        moduleData.id,
        moduleData.title,
        moduleData.dictionary,
        moduleData.is_public
      )
      
      if (success) {
        ElMessage.success('Модуль успешно обновлен')
      }
    } else {
      success = await modulesStore.createModule(
        moduleData.title,
        moduleData.dictionary,
        moduleData.is_public
      )
      
      if (success) {
        ElMessage.success('Модуль успешно создан')
      }
    }

    if (success) {
      await modulesStore.fetchModules()
      editingModule.value = undefined
    }
  } catch (error: any) {
    console.error('Ошибка при сохранении модуля:', error)
    ElMessage.error(error.message || 'Ошибка при сохранении модуля')
  }
}

async function saveFolder(folderData: { id?: number, title: string, modules: number[], is_public: boolean }) {
  try {
    let success = false
    
    if (folderData.id) {
      success = await foldersStore.updateFolder(
        folderData.id,
        folderData.title,
        folderData.modules,
        folderData.is_public
      )
    } else {
      success = await foldersStore.createFolder(
        folderData.title,
        folderData.modules,
        folderData.is_public
      )
    }

    if (success) {
      editingFolder.value = undefined
      showCreateFolderDialog.value = false
    }
  } catch (error: any) {
    console.error('Ошибка при сохранении папки:', error)
    ElMessage.error(error.message || 'Ошибка при сохранении папки')
  }
}

function editModule(module: Module) {
  editingModule.value = {
    id: module.id,
    title: module.title,
    is_public: module.is_public,
    dictionary: module.dictionary
  }
  showCreateModuleDialog.value = true
}

function editFolder(folder: Folder) {
  editingFolder.value = {
    id: folder.id,
    title: folder.title,
    is_public: folder.is_public,
    modules: folder.modules.map((m: Module) => m.id)
  }
  showCreateFolderDialog.value = true
}

function viewDictionary(module: Module) {
  viewingModule.value = module
  viewingType.value = 'module'
  showDetailsDialog.value = true
}

function viewFolder(folder: Folder) {
  viewingFolder.value = folder
  viewingType.value = 'folder'
  showDetailsDialog.value = true
}

async function toggleModuleLike(moduleId: number) {
  await modulesStore.toggleLike(moduleId)
}

async function toggleFolderLike(folderId: number) {
  await foldersStore.toggleFolderLike(folderId)
}

async function handleFolderSelect(folder: Folder) {
  const index = selectedFolders.value.indexOf(folder.id)
  if (index === -1) {
    selectedFolders.value.push(folder.id)
    // Выбираем все модули из папки
    folder.modules.forEach((module: Module) => {
      if (!modulesStore.selectedModules.includes(module.id)) {
        modulesStore.toggleModuleSelection(module.id)
      }
    })
  } else {
    selectedFolders.value.splice(index, 1)
    // Снимаем выбор со всех модулей из папки
    folder.modules.forEach((module: Module) => {
      if (modulesStore.selectedModules.includes(module.id)) {
        modulesStore.toggleModuleSelection(module.id)
      }
    })
  }
}
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  background: var(--el-fill-color-blank);
}

.main-content {
  padding-left: var(--sidebar-collapsed-width, 64px);
  transition: padding-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  min-height: 100vh;
}

.app-layout:not(.has-sidebar) .main-content {
  padding-left: 0;
}

.page-content {
  padding-top: calc(var(--header-height, 64px) + 16px);
  min-height: calc(100vh - var(--header-height, 64px));
}

.page-container {
  padding: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

.card-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  margin-top: 24px;
}

.navigation-filters {
  margin-bottom: 24px;
}

:deep(.base-card) {
  background: var(--el-bg-color);
  border: 1px solid var(--el-border-color-light);
  border-radius: var(--el-border-radius-base);
  transition: all 0.3s ease;
  height: 100%;
}

:deep(.base-card:hover) {
  transform: translateY(-2px);
  border-color: var(--el-color-primary-light-7);
  box-shadow: var(--el-box-shadow-light);
}

:deep(.navigation-filters) {
  background: var(--el-bg-color);
  border-radius: var(--el-border-radius-base);
  padding: 16px;
  margin-bottom: 24px;
  border: 1px solid var(--el-border-color-light);
}

:deep(.el-dialog) {
  border-radius: var(--el-border-radius-base);
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 24px;
  border-bottom: 1px solid var(--el-border-color-lighter);
}

:deep(.el-dialog__body) {
  padding: 24px;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid var(--el-border-color-lighter);
}

@media (max-width: 768px) {
  .main-content {
    padding-left: 0;
  }

  .page-content {
    padding-top: calc(var(--header-height, 64px) + 8px);
  }

  .page-container {
    padding: 16px;
  }

  .card-grid {
    grid-template-columns: 1fr;
    gap: 16px;
  }
}

/* Анимации */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.folder-modules {
  padding: 20px;
}

.folder-modules h3 {
  margin-bottom: 20px;
  color: var(--el-text-color-primary);
}

/* Добавляем отступ между кнопками */
:deep(.el-table__cell .el-button + .el-button) {
  margin-left: 8px;
}
</style> 