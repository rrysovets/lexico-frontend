<template>
  <div class="module">
    <el-container>
      <el-header style="padding: 0">
        <app-header back-link="/" back-text="Вернуться к модулям">
          <template #extra>
            <el-menu-item>{{ moduleTitle }}</el-menu-item>
          </template>
        </app-header>
      </el-header>

      <el-main>
        <div v-if="module" class="module-content">
          <el-card>
            <template #header>
              <div class="card-header">
                <h2>{{ module.title }}</h2>
                <div class="operations">
                  <el-button type="primary" @click="startStudy" :loading="studyLoading">Изучать</el-button>
                  <el-button @click="editModule" :loading="editLoading">Редактировать</el-button>
                </div>
              </div>
            </template>

            <el-table :data="wordPairs" stripe empty-text="Словарь пуст">
              <el-table-column prop="word" label="Слово" min-width="40%" />
              <el-table-column prop="translation" label="Перевод" min-width="40%" />
            </el-table>
          </el-card>
        </div>
        <div v-else-if="isLoading" class="loading">
          <el-skeleton :rows="10" animated />
        </div>
        <div v-else class="error">
          <el-result
            icon="error"
            title="Модуль не найден"
            sub-title="Модуль не существует или у вас нет к нему доступа."
          >
            <template #extra>
              <el-button type="primary" @click="$router.push('/')">
                Вернуться к списку
              </el-button>
              <el-button @click="fetchModule">Повторить</el-button>
            </template>
          </el-result>
        </div>
      </el-main>
    </el-container>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useModulesStore, type Module } from '@/stores/modules'
import { ElMessage } from 'element-plus'
import AppHeader from '@/components/AppHeader.vue'

const route = useRoute()
const router = useRouter()
const modulesStore = useModulesStore()

// Состояние компонента
const isLoading = computed(() => modulesStore.isLoading)
const studyLoading = ref(false)
const editLoading = ref(false)
const moduleId = computed(() => Number(route.params.id))

// Получаем модуль из состояния хранилища
const module = computed(() => {
  return modulesStore.modules.find(m => m.id === moduleId.value)
})

// Вычисляем заголовок модуля для отображения
const moduleTitle = computed(() => {
  if (isLoading.value) return 'Загрузка...'
  return module.value?.title || 'Модуль не найден'
})

// Формируем пары слов из словаря модуля
const wordPairs = computed(() => {
  if (!module.value?.dictionary) return []
  
  return Object.entries(module.value.dictionary).map(([word, translation]) => ({
    word,
    translation
  }))
})

// Следим за изменением ID в URL и перезагружаем данные при необходимости
watch(() => route.params.id, async (newId, oldId) => {
  if (newId !== oldId) {
    await fetchModule()
  }
})

// Функция для загрузки данных модуля
async function fetchModule() {
  try {
    console.log('ModuleView: Загрузка модуля ID:', moduleId.value)
    await modulesStore.fetchModules()
    
    // Проверяем, удалось ли загрузить модуль после обновления данных
    if (!modulesStore.getModuleById(moduleId.value)) {
      ElMessage.warning('Модуль не найден в базе данных')
    }
  } catch (error) {
    console.error('Ошибка при загрузке модуля:', error)
    ElMessage.error('Ошибка при загрузке данных модуля')
  }
}

// Переход к изучению модуля
async function startStudy() {
  try {
    studyLoading.value = true
    modulesStore.toggleModuleSelection(moduleId.value)
    await router.push('/study')
  } catch (error) {
    ElMessage.error('Ошибка при переходе к изучению')
  } finally {
    studyLoading.value = false
  }
}

// Переход к редактированию модуля
async function editModule() {
  try {
    if (!module.value) {
      ElMessage.error('Модуль не найден')
      return
    }
    
    editLoading.value = true
    await router.push({ 
      path: '/', 
      query: { 
        action: 'edit', 
        moduleId: moduleId.value.toString() 
      } 
    })
  } catch (error) {
    ElMessage.error('Ошибка при переходе к редактированию')
  } finally {
    editLoading.value = false
  }
}

onMounted(async () => {
  await fetchModule()
})
</script>

<style scoped>
.module {
  height: 100vh;
}

.module-content {
  max-width: 800px;
  margin: 0 auto;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.operations {
  display: flex;
  gap: 1rem;
}

.loading,
.error {
  max-width: 800px;
  margin: 2rem auto;
}
</style> 