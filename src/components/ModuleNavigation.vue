<template>
  <nav class="module-navigation">
    <div class="nav-tabs">
      <button
        v-for="tab in tabs"
        :key="tab.value"
        class="nav-tab"
        :class="{ 'active': modelValue === tab.value }"
        @click="$emit('update:modelValue', tab.value)"
      >
        <el-icon class="tab-icon">
          <component :is="tab.icon" />
        </el-icon>
        <span class="tab-text">{{ tab.label }}</span>
      </button>
    </div>

    <div class="study-section">
      <transition name="fade">
        <div v-if="selectedCount > 0" class="selected-info">
          <span class="selected-count">{{ selectedCount }}</span>
          <span class="selected-text">{{ selectedLabel }}</span>
        </div>
      </transition>
      
      <el-button
        class="study-button"
        type="primary"
        :disabled="selectedCount === 0"
        @click="$emit('study')"
      >
        <el-icon><CaretRight /></el-icon>
        Начать изучение
      </el-button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Folder, Star, Collection, CaretRight } from '@element-plus/icons-vue'
import type { Component } from 'vue'

interface Tab {
  label: string
  value: 'personal' | 'popular' | 'liked'
  icon: Component
}

const props = defineProps<{
  modelValue: 'personal' | 'popular' | 'liked'
  selectedCount: number
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: 'personal' | 'popular' | 'liked'): void
  (e: 'study'): void
}>()

const tabs: Tab[] = [
  { label: 'Мои модули', value: 'personal', icon: Folder },
  { label: 'Популярные', value: 'popular', icon: Collection },
  { label: 'Избранное', value: 'liked', icon: Star }
]

const selectedLabel = computed(() => {
  const count = props.selectedCount
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'модулей выбрано'
  }

  if (lastDigit === 1) {
    return 'модуль выбран'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'модуля выбрано'
  }

  return 'модулей выбрано'
})
</script>

<style scoped>
.module-navigation {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: var(--spacing-4);
  padding: var(--spacing-4);
  background-color: var(--color-secondary-50);
  border-radius: var(--border-radius-xl);
  border: 1px solid var(--color-secondary-200);
  margin-bottom: var(--spacing-6);
}

.nav-tabs {
  display: flex;
  gap: var(--spacing-2);
}

.nav-tab {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-full);
  border: none;
  background: transparent;
  color: var(--color-secondary-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  cursor: pointer;
  transition: var(--transition-all);
}

.nav-tab:hover {
  background-color: var(--color-secondary-100);
  color: var(--color-secondary-900);
}

.nav-tab.active {
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
}

.tab-icon {
  font-size: var(--font-size-lg);
}

.study-section {
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
}

.selected-info {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-4);
  border-radius: var(--border-radius-full);
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.selected-count {
  font-weight: var(--font-weight-bold);
}

.study-button {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-6);
  border-radius: var(--border-radius-full);
  font-weight: var(--font-weight-medium);
  transition: var(--transition-all);
}

.study-button:not(:disabled):hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-lg);
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

@media (max-width: 768px) {
  .module-navigation {
    flex-direction: column;
    gap: var(--spacing-4);
  }

  .nav-tabs {
    width: 100%;
    justify-content: space-between;
  }

  .study-section {
    width: 100%;
    justify-content: space-between;
  }

  .nav-tab {
    flex: 1;
    justify-content: center;
  }

  .tab-text {
    display: none;
  }
}
</style> 