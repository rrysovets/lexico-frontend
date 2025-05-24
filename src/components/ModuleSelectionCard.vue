<template>
  <base-card
    :title="module.title"
    :author="module.author"
    :is-public="module.is_public"
    :is-personal="isPersonal"
    :is-disabled="isDisabled"
    :is-selected="isSelected"
    :rating="module.rating"
    :is-liked="module.is_liked"
    :selectable="true"
    :icon="Document"
    @toggle-like="$emit('toggle-like')"
    @edit="$emit('edit')"
    @delete="$emit('delete')"
    @view="$emit('view')"
    @select="$emit('select')"
  >
    <template #stats>
      <div class="stat-item">
        <span class="stat-value">
          {{ Object.keys(module.dictionary).length }}
          {{ getDictionaryCountLabel(Object.keys(module.dictionary).length) }}
        </span>
      </div>
    </template>

    <template #preview-text>
      Просмотреть
    </template>
  </base-card>
</template>

<script setup lang="ts">
import { Document } from '@element-plus/icons-vue'
import BaseCard from '@/components/base/BaseCard.vue'
import type { Module } from '@/stores/modules'

interface Props {
  module: Module
  isSelected: boolean
  isPersonal?: boolean
  isDisabled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isPersonal: false,
  isDisabled: false
})

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'toggle-like'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'view'): void
}>()

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
</script>

<style scoped>
.module-card {
  background: white;
  border-radius: 12px;
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 2px solid var(--el-border-color-light);
  height: 100%;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.module-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.module-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.module-icon {
  font-size: 2rem;
  color: var(--el-color-primary);
}

.module-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.module-description {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.module-stats {
  margin-top: auto;
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
</style> 