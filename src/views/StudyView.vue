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
      <app-header>
        <template #default>
          <div class="study-progress">
            {{ currentIndex + 1 }} / {{ totalCards }}
          </div>
        </template>
      </app-header>

      <div class="page-content">
        <div class="page-container">
          <!-- Выбор режима изучения -->
          <div class="study-modes" v-if="!isStarted">
            <div class="study-modes-grid">
              <!-- Основной режим (карточки) -->
              <div 
                class="study-mode-tile main-mode"
                :class="{ 'active': selectedMode === 'flashcards' }"
                @click="selectMode('flashcards')"
              >
                <div class="mode-content">
                  <el-icon class="mode-icon"><Reading /></el-icon>
                  <h3>Карточки</h3>
                  <p class="mode-description">Классический режим изучения с карточками</p>
                  <div class="mode-stats" v-if="selectedMode === 'flashcards'">
                    <div class="stat-item">
                      <span class="stat-label">Изучено модулей:</span>
                      <span class="stat-value">0/{{ modulesStore.selectedModules.length }}</span>
                    </div>
                    <div class="stat-item">
                      <span class="stat-label">Изучено слов:</span>
                      <span class="stat-value">{{ studiedCount }}/{{ totalCards }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Дополнительные режимы -->
              <div class="additional-modes">
                <div 
                  v-for="mode in additionalModes"
                  :key="mode.id"
                  class="study-mode-tile small-mode"
                  :class="{ 'active': selectedMode === mode.id }"
                  @click="selectMode(mode.id)"
                >
                  <div class="mode-content">
                    <el-icon class="mode-icon"><component :is="mode.icon" /></el-icon>
                    <h4>{{ mode.title }}</h4>
                    <p class="mode-description">{{ mode.description }}</p>
                  </div>
                </div>
              </div>
            </div>

            <!-- Кнопка начать -->
            <div class="start-button-container">
              <el-button 
                type="primary" 
                size="large"
                @click="startStudy"
              >
                Начать изучение
              </el-button>
            </div>
          </div>

          <!-- Контент для изучения -->
          <div v-if="cards.length && isStarted" class="study-content">
            <!-- Режим карточек -->
            <flashcards-mode
              v-if="selectedMode === 'flashcards'"
              v-model:cards="cards"
              @finish="resetStudy"
            />

            <!-- Режим письменного ввода -->
            <writing-mode
              v-if="selectedMode === 'writing'"
              v-model:cards="cards"
            />

            <!-- Режим тестирования -->
            <quiz-mode
              v-if="selectedMode === 'quiz'"
              v-model:cards="cards"
            />

            <!-- Режим сопоставления -->
            <matching-mode
              v-if="selectedMode === 'matching'"
              v-model:cards="cards"
            />

            <!-- Режим Правда/Ложь -->
            <true-false-mode
              v-if="selectedMode === 'truefalse'"
              v-model:cards="cards"
            />

            <!-- Режим испытания -->
            <challenge-mode
              v-if="selectedMode === 'challenge'"
              v-model:cards="cards"
            />
          </div>

          <div v-else class="empty-state">
            <el-empty description="Нет выбранных модулей для изучения">
              <el-button type="primary" @click="$router.push('/')">
                Выбрать модули
              </el-button>
            </el-empty>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useModulesStore } from '@/stores/modules'
import { useLayoutStore } from '@/stores/layout'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'
import FlashcardsMode from '@/components/study/FlashcardsMode.vue'
import WritingMode from '@/components/study/WritingMode.vue'
import QuizMode from '@/components/study/QuizMode.vue'
import MatchingMode from '@/components/study/MatchingMode.vue'
import TrueFalseMode from '@/components/study/TrueFalseMode.vue'
import ChallengeMode from '@/components/study/ChallengeMode.vue'
import { 
  Reading,
  Edit,
  Document,
  Connection,
  List,
  Rank,
  Select
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const modulesStore = useModulesStore()
const layoutStore = useLayoutStore()

interface Card {
  word: string
  translation: string
  studied: boolean
  correct: boolean
}

// Состояние режимов
const selectedMode = ref('flashcards')
const isStarted = ref(false)

// Дополнительные режимы
const additionalModes = [
  {
    id: 'writing',
    title: 'Письменный',
    description: 'Проверка написания слов',
    icon: Edit
  },
  {
    id: 'quiz',
    title: 'Тест',
    description: 'Выбор правильного варианта',
    icon: Document
  },
  {
    id: 'matching',
    title: 'Сопоставление',
    description: 'Соединение пар слов',
    icon: Connection
  },
  {
    id: 'truefalse',
    title: 'Правда/Ложь',
    description: 'Проверка соответствия слов и переводов',
    icon: Select
  },
  {
    id: 'challenge',
    title: 'Испытание',
    description: 'Проверка всех знаний',
    icon: Rank
  }
]

// Состояние карточек
const cards = ref<Card[]>([])
const currentIndex = ref(0)

// Статистика
const studiedCount = computed(() => cards.value.filter(card => card.studied).length)
const correctAnswers = computed(() => cards.value.filter(card => card.correct).length)
const totalCards = computed(() => cards.value.length)

// Подготовка карточек из выбранных модулей
const prepareCards = () => {
  cards.value = []
  const selectedModules = modulesStore.modules.filter(
    module => modulesStore.selectedModules.includes(module.id)
  )

  selectedModules.forEach(module => {
    Object.entries(module.dictionary).forEach(([word, translation]) => {
      cards.value.push({ 
        word, 
        translation,
        studied: false,
        correct: false
      })
    })
  })

  // Перемешиваем карточки
  cards.value.sort(() => Math.random() - 0.5)
}

// Управление режимами
const selectMode = (mode: string) => {
  selectedMode.value = mode
}

const startStudy = () => {
  isStarted.value = true
}

const resetStudy = () => {
  isStarted.value = false
  prepareCards()
}

onMounted(async () => {
  try {
    await modulesStore.fetchModules()
    
    if (!modulesStore.selectedModules.length) {
      router.push('/')
      return
    }
    
    prepareCards()
  } catch (error) {
    console.error('Error loading study cards:', error)
    ElMessage.error('Ошибка при загрузке карточек для изучения')
    router.push('/')
  }
})
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

.study-progress {
  font-size: 16px;
  font-weight: 500;
  color: var(--el-text-color-primary);
}

/* Стили для режимов изучения */
.study-modes {
  margin-bottom: 2rem;
}

.study-modes-grid {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 1.5rem;
}

.study-mode-tile {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--el-border-color-light);
}

.study-mode-tile:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.study-mode-tile.active {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.main-mode {
  height: 100%;
  min-height: 300px;
}

.additional-modes {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 1rem;
}

.mode-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.mode-icon {
  font-size: 2rem;
  color: var(--el-color-primary);
  margin-bottom: 0.5rem;
}

.mode-description {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.mode-stats {
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--el-border-color-light);
}

.stat-item {
  display: flex;
  justify-content: space-between;
  margin-bottom: 0.5rem;
}

.stat-label {
  color: var(--el-text-color-secondary);
}

.stat-value {
  font-weight: 600;
  color: var(--el-color-primary);
}

.empty-state {
  height: calc(100vh - var(--header-height, 64px) - 48px);
  display: flex;
  align-items: center;
  justify-content: center;
}

.start-button-container {
  margin-top: 2rem;
  text-align: center;
}

.start-button-container .el-button {
  min-width: 200px;
  height: 48px;
  font-size: 1.1rem;
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

  .study-modes-grid {
    grid-template-columns: 1fr;
  }

  .additional-modes {
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  }
}
</style> 