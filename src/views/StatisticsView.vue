<template>
  <div 
    class="app-layout"
    :class="{
      'has-sidebar': layoutStore.isSidebarOpen && !layoutStore.isMobileView,
      'sidebar-collapsed': layoutStore.isSidebarCollapsed && !layoutStore.isMobileView
    }"
  >
    <AppSidebar />
    <AppHeader @show-create-module="showCreateDialog = true" />

    <main class="main-content">
      <div class="page-content">
        <div class="page-container">
          <h1 class="section-title">Статистика</h1>
          
          <div class="stats-grid">
            <!-- Общая статистика -->
            <div class="stats-card total-stats">
              <h3>Общая статистика</h3>
              <div class="stats-content">
                <div class="stat-item">
                  <div class="stat-value">{{ totalModules }}</div>
                  <div class="stat-label">Всего модулей</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ totalWords }}</div>
                  <div class="stat-label">Всего слов</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ publicModules }}</div>
                  <div class="stat-label">Публичных модулей</div>
                </div>
              </div>
            </div>

            <!-- График активности -->
            <div class="stats-card activity-graph">
              <h3>График активности</h3>
              <div class="activity-grid">
                <!-- Здесь будет график в стиле GitHub -->
                <div 
                  v-for="(day, index) in activityData" 
                  :key="index"
                  class="activity-cell"
                  :style="{ 
                    backgroundColor: getActivityColor(day.count),
                    '--tooltip-text': `${day.count} действий за ${day.date}`
                  }"
                />
              </div>
            </div>

            <!-- Статистика изучения -->
            <div class="stats-card learning-stats">
              <h3>Статистика изучения</h3>
              <div class="stats-content">
                <div class="stat-item">
                  <div class="stat-value">{{ wordsLearned }}</div>
                  <div class="stat-label">Изучено слов</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ learningStreak }}</div>
                  <div class="stat-label">Дней подряд</div>
                </div>
                <div class="stat-item">
                  <div class="stat-value">{{ averageScore }}%</div>
                  <div class="stat-label">Средний результат</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useModulesStore } from '@/stores/modules'
import { useLayoutStore } from '@/stores/layout'
import AppHeader from '@/components/AppHeader.vue'
import AppSidebar from '@/components/AppSidebar.vue'

const modulesStore = useModulesStore()
const layoutStore = useLayoutStore()
const showCreateDialog = ref(false)

// Временные данные для демонстрации
const totalModules = ref(0)
const totalWords = ref(0)
const publicModules = ref(0)
const wordsLearned = ref(0)
const learningStreak = ref(0)
const averageScore = ref(0)
const activityData = ref<{ date: string; count: number }[]>([])

// Генерация временных данных для графика активности
function generateActivityData() {
  const data = []
  const today = new Date()
  for (let i = 0; i < 365; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() - i)
    data.unshift({
      date: date.toLocaleDateString(),
      count: Math.floor(Math.random() * 5)
    })
  }
  return data
}

// Получение цвета для ячейки активности
function getActivityColor(count: number): string {
  const colors = [
    'var(--color-secondary-100)',  // 0 действий
    'var(--color-primary-200)',    // 1-2 действия
    'var(--color-primary-400)',    // 3-4 действия
    'var(--color-primary-600)',    // 5-6 действий
    'var(--color-primary-800)'     // 7+ действий
  ]
  return colors[Math.min(Math.floor(count), colors.length - 1)]
}

// Инициализация данных
onMounted(async () => {
  // В будущем здесь будет реальная загрузка данных
  totalModules.value = 15
  totalWords.value = 450
  publicModules.value = 8
  wordsLearned.value = 234
  learningStreak.value = 7
  averageScore.value = 85
  activityData.value = generateActivityData()
})
</script>

<style scoped>
.app-layout {
  min-height: 100vh;
  display: flex;
  background: var(--color-secondary-50);
}

.main-content {
  flex: 1;
  min-height: 100vh;
  margin-left: 0;
  transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.app-layout.has-sidebar .main-content {
  margin-left: 260px;
}

.app-layout.sidebar-collapsed .main-content {
  margin-left: 64px;
}

.page-content {
  padding-top: 64px;
  min-height: calc(100vh - 64px);
}

.stats-grid {
  display: grid;
  gap: var(--spacing-6);
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
}

.stats-card {
  background: white;
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-6);
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--color-secondary-200);
}

.stats-card h3 {
  font-size: var(--font-size-lg);
  font-weight: var(--font-weight-semibold);
  color: var(--color-secondary-900);
  margin-bottom: var(--spacing-4);
}

.stats-content {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: var(--spacing-4);
}

.stat-item {
  text-align: center;
}

.stat-value {
  font-size: var(--font-size-2xl);
  font-weight: var(--font-weight-bold);
  color: var(--color-primary-600);
  margin-bottom: var(--spacing-2);
}

.stat-label {
  font-size: var(--font-size-sm);
  color: var(--color-secondary-600);
}

.activity-graph {
  grid-column: 1 / -1;
}

.activity-grid {
  display: grid;
  grid-template-columns: repeat(52, 1fr);
  gap: 2px;
  padding: var(--spacing-4);
}

.activity-cell {
  aspect-ratio: 1;
  border-radius: 2px;
  position: relative;
  cursor: pointer;
}

.activity-cell:hover::after {
  content: attr(--tooltip-text);
  position: absolute;
  bottom: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  background: white;
  color: var(--color-secondary-700);
  padding: var(--spacing-2) var(--spacing-3);
  border-radius: var(--border-radius-lg);
  font-size: var(--font-size-xs);
  white-space: nowrap;
  z-index: 1;
  box-shadow: var(--shadow-lg);
  border: 1px solid var(--color-secondary-200);
}

.activity-cell:hover::before {
  content: '';
  position: absolute;
  bottom: calc(100% + 4px);
  left: 50%;
  transform: translateX(-50%) rotate(45deg);
  width: 8px;
  height: 8px;
  background: white;
  border-right: 1px solid var(--color-secondary-200);
  border-bottom: 1px solid var(--color-secondary-200);
  z-index: 0;
}

@media (max-width: 768px) {
  .stats-content {
    grid-template-columns: repeat(2, 1fr);
  }

  .activity-grid {
    grid-template-columns: repeat(26, 1fr);
  }
}
</style> 