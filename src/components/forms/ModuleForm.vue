<template>
  <el-dialog
    :model-value="modelValue"
    @update:model-value="$emit('update:modelValue', $event)"
    :title="isEditing ? 'Редактировать модуль' : 'Создать модуль'"
    width="90%"
    class="module-dialog"
    :close-on-click-modal="false"
    @close="handleClose"
  >
    <div class="dialog-content">
      <div class="main-panel">
        <el-form :model="form" label-position="top">
          <el-form-item label="Название модуля">
            <el-input 
              v-model="form.title"
              placeholder="Введите название модуля..."
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
              <span class="privacy-label">{{ form.is_public ? 'Публичный модуль' : 'Приватный модуль' }}</span>
              <el-switch
                v-model="form.is_public"
                :active-value="true"
                :inactive-value="false"
                class="privacy-toggle"
              />
            </div>
          </el-form-item>
        </el-form>

        <div class="dictionary-section">
          <div class="section-header">
            <h3>Словарь</h3>
            <div class="dictionary-stats">
              <el-tag type="info" effect="plain">
                {{ dictionaryEntries.length }} {{ getDictionaryCountLabel(dictionaryEntries.length) }}
              </el-tag>
            </div>
          </div>

          <div class="dictionary-controls">
            <el-button 
              @click="generateDictionary"
              class="control-button generate"
            >
              <el-icon><Mic /></el-icon>
              <span>AI-генерация</span>
            </el-button>
            <el-button 
              @click="importJSON"
              class="control-button import"
            >
              <el-icon><Upload /></el-icon>
              <span>Импорт JSON</span>
            </el-button>
          </div>

          <el-button @click="addPair" class="add-pair-button">
            <el-icon><Plus /></el-icon>
            Добавить слово
          </el-button>

            <div class="dictionary-list" ref="dictionaryListRef">
              <TransitionGroup 
                name="dictionary-item"
                @after-enter="(el) => el.scrollIntoView({ behavior: 'smooth', block: 'end' })"
              >
                <div 
                  v-for="(entry, index) in dictionaryEntries" 
                  :key="index"
                  class="dictionary-item"
                >
                  <div class="item-number">{{ index + 1 }}</div>
                  <el-input 
                    v-model="dictionaryEntries[index].key"
                    placeholder="Слово" 
                    class="word-input"
                  >
                    <template #prefix>
                      <el-icon><Edit /></el-icon>
                    </template>
                  </el-input>
                  <el-icon class="separator"><Right /></el-icon>
                  <el-input 
                    v-model="dictionaryEntries[index].value"
                    placeholder="Перевод" 
                    class="translation-input"
                  >
                    <template #prefix>
                      <el-icon><Edit /></el-icon>
                    </template>
                  </el-input>
                  <el-button 
                    @click="removePair(index)"
                    circle
                    class="remove-button"
                    :class="{ 'single-item': dictionaryEntries.length === 1 }"
                    :disabled="dictionaryEntries.length === 1"
                  >
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </TransitionGroup>
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
          class="save-button"
        >
          {{ isEditing ? 'Сохранить изменения' : 'Создать модуль' }}
        </el-button>
      </div>
    </template>
  </el-dialog>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from 'vue'
import { Edit, Delete, Right, Mic, Upload, Plus, Share, Lock } from '@element-plus/icons-vue'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'
import { useModulesStore } from '@/stores/modules'

interface DictionaryEntry {
  key: string
  value: string
}

interface ModuleForm {
  title: string
  is_public: boolean
  dictionary: Record<string, string>
}

interface Props {
  modelValue: boolean
  initialData?: {
    id: number
    title: string
    is_public: boolean
    dictionary: Record<string, string>
  }
}

const props = withDefaults(defineProps<Props>(), {
  initialData: undefined
})

const emit = defineEmits<{
  'update:modelValue': [value: boolean]
  'save': [data: { id?: number, title: string, dictionary: Record<string, string>, is_public: boolean }]
}>()

const isEditing = computed(() => !!props.initialData?.id)
const isProcessing = ref(false)
const dictionaryListRef = ref<HTMLElement | null>(null)

// Инициализируем форму с пустыми значениями
const defaultForm = {
  title: '',
  is_public: true,
  dictionary: {}
}

const form = ref<ModuleForm>({ ...defaultForm })
const dictionaryEntries = ref<DictionaryEntry[]>([{ key: '', value: '' }])

// Функция сброса формы
function resetForm() {
  form.value = {
  title: props.initialData?.title || '',
  is_public: props.initialData?.is_public ?? true,
  dictionary: {}
  }
  
if (props.initialData) {
  const entries = Object.entries(props.initialData.dictionary)
    dictionaryEntries.value = entries.length > 0 
      ? entries.map(([key, value]) => ({ key, value: String(value) }))
      : [{ key: '', value: '' }]
  } else {
    dictionaryEntries.value = [{ key: '', value: '' }]
  }
}

// Следим за изменением modelValue для сброса формы при открытии
watch(
  () => props.modelValue,
  (newValue) => {
    if (newValue) {
      resetForm()
    }
  }
)

// Обработчик закрытия диалога
function handleClose() {
  emit('update:modelValue', false)
  // Сбрасываем форму после закрытия с небольшой задержкой
  setTimeout(resetForm, 300)
}

function scrollToBottom() {
  nextTick(() => {
    if (dictionaryListRef.value) {
      const container = dictionaryListRef.value
      const lastItem = container.lastElementChild
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }
  })
}

function addPair() {
  dictionaryEntries.value = [...dictionaryEntries.value, { key: '', value: '' }]
  scrollToBottom()
}

function removePair(index: number) {
  if (dictionaryEntries.value.length <= 1) return
  const newEntries = [...dictionaryEntries.value]
  newEntries.splice(index, 1)
  dictionaryEntries.value = newEntries
}

async function generateDictionary() {
  try {
    const { value: theme } = await ElMessageBox.prompt('Введите тему для генерации словаря', 'Генерация словаря', {
      confirmButtonText: 'Далее',
      cancelButtonText: 'Отмена',
      inputPlaceholder: 'Например: путешествия, еда, спорт...',
      inputValidator: (value) => {
        if (!value.trim()) {
          return 'Тема не может быть пустой'
        }
        return true
      }
    })

    if (theme) {
      const { value: countStr } = await ElMessageBox.prompt('Введите количество слов', 'Количество слов', {
        confirmButtonText: 'Сгенерировать',
        cancelButtonText: 'Отмена',
        inputPlaceholder: '10',
        inputValue: '10',
        inputPattern: /^[1-9][0-9]*$/,
        inputErrorMessage: 'Введите положительное число'
      })

      if (countStr) {
        const count = parseInt(countStr)
        const modulesStore = useModulesStore()
        
        // Показываем индикатор загрузки
        const loading = ElLoading.service({
          lock: true,
          text: 'Генерация словаря...',
          background: 'rgba(255, 255, 255, 0.8)'
        })

        try {
          // Функция для обновления текста загрузки
          const onProgress = () => {
            loading.setText('Генерация словаря... Это может занять некоторое время')
          }

          const result = await modulesStore.generateTheme(theme, onProgress, count)
          
          if (result) {
            // Устанавливаем тему как название модуля
            form.value.title = theme.charAt(0).toUpperCase() + theme.slice(1)
            
            // Преобразуем результат в формат словаря
            dictionaryEntries.value = Object.entries(result).map(([key, value]) => ({
              key,
              value: String(value)
            }))
            ElMessage.success('Словарь успешно сгенерирован')
          } else {
            ElMessage.error('Не удалось сгенерировать словарь')
          }
        } finally {
          loading.close()
        }
      }
    }
  } catch (error: any) {
    if (error.message !== 'cancel') {
      ElMessage.error('Не удалось сгенерировать словарь')
    }
  }
}

async function importJSON() {
  try {
    const { value } = await ElMessageBox.prompt('Вставьте JSON словаря', 'Импорт JSON', {
      confirmButtonText: 'Импортировать',
      cancelButtonText: 'Отмена'
    })
    
    if (value) {
      try {
        const dictionary = JSON.parse(value)
        
        if (typeof dictionary !== 'object' || dictionary === null) {
          throw new Error('JSON должен содержать объект')
        }
        
        dictionaryEntries.value = Object.entries(dictionary).map(([key, value]) => ({
          key,
          value: String(value)
        }))
        
        if (dictionaryEntries.value.length === 0) {
          dictionaryEntries.value = [{ key: '', value: '' }]
        }
        
        ElMessage.success('Словарь успешно импортирован')
      } catch (parseError) {
        ElMessage.error('Неверный формат JSON')
      }
    }
  } catch (error: any) {
    if (error.message !== 'cancel') {
      ElMessage.error('Ошибка при импорте JSON')
    }
  }
}

function getDictionaryCountLabel(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'слов'
  }

  if (lastDigit === 1) {
    return 'слово'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'слова'
  }

  return 'слов'
}

async function handleSave() {
  if (isProcessing.value) return
  
  try {
    isProcessing.value = true
    
    if (!form.value.title.trim()) {
      ElMessage.warning('Введите название модуля')
      return
    }

    const dictionary: Record<string, string> = {}
    let validPairsCount = 0

    for (const entry of dictionaryEntries.value) {
      const key = entry.key.trim()
      const value = entry.value.trim()
      
      if (!key && !value) continue
      
      if (!key || !value) {
        ElMessage.warning('Заполните оба поля в паре слово-перевод')
        return
      }
      
      dictionary[key] = value
      validPairsCount++
    }

    if (validPairsCount === 0) {
      ElMessage.warning('Добавьте хотя бы одну пару слово-перевод')
      return
    }

    emit('save', {
      ...(props.initialData?.id ? { id: props.initialData.id } : {}),
      title: form.value.title.trim(),
      dictionary,
      is_public: form.value.is_public
    })

    emit('update:modelValue', false)
  } catch (error: any) {
    console.error('Ошибка при сохранении модуля:', error)
    ElMessage.error(error.message || 'Ошибка при сохранении модуля')
  } finally {
    isProcessing.value = false
  }
}
</script>

<style scoped>
.module-dialog :deep(.el-dialog) {
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  max-width: 900px;
  margin: min(var(--spacing-4), 2vh) auto;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - min(var(--spacing-4), 2vh) * 2);
}

.module-dialog :deep(.el-dialog__header) {
  margin: 0;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-secondary-200);
  background: var(--color-secondary-50);
  flex-shrink: 0;
}

.module-dialog :deep(.el-dialog__title) {
  font-size: var(--font-size-xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-secondary-900);
}

.module-dialog :deep(.el-dialog__body) {
  padding: 0;
  flex: 1;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.dialog-content {
  flex: 1;
  overflow-y: auto;
  min-height: 0;
}

.main-panel {
  padding: var(--spacing-4);
  display: flex;
  flex-direction: column;
  gap: var(--spacing-4);
}

.title-input {
  :deep(.el-input__wrapper) {
    padding-left: var(--spacing-4);
    box-shadow: none !important;
    border: 2px solid var(--color-secondary-200);
    border-radius: var(--border-radius-lg);
    transition: all 0.2s ease;
  }

  :deep(.el-input__wrapper:hover) {
    border-color: var(--color-primary-300);
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: var(--color-primary-500);
  }

  :deep(.el-input__inner) {
    font-size: var(--font-size-lg);
    height: 42px;
  }
}

.privacy-control {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background: var(--color-secondary-50);
  border-radius: var(--border-radius-lg);
}

.privacy-control .el-icon {
  font-size: var(--font-size-xl);
  color: var(--color-secondary-500);
  transition: color 0.2s ease;

  &.is-public {
    color: var(--color-success-500);
  }
}

.privacy-label {
  flex: 1;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-secondary-700);
}

.dictionary-section {
  background: white;
  border-radius: var(--border-radius-xl);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  gap: var(--spacing-3);
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) 0;

  h3 {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
    color: var(--color-secondary-900);
    margin: 0;
  }
}

.dictionary-controls {
  display: flex;
  gap: var(--spacing-4);
}

.control-button {
  flex: 1;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  border-radius: var(--border-radius-lg);
  font-weight: var(--font-weight-medium);
  transition: all 0.2s ease;

  &.generate {
    background: var(--color-primary-50);
    border-color: var(--color-primary-200);
    color: var(--color-primary-700);

    &:hover {
      background: var(--color-primary-100);
      border-color: var(--color-primary-300);
    }
  }

  &.import {
    background: var(--color-secondary-50);
    border-color: var(--color-secondary-200);
    color: var(--color-secondary-700);

    &:hover {
      background: var(--color-secondary-100);
      border-color: var(--color-secondary-300);
    }
  }
}

.dictionary-list {
  flex: 1;
  overflow-y: auto;
  min-height: 200px;
  max-height: min(430px, calc(100vh - 508px));
  padding: var(--spacing-2);
  border: 1px solid var(--color-secondary-200);
  border-radius: var(--border-radius-lg);
}

.dictionary-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-2);
  margin-bottom: var(--spacing-2);
  border-radius: var(--border-radius-lg);
  background: var(--color-secondary-50);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-secondary-100);
  }

  &:last-child {
    margin-bottom: 0;
  }
}

.item-number {
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--color-secondary-200);
  color: var(--color-secondary-700);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  flex-shrink: 0;
}

.word-input,
.translation-input {
  flex: 1;
  min-width: 0;

  :deep(.el-input__wrapper) {
    box-shadow: none !important;
    background: white;
    border: 1px solid var(--color-secondary-200);
    border-radius: var(--border-radius-lg);
  }

  :deep(.el-input__wrapper:hover) {
    border-color: var(--color-primary-300);
  }

  :deep(.el-input__wrapper.is-focus) {
    border-color: var(--color-primary-500);
  }
}

.separator {
  color: var(--color-secondary-400);
  font-size: var(--font-size-lg);
  flex-shrink: 0;
}

.remove-button {
  opacity: 0;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &.single-item {
    opacity: 0.5;
  }
}

.dictionary-item:hover .remove-button {
  opacity: 1;
}

.add-pair-button {
  width: 100%;
  height: 42px;
  border-style: dashed;
  border-width: 2px;
  border-radius: var(--border-radius-lg);
  color: var(--color-primary-500);
  background: var(--color-primary-50);
  transition: all 0.2s ease;

  &:hover {
    background: var(--color-primary-100);
    border-color: var(--color-primary-500);
    transform: translateY(-1px);
  }
}

.dialog-footer {
  padding: var(--spacing-4);
  background: var(--color-secondary-50);
  border-top: 1px solid var(--color-secondary-200);
  display: flex;
  justify-content: flex-end;
  gap: var(--spacing-3);
  flex-shrink: 0;
}

.save-button {
  min-width: 160px;
}

/* Анимации */
.dictionary-item-enter-active,
.dictionary-item-leave-active {
  transition: all 0.3s ease;
}

.dictionary-item-enter-from,
.dictionary-item-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

@media (max-width: 768px) {
  .module-dialog :deep(.el-dialog) {
    width: 95% !important;
    margin: min(var(--spacing-2), 1vh) auto !important;
    max-height: calc(100vh - min(var(--spacing-2), 1vh) * 2);
  }

  .main-panel {
    padding: var(--spacing-3);
    gap: var(--spacing-3);
  }

  .dictionary-controls {
    flex-direction: column;
  }

  .dictionary-item {
    flex-wrap: wrap;
    gap: var(--spacing-2);
  }

  .word-input,
  .translation-input {
    flex: 1 1 100%;
  }

  .separator {
    display: none;
  }

  .remove-button {
    opacity: 1;
  }

  .item-number {
    width: 20px;
    height: 20px;
  }
}

@media (max-height: 600px) {
  .dictionary-list {
    max-height: calc(100vh - 350px);
  }

  .main-panel {
    padding: var(--spacing-3);
    gap: var(--spacing-3);
  }

  .title-input :deep(.el-input__inner),
  .control-button,
  .add-pair-button {
    height: 36px;
  }
}
</style> 