<template>
  <div class="home">
    <el-container>
      <el-header style="padding: 0">
        <app-header back-link="/" back-text="Главная" />
      </el-header>

      <el-main>
        <el-row :gutter="20">
          <el-col :span="24">
            <div class="section-controls mb-4">
              <el-radio-group v-model="activeSection" size="large">
                <el-radio-button label="personal">Мои модули</el-radio-button>
                <el-radio-button label="popular">Популярные модули</el-radio-button>
                <el-radio-button label="liked">Понравившиеся</el-radio-button>
              </el-radio-group>
              <el-button 
                type="primary"
                @click="$router.push('/study')"
                class="study-button"
                :disabled="!modulesStore.selectedModules.length"
              >
                Изучать{{ modulesStore.selectedModules.length ? ` (${modulesStore.selectedModules.length})` : '' }}
              </el-button>
            </div>
            <div class="search-controls mb-4">
              <div class="search-wrapper">
                <el-input
                  v-model="searchQuery"
                  placeholder="Поиск модулей..."
                  clearable
                  class="google-search-input"
                >
                  <template #prefix>
                    <div class="search-icon">
                      <el-icon><svg focusable="false" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"></path></svg></el-icon>
                    </div>
                  </template>
                  <template #suffix>
                    <div class="search-suffix">
                      <div class="separator"></div>
                      <el-dropdown trigger="click" class="filter-dropdown">
                        <el-icon class="filter-icon"><Filter /></el-icon>
                        <template #dropdown>
                          <el-dropdown-menu>
                            <template v-if="activeSection === 'personal'">
                              <el-dropdown-item>
                                <el-checkbox 
                                  v-model="showOnlyPublic"
                                  @change="handleFilterChange"
                                >
                                  Только публичные
                                </el-checkbox>
                              </el-dropdown-item>
                              <el-dropdown-item>
                                <el-checkbox 
                                  v-model="showOnlyPrivate"
                                  @change="handleFilterChange"
                                >
                                  Только приватные
                                </el-checkbox>
                              </el-dropdown-item>
                            </template>
                            <template v-if="activeSection === 'popular'">
                              <el-dropdown-item>
                                <el-checkbox 
                                  v-model="excludeMyModules"
                                  @change="handleFilterChange"
                                >
                                  Без моих модулей
                                </el-checkbox>
                              </el-dropdown-item>
                            </template>
                            <template v-if="activeSection === 'liked'">
                              <el-dropdown-item>
                                <el-checkbox 
                                  v-model="showOnlyPublicLiked"
                                  @change="handleFilterChange"
                                >
                                  Только публичные
                                </el-checkbox>
                              </el-dropdown-item>
                            </template>
                          </el-dropdown-menu>
                        </template>
                      </el-dropdown>
                    </div>
                  </template>
                </el-input>
              </div>
            </div>
          </el-col>
        </el-row>

        <el-row :gutter="20">
          <!-- Карточка добавления нового модуля (только для личных модулей) -->
          <el-col :xs="24" :sm="12" :md="8" :lg="6" v-if="activeSection === 'personal'" :style="{'--index': 0}">
            <el-card class="module-card add-card" @click="showCreateDialog = true" shadow="hover">
              <div class="card-content">
                <el-icon class="add-icon"><Plus /></el-icon>
                <span class="add-text">Создать новый модуль</span>
              </div>
            </el-card>
          </el-col>

          <!-- Существующие модули -->
          <el-col 
            v-for="(module, index) in filteredModules" 
            :key="module.id"
            :xs="24" :sm="12" :md="8" :lg="6"
            :style="{'--index': index}"
          >
            <el-card 
              class="module-card"
              :class="{ 'is-selected': isModuleSelected(module.id) }"
              shadow="hover"
              @click="modulesStore.toggleModuleSelection(module.id)"
            >
              <template #header>
                <div class="card-header">
                  <span class="module-title">{{ module.title }}</span>
                  <div class="operations">
                    <div class="rating-container">
                      <el-button
                        type="text"
                        @click.stop="toggleModuleLike(module.id)"
                        :class="{ 'is-liked': module.is_liked }"
                        class="like-button"
                      >
                        <el-icon><Star /></el-icon>
                      </el-button>
                      <span class="rating-count">{{ module.rating }}</span>
                    </div>
                    <template v-if="activeSection === 'personal'">
                      <el-button
                        type="text"
                        @click.stop="editModule(module)"
                        :icon="Edit"
                      />
                      <el-button
                        type="text"
                        @click.stop="deleteModule(module.id)"
                        :icon="Delete"
                      />
                    </template>
                    <template v-else>
                      <el-button
                        type="text"
                        @click.stop="viewDictionary(module)"
                        :icon="View"
                      />
                    </template>
                  </div>
                </div>
              </template>
              <div class="card-content">
                <div class="word-count">
                  {{ Object.keys(module.dictionary).length }} слов
                </div>
                <div class="module-info">
                  <el-tag size="small" type="info" v-if="activeSection === 'personal'">
                    {{ module.is_public ? 'Публичный' : 'Приватный' }}
                  </el-tag>
                  <div class="author" v-if="activeSection === 'popular' || activeSection === 'liked'">
                    <el-icon><User /></el-icon>
                    {{ module.author }}
                  </div>
                </div>
              </div>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>

    <!-- Диалог создания/редактирования модуля -->
    <el-dialog
      v-model="showCreateDialog"
      :title="editingModule ? 'Редактировать модуль' : 'Создать модуль'"
      width="50%"
    >
      <el-form :model="moduleForm" label-width="120px">
        <el-form-item label="Название">
          <el-input v-model="moduleForm.title" />
        </el-form-item>

        <el-form-item label="Приватность">
          <el-switch
            v-model="moduleForm.is_public"
            :active-value="false"
            :inactive-value="true"
            active-text="Приватный"
            inactive-text="Публичный"
          />
        </el-form-item>

        <el-divider>Словарь</el-divider>

        <el-form-item>
          <div class="dictionary-controls mb-4">
            <el-button 
              @click="generateDictionary" 
              type="primary"
              class="control-button"
            >
              <el-icon class="button-icon"><Magnet /></el-icon>
              <span class="button-text">Сгенерировать словарь</span>
            </el-button>
            <el-button 
              @click="importJSON" 
              type="info"
              class="control-button"
            >
              <el-icon class="button-icon"><Upload /></el-icon>
              <span class="button-text">Импорт JSON</span>
            </el-button>
          </div>
        </el-form-item>

        <div class="dictionary-container">
          <div v-for="(entry, index) in dictionaryEntries" :key="index" class="dictionary-item">
            <el-input 
              v-model="dictionaryEntries[index].key"
              placeholder="Слово" 
              class="word-input"
            />
            <el-icon class="separator"><Right /></el-icon>
            <el-input 
              v-model="dictionaryEntries[index].value"
              placeholder="Перевод" 
              class="translation-input"
            />
            <el-button 
              @click="removePair(index)" 
              type="danger" 
              circle 
              :icon="Delete"
              v-if="dictionaryEntries.length > 1"
            />
          </div>
          
          <el-button @click="addPair" type="success" class="add-pair-button">
            <el-icon><Plus /></el-icon> Добавить пару
          </el-button>

          <div class="dictionary-summary" v-if="dictionaryEntries.length > 0">
            <p>Всего пар слов: {{ dictionaryEntries.length }}</p>
          </div>
        </div>
      </el-form>

      <template #footer>
        <span class="dialog-footer">
          <el-button @click="showCreateDialog = false">Отмена</el-button>
          <el-button 
            type="primary" 
            @click="saveModule" 
            :loading="isProcessing"
          >
            Сохранить
          </el-button>
        </span>
      </template>
    </el-dialog>

    <!-- Диалог просмотра словаря -->
    <el-dialog
      v-model="showViewDialog"
      :title="viewingModuleTitle"
      width="50%"
    >
      <div class="dictionary-view">
        <div v-for="(value, key) in viewingDictionary" :key="key" class="dictionary-view-item">
          <div class="word">{{ key }}</div>
          <el-icon class="separator"><Right /></el-icon>
          <div class="translation">{{ value }}</div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, watchEffect, nextTick, h, watch } from 'vue'
import { useModulesStore, type Dictionary } from '@/stores/modules'
import { useAuthStore } from '@/stores/auth'
import { Plus, Delete, Edit, Magnet, Upload, Right, User, SwitchButton, Star, View, Filter } from '@element-plus/icons-vue'
import { ElMessageBox, ElMessage } from 'element-plus'
import { useRoute, useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const modulesStore = useModulesStore()
const authStore = useAuthStore()
const route = useRoute()
const router = useRouter()

const searchQuery = ref('')
const showCreateDialog = ref(false)
const editingModule = ref<number | null>(null)
const isProcessing = ref(false)
const activeSection = ref('personal')
const excludeMyModules = ref(false)
const showViewDialog = ref(false)
const viewingDictionary = ref<Dictionary>({})
const viewingModuleTitle = ref('')
const showOnlyPublic = ref(false)
const showOnlyPrivate = ref(false)
const showOnlyPublicLiked = ref(false)

const moduleForm = reactive({
  title: '',
  dictionary: {} as Dictionary,
  is_public: true
})

const dictionaryEntries = ref<{key: string, value: string}[]>([{ key: '', value: '' }])

const filteredModules = computed(() => {
  // Сначала фильтруем по разделу
  let modules = modulesStore.modules.filter(module => {
    if (activeSection.value === 'personal') {
      // В разделе "Мои модули" показываем только модули текущего пользователя
      let filtered = module.author === authStore.user?.username
      
      // Применяем дополнительные фильтры
      if (showOnlyPublic.value) {
        filtered = filtered && module.is_public
      }
      if (showOnlyPrivate.value) {
        filtered = filtered && !module.is_public
      }
      
      return filtered
    } else if (activeSection.value === 'liked') {
      // В разделе "Понравившиеся" показываем только лайкнутые модули
      let filtered = module.is_liked
      
      // Применяем дополнительные фильтры
      if (showOnlyPublicLiked.value) {
        filtered = filtered && module.is_public
      }
      
      return filtered
    } else {
      // В разделе "Популярные модули" показываем публичные модули
      if (excludeMyModules.value) {
        return module.is_public && module.author !== authStore.user?.username
      }
      return module.is_public
    }
  })

  // Сортируем модули
  if (activeSection.value === 'popular') {
    // В разделе "Популярные модули" сортируем по рейтингу (по убыванию)
    modules.sort((a, b) => (b.rating || 0) - (a.rating || 0))
  } else {
    // В разделе "Мои модули" и "Понравившиеся" сортируем по дате создания (новые первыми)
    modules.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
  }

  // Затем применяем поиск по названию, если есть
  if (!searchQuery.value) return modules
  
  const searchTerm = searchQuery.value.toLowerCase()
  return modules.filter(module => 
    module.title.toLowerCase().includes(searchTerm)
  )
})

const isModuleSelected = (moduleId: number) => modulesStore.selectedModules.includes(moduleId)

onMounted(async () => {
  try {
    // Загружаем данные пользователя, если есть токен
    if (authStore.isAuthenticated && !authStore.user) {
      await authStore.fetchUser()
    }

    console.log('HomeView mounted, fetching modules...')
    await modulesStore.fetchModules()
    console.log('Modules fetched successfully')
    console.log('Current modules in store:', modulesStore.modules)
    console.log('Filtered modules computed value:', filteredModules.value)
    
    // Проверяем URL-параметры для автоматического открытия диалога редактирования
    const action = route.query.action
    const moduleId = route.query.moduleId
    
    if (action === 'edit' && moduleId) {
      const id = Number(moduleId)
      const moduleToEdit = modulesStore.modules.find(m => m.id === id)
      
      if (moduleToEdit) {
        console.log('Auto-opening edit dialog for module:', moduleToEdit)
        await openEditDialog(moduleToEdit)
      } else {
        ElMessage.warning('Модуль для редактирования не найден')
      }
      
      // Очищаем параметры URL, чтобы не открывать диалог повторно при обновлении страницы
      await router.replace({ path: '/' })
    }
  } catch (error: any) {
    console.error('Error in HomeView:', error)
    ElMessage.error(error.message || 'Ошибка при загрузке данных')
  }
})

async function openEditDialog(module: any) {
  // Сначала сбросим форму
  resetForm()
  
  // Затем заполним ее данными модуля
  editingModule.value = module.id
  moduleForm.title = module.title
  moduleForm.is_public = module.is_public
  
  // Преобразуем словарь в массив пар
  const entries = Object.entries(module.dictionary || {})
  
  if (entries.length > 0) {
    dictionaryEntries.value = entries.map(([key, value]) => ({ key, value: String(value) }))
  } else {
    dictionaryEntries.value = [{ key: '', value: '' }]
  }
  
  // Открываем диалог после подготовки данных
  showCreateDialog.value = true
}

function addPair() {
  dictionaryEntries.value = [...dictionaryEntries.value, { key: '', value: '' }]
}

function removePair(index: number) {
  if (dictionaryEntries.value.length <= 1) return
  const newEntries = [...dictionaryEntries.value]
  newEntries.splice(index, 1)
  dictionaryEntries.value = newEntries
}

function resetForm() {
  moduleForm.title = ''
  moduleForm.is_public = true
  editingModule.value = null
  dictionaryEntries.value = [{ key: '', value: '' }]
}

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

    console.log('Deleting module:', moduleId)
    await modulesStore.deleteModule(moduleId)
    ElMessage.success('Модуль успешно удален')
    
    // Обновление состояния уже происходит в хранилище,
    // не нужно вызывать fetchModules()
  } catch (error: any) {
    if (error.message === 'cancel') {
      return // Пользователь отменил удаление
    }
    console.error('Error deleting module:', error)
    ElMessage.error(error.message || 'Ошибка при удалении модуля')
  }
}

async function saveModule() {
  if (isProcessing.value) return
  
  try {
    isProcessing.value = true
    
    // Проверяем название модуля
    if (!moduleForm.title.trim()) {
      ElMessage.warning('Введите название модуля')
      return
    }

    // Собираем словарь из формы
    const dictionary: Dictionary = {}
    let validPairsCount = 0

    // Проверяем каждую пару на валидность
    for (const entry of dictionaryEntries.value) {
      const key = entry.key.trim()
      const value = entry.value.trim()
      
      if (!key && !value) continue // Пропускаем полностью пустые пары
      
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

    // Создаем объект с данными модуля
    const moduleData = {
      title: moduleForm.title.trim(),
      dictionary,
      is_public: moduleForm.is_public
    }

    let success = false
    
    if (editingModule.value) {
      // Обновляем существующий модуль
      success = await modulesStore.updateModule(
        editingModule.value,
        moduleData.title,
        moduleData.dictionary,
        moduleData.is_public
      )
      
      if (success) {
        ElMessage.success('Модуль успешно обновлен')
      }
    } else {
      // Создаем новый модуль
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
      // Обновляем список модулей
      await modulesStore.fetchModules()
      // Закрываем диалог и сбрасываем форму
      showCreateDialog.value = false
      resetForm()
    }
  } catch (error: any) {
    console.error('Ошибка при сохранении модуля:', error)
    ElMessage.error(error.message || 'Ошибка при сохранении модуля')
  } finally {
    isProcessing.value = false
  }
}

async function generateDictionary() {
  try {
    // Запрашиваем тему
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
      // Запрашиваем количество слов
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
        
        // Создаем элемент загрузки с анимацией и информацией о прогрессе
        let attempt = 1
        const maxAttempts = 6
        const loadingInstance = ElMessage({
          message: h('div', { class: 'generation-status' }, [
            h('i', { class: 'el-icon-loading' }),
            h('div', { class: 'generation-info' }, [
              h('div', { style: 'margin: 8px 0' }, 'Генерация словаря...'),
              h('div', { class: 'generation-progress' }, [
                h('div', { class: 'progress-text' }, [
                  h('small', { style: 'color: var(--el-text-color-secondary)' }, 
                    `Попытка ${attempt} из ${maxAttempts}`)
                ]),
                h('div', { class: 'progress-bar' }, [
                  h('div', { 
                    class: 'progress-fill',
                    style: `width: ${(attempt / maxAttempts) * 100}%`
                  })
                ])
              ])
            ])
          ]),
          duration: 0,
          showClose: false,
          type: 'info'
        })

        try {
          // Функция обновления прогресса
          const updateProgress = () => {
            attempt++
            const progressText = document.querySelector('.progress-text small')
            const progressFill = document.querySelector('.progress-fill') as HTMLElement
            if (progressText) {
              progressText.textContent = `Попытка ${attempt} из ${maxAttempts}`
            }
            if (progressFill) {
              progressFill.style.width = `${(attempt / maxAttempts) * 100}%`
            }
          }

          const result = await modulesStore.generateTheme(theme.trim(), updateProgress, count)
          loadingInstance.close()

          if (result && typeof result === 'object') {
            console.log('Received dictionary data:', result)
            
            try {
              // Очищаем текущие записи
              dictionaryEntries.value = []
              
              // Преобразуем данные в пары для формы
              if (Array.isArray(result)) {
                // Если получен массив
                result.forEach(item => {
                  if (item && typeof item === 'object') {
                    dictionaryEntries.value.push({
                      key: String(Object.keys(item)[0] || ''),
                      value: String(Object.values(item)[0] || '')
                    })
                  }
                })
              } else {
                // Если получен объект
                Object.entries(result).forEach(([key, value]) => {
                  dictionaryEntries.value.push({
                    key: String(key),
                    value: String(value)
                  })
                })
              }

              // Если после обработки нет записей, добавляем пустую
              if (dictionaryEntries.value.length === 0) {
                dictionaryEntries.value = [{ key: '', value: '' }]
                throw new Error('Не удалось обработать полученные данные')
              }
              
              // Устанавливаем тему и количество слов как название модуля
              moduleForm.title = `${theme.trim()} `
              
              ElMessage.success('Словарь успешно сгенерирован')
            } catch (error) {
              console.error('Error processing dictionary data:', error)
              ElMessage.error('Ошибка при обработке данных словаря')
            }
          }
        } catch (error) {
          loadingInstance.close()
          throw error
        }
      }
    }
  } catch (error: any) {
    if (error.message !== 'cancel') {
      ElMessage.error(error.message || 'Не удалось сгенерировать словарь')
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
        
        // Преобразуем импортированный словарь в пары для формы
        dictionaryEntries.value = Object.entries(dictionary).map(([key, value]) => ({
          key,
          value: String(value)
        }))
        
        // Если словарь пустой, добавим одну пустую запись
        if (dictionaryEntries.value.length === 0) {
          dictionaryEntries.value = [{ key: '', value: '' }]
        }
        
        ElMessage.success('Словарь успешно импортирован')
      } catch (parseError) {
        ElMessage.error('Неверный формат JSON')
        console.error('JSON parse error:', parseError)
      }
    }
  } catch (error: any) {
    if (error.message !== 'cancel') {
      ElMessage.error('Ошибка при импорте JSON')
    }
  }
}

async function editModule(module: any) {
  // Сначала сбросим форму
  resetForm()
  
  // Затем заполним ее данными модуля
  editingModule.value = module.id
  moduleForm.title = module.title
  moduleForm.is_public = module.is_public
  
  // Преобразуем словарь в массив пар
  const entries = Object.entries(module.dictionary || {})
  
  if (entries.length > 0) {
    dictionaryEntries.value = entries.map(([key, value]) => ({ key, value: String(value) }))
  } else {
    dictionaryEntries.value = [{ key: '', value: '' }]
  }
  
  // Открываем диалог после подготовки данных
  showCreateDialog.value = true
}

async function toggleModuleLike(moduleId: number) {
  await modulesStore.toggleLike(moduleId)
}

function viewDictionary(module: any) {
  viewingDictionary.value = module.dictionary
  viewingModuleTitle.value = module.title
  showViewDialog.value = true
}

function handleFilterChange() {
  // Если включен один из взаимоисключающих фильтров, выключаем другой
  if (showOnlyPublic.value && showOnlyPrivate.value) {
    if (showOnlyPublic.value) {
      showOnlyPrivate.value = false
    } else {
      showOnlyPublic.value = false
    }
  }
}

// Сбрасываем фильтры при смене раздела
watch(activeSection, () => {
  excludeMyModules.value = false
  showOnlyPublic.value = false
  showOnlyPrivate.value = false
  showOnlyPublicLiked.value = false
})
</script>

<style scoped>
.home {
  min-height: 100vh;
  background-color: var(--el-bg-color);
}

.el-header {
  padding: 0;
}

.flex-grow {
  flex-grow: 1;
}

.search-wrapper {
  position: relative;
  width: 100%;
}

.google-search-input :deep(.el-input__wrapper) {
  border-radius: 24px !important;
  box-shadow: 0 1px 6px rgba(32,33,36,.28) !important;
  padding: 8px 16px;
  transition: all 0.3s ease;
  background-color: #fff;
  border: 1px solid transparent;
}

.google-search-input :deep(.el-input__wrapper):hover {
  box-shadow: 0 1px 6px rgba(32,33,36,.28) !important;
}

.google-search-input :deep(.el-input__wrapper):focus-within {
  box-shadow: 0 1px 6px rgba(32,33,36,.28) !important;
}

.google-search-input :deep(.el-input__inner) {
  font-size: 16px;
  color: #3c4043;
  margin: 0 8px;
}

.search-icon {
  display: flex;
  align-items: center;
  color: #9aa0a6;
}

.search-icon svg {
  width: 20px;
  height: 20px;
  fill: currentColor;
}

.search-suffix {
  display: flex;
  align-items: center;
  gap: 8px;
}

.separator {
  width: 1px;
  height: 24px;
  background-color: #dadce0;
  margin: 0 4px;
}

.section-controls {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 20px;
  margin-bottom: 28px;
  position: relative;
}

.el-radio-group {
  background: #f1f3f4;
  padding: 3px;
  border-radius: 24px;
}

:deep(.el-radio-button__inner) {
  border: none !important;
  background: transparent;
  padding: 8px 16px;
  height: auto;
  line-height: 1.5;
  font-size: 14px;
  border-radius: 24px !important;
  transition: all 0.2s;
}

:deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background: #fff !important;
  color: #202124 !important;
  box-shadow: 0 1px 2px rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15) !important;
}

:deep(.el-radio-button:first-child .el-radio-button__inner) {
  border-radius: 24px !important;
}

:deep(.el-radio-button:last-child .el-radio-button__inner) {
  border-radius: 24px !important;
}

.study-button {
  margin-left: auto;
  height: 36px;
  padding: 0 24px;
  font-size: 14px;
  font-weight: 500;
  color: #fff;
  background-color: #1a73e8;
  border: none;
  border-radius: 4px;
  transition: all 0.2s;
}

.study-button:hover:not([disabled]) {
  background-color: #1557b0;
  box-shadow: 0 1px 2px rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);
}

.study-button[disabled] {
  background-color: #f1f3f4;
  color: #80868b;
  cursor: not-allowed;
}

.add-card {
  border: 1px dashed #dadce0;
  background-color: #fff !important;
  box-shadow: none !important;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.add-card:hover {
  border-color: #1a73e8;
  background-color: #f8f9fa !important;
}

.add-card .card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.add-icon {
  font-size: 24px;
  color: #1a73e8;
  transition: all 0.2s;
}

.add-text {
  color: #5f6368;
  font-size: 14px;
  font-weight: 500;
}

.add-card:hover .add-icon {
  transform: scale(1.1);
}

.module-card {
  height: 200px;
  margin-bottom: 20px;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(60, 64, 67, 0.12), 0 1px 2px rgba(60, 64, 67, 0.24);
  background: #fff;
}

.module-card.is-selected {
  border: 2px solid #1a73e8;
  transform: translateY(-2px);
}

.module-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(60, 64, 67, 0.16), 0 2px 6px rgba(60, 64, 67, 0.12);
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background-color: #fff;
}

.card-header span {
  font-weight: 500;
  font-size: 16px;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.operations {
  display: flex;
  gap: 8px;
  align-items: center;
}

.rating-container {
  display: flex;
  align-items: center;
  gap: 4px;
  margin-right: 8px;
}

.rating-count {
  font-size: 14px;
  color: #5f6368;
  min-width: 20px;
  text-align: center;
}

.card-content {
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 16px;
  background-color: #fff;
}

.word-count {
  color: #5f6368;
  font-size: 14px;
  margin-bottom: 12px;
}

.module-info {
  display: flex;
  gap: 8px;
  align-items: center;
}

.author {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #5f6368;
  font-size: 14px;
  padding: 4px 8px;
  background-color: #f1f3f4;
  border-radius: 16px;
}

.like-button {
  padding: 4px;
  transition: transform 0.2s;
  color: #5f6368;
}

.like-button:hover {
  transform: scale(1.2);
  color: #fbbc04;
}

.like-button.is-liked {
  color: #fbbc04;
}

.search-controls {
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  padding: 0 20px;
}

.module-title {
  font-weight: 500;
  font-size: 16px;
  color: #202124;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 70%;
}

.exclude-checkbox {
  white-space: nowrap;
}

.user-menu {
  height: 60px;
  line-height: 60px;
  padding: 0 20px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  padding: 0 4px;
  border-radius: 4px;
  transition: background-color 0.3s;
}

.user-info:hover {
  background-color: var(--el-color-primary-light-9);
}

.user-info .el-icon {
  font-size: 18px;
  color: var(--el-text-color-regular);
}

.user-info span {
  font-size: 14px;
  color: var(--el-text-color-primary);
}

.el-dropdown-menu .el-icon {
  margin-right: 8px;
}

.dictionary-view {
  max-height: 60vh;
  overflow-y: auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
}

.dictionary-view-item {
  display: flex;
  align-items: center;
  padding: 12px;
  border-bottom: 1px solid rgba(60, 64, 67, 0.08);
  transition: background-color 0.2s;
}

.dictionary-view-item:hover {
  background-color: rgba(60, 64, 67, 0.04);
}

.dictionary-view-item:last-child {
  border-bottom: none;
}

.dictionary-view-item .word {
  flex: 1;
  font-weight: 500;
  color: #202124;
}

.dictionary-view-item .translation {
  flex: 1;
  color: #5f6368;
}

.dictionary-view-item .separator {
  margin: 0 16px;
  color: #dadce0;
}

/* Стили для диалогов */
:deep(.el-dialog) {
  border-radius: 8px;
  box-shadow: 0 24px 38px 3px rgba(0, 0, 0, 0.14), 
              0 9px 46px 8px rgba(0, 0, 0, 0.12), 
              0 11px 15px -7px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}

:deep(.el-dialog__header) {
  margin: 0;
  padding: 20px 24px;
  border-bottom: 1px solid rgba(60, 64, 67, 0.08);
  background-color: #fff;
}

:deep(.el-dialog__title) {
  font-weight: 500;
  color: #202124;
  font-size: 18px;
}

:deep(.el-dialog__headerbtn) {
  top: 20px;
  right: 20px;
}

:deep(.el-dialog__body) {
  padding: 24px;
  color: #5f6368;
}

:deep(.el-dialog__footer) {
  padding: 16px 24px;
  border-top: 1px solid rgba(60, 64, 67, 0.08);
  background-color: #f8f9fa;
}

:deep(.el-button) {
  border-radius: 4px;
  transition: all 0.2s;
}

:deep(.el-input__wrapper) {
  border-radius: 4px;
}

:deep(.el-form-item__label) {
  color: #202124;
  font-weight: 500;
}

.dictionary-container {
  border: 1px solid rgba(60, 64, 67, 0.12);
  border-radius: 8px;
  padding: 16px;
  background-color: #f8f9fa;
}

.dictionary-controls {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.dictionary-controls .el-button {
  flex: 1;
  min-width: 0;
  border-radius: 4px;
}

.dictionary-item {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
  background-color: #fff;
  padding: 8px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(60, 64, 67, 0.1);
}

.el-radio-group {
  border-radius: 24px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(60, 64, 67, 0.12);
}

:deep(.el-radio-button__inner) {
  padding: 10px 20px;
  transition: all 0.2s;
}

:deep(.el-radio-button__orig-radio:checked + .el-radio-button__inner) {
  background: #1a73e8;
  box-shadow: none;
}

/* Анимации для карточек */
.el-row > .el-col {
  animation: fade-in 0.3s ease forwards;
  animation-delay: calc(var(--el-transition-duration) * 0.1 * var(--index, 0));
  opacity: 0;
}

@keyframes fade-in {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.el-main {
  padding: 20px;
  background-color: #f8f9fa;
}

.home {
  background: linear-gradient(to bottom, #fff, #f8f9fa);
}

:deep(.el-tag) {
  border-radius: 16px;
  padding: 0 10px;
}

.el-dropdown-menu .el-checkbox {
  margin: 0;
  width: 100%;
  padding: 8px 16px;
  transition: background-color 0.2s;
}

.el-dropdown-menu .el-checkbox:hover {
  background-color: rgba(60, 64, 67, 0.08);
}
</style> 