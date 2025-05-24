<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEditing ? 'Редактировать папку' : 'Создать папку'"
    width="90%"
    class="folder-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="dialog-content">
      <div class="main-panel">
        <el-form :model="form" label-position="top">
          <el-form-item label="Название папки">
            <el-input 
              v-model="form.title"
              placeholder="Введите название папки..."
              class="title-input"
            >
              <template #prefix>
                <el-icon><Edit /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item class="privacy-switch">
            <div class="privacy-control">
              <el-icon :class="{ 'is-public': form.is_public }">
                <component :is="form.is_public ? 'Share' : 'Lock'" />
              </el-icon>
              <span class="privacy-label">{{ form.is_public ? 'Публичная папка' : 'Приватная папка' }}</span>
              <el-switch
                v-model="form.is_public"
                :active-value="true"
                :inactive-value="false"
                class="privacy-toggle"
              />
            </div>
          </el-form-item>
        </el-form>

        <div class="modules-section">
          <div class="section-header">
            <h3>Модули</h3>
            <div class="modules-stats">
              <el-tag type="info" effect="plain">
                {{ selectedModules.length }} {{ getModulesCountLabel(selectedModules.length) }}
              </el-tag>
            </div>
          </div>

          <div class="modules-list">
            <el-checkbox-group v-model="selectedModules">
              <TransitionGroup name="module-item">
                <div 
                  v-for="module in availableModules" 
                  :key="module.id"
                  class="module-item"
                >
                  <el-checkbox 
                    :label="module.id"
                    class="module-checkbox"
                  >
                    <div class="module-info">
                      <span class="module-title">{{ module.title }}</span>
                      <div class="module-meta">
                        <el-tag size="small" :type="module.is_public ? 'success' : 'info'">
                          {{ module.is_public ? 'Публичный' : 'Приватный' }}
                        </el-tag>
                        <span class="module-author">{{ module.author }}</span>
                      </div>
                    </div>
                  </el-checkbox>
                </div>
              </TransitionGroup>
            </el-checkbox-group>
          </div>
        </div>
      </div>
    </div>

    <template #footer>
      <div class="dialog-footer">
        <el-button @click="handleClose" class="cancel-button">
          Отмена
        </el-button>
        <el-button 
          type="primary" 
          @click="handleSave" 
          :loading="isProcessing"
          :disabled="!isValid"
          class="save-button"
        >
          {{ isEditing ? 'Сохранить изменения' : 'Создать папку' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { Edit, Share, Lock } from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import { useModulesStore } from '@/stores/modules'
import { useFoldersStore } from '@/stores/folders'
import type { Module } from '@/stores/modules'
import type { Folder } from '@/stores/folders'

interface FolderForm {
  title: string
  is_public: boolean
}

interface Props {
  modelValue: boolean
  initialData?: {
    id?: number
    title: string
    is_public: boolean
    modules: number[]
  }
  isEdit?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined,
  isEdit: false
})

const emit = defineEmits(['update:modelValue', 'save'])

const modulesStore = useModulesStore()
const foldersStore = useFoldersStore()
const isEditing = computed(() => !!props.initialData?.id)
const isProcessing = ref(false)

// Инициализируем форму
const form = ref<FolderForm>({
  title: props.initialData?.title || '',
  is_public: props.initialData?.is_public ?? true
})

const selectedModules = ref<number[]>(props.initialData?.modules || [])

// Проверяем наличие приватных модулей
const hasPrivateModules = computed(() => {
  return selectedModules.value.some(moduleId => {
    const module = modulesStore.getModuleById(moduleId)
    return module && !module.is_public
  })
})

// Следим за изменениями выбранных модулей и публичности папки
watch([selectedModules, () => form.value.is_public], ([newModules, isPublic]) => {
  if (isPublic && hasPrivateModules.value) {
    form.value.is_public = false
    ElMessage.warning('Папка автоматически переключена в приватный режим, так как содержит приватные модули')
  }
}, { immediate: true })

const availableModules = computed(() => {
  return modulesStore.modules.filter(module => 
    !props.initialData || // Если создаем новую папку
    props.initialData.modules.includes(module.id) || // Если модуль уже в папке
    !foldersStore.folders.some((f: Folder) => // Если модуль не в других папках
      f.id !== props.initialData?.id && 
      f.modules.some((m: Module) => m.id === module.id)
    )
  )
})

// Валидация формы
const isValid = computed(() => {
  return form.value.title.trim().length >= 3 && selectedModules.value.length > 0
})

// Загрузка доступных модулей
async function loadModules() {
  try {
    await modulesStore.fetchModules()
  } catch (error) {
    ElMessage.error('Ошибка при загрузке модулей')
  }
}

function getModulesCountLabel(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'модулей'
  }

  if (lastDigit === 1) {
    return 'модуль'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'модуля'
  }

  return 'модулей'
}

function handleClose() {
  form.value = {
    title: '',
    is_public: true
  }
  selectedModules.value = []
  emit('update:modelValue', false)
}

async function handleSave() {
  if (!isValid.value) {
    ElMessage.warning('Заполните все обязательные поля')
    return
  }

  // Проверяем приватные модули перед сохранением
  if (form.value.is_public && hasPrivateModules.value) {
    form.value.is_public = false
    ElMessage.warning('Папка будет создана как приватная, так как содержит приватные модули')
  }

  isProcessing.value = true
  try {
    emit('save', {
      id: props.initialData?.id,
      title: form.value.title.trim(),
      modules: selectedModules.value,
      is_public: form.value.is_public
    })
    handleClose()
  } catch (error) {
    console.error('Error saving folder:', error)
    ElMessage.error('Ошибка при сохранении папки')
  } finally {
    isProcessing.value = false
  }
}

onMounted(() => {
  loadModules()
})
</script>

<style scoped>
.folder-dialog :deep(.el-dialog__body) {
  padding: 0;
}

.dialog-content {
  display: flex;
  min-height: 400px;
  max-height: 80vh;
}

.main-panel {
  flex: 1;
  padding: var(--spacing-6);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.title-input {
  font-size: var(--font-size-lg);
}

.privacy-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2) 0;
}

.privacy-label {
  flex: 1;
  color: var(--color-secondary-700);
}

.privacy-control .el-icon {
  font-size: var(--font-size-lg);
  color: var(--color-secondary-500);
}

.privacy-control .el-icon.is-public {
  color: var(--color-success-500);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-4);
}

.section-header h3 {
  font-size: var(--font-size-lg);
  color: var(--color-secondary-900);
  margin: 0;
}

.modules-list {
  border: 1px solid var(--color-secondary-200);
  border-radius: var(--border-radius-lg);
  padding: var(--spacing-4);
  overflow-y: auto;
  max-height: 400px;
}

.module-item {
  padding: var(--spacing-2);
  border-bottom: 1px solid var(--color-secondary-100);
}

.module-item:last-child {
  border-bottom: none;
}

.module-info {
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
}

.module-title {
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary-900);
}

.module-meta {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
}

.module-author {
  font-size: var(--font-size-sm);
  color: var(--color-secondary-600);
}

.dialog-footer {
  padding: var(--spacing-4) var(--spacing-6);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  border-top: 1px solid var(--color-secondary-200);
}

/* Анимации */
.module-item-enter-active,
.module-item-leave-active {
  transition: all 0.3s ease;
}

.module-item-enter-from,
.module-item-leave-to {
  opacity: 0;
  transform: translateX(-20px);
}
</style> 