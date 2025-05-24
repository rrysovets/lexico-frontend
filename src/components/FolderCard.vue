<template>
  <base-card
    :title="folder.title"
    :author="folder.author"
    :is-public="folder.is_public"
    :is-personal="isPersonal"
    :is-disabled="isDisabled"
    :is-selected="isSelected"
    :rating="folder.rating"
    :is-liked="folder.is_liked"
    :selectable="true"
    :icon="Folder"
    @toggle-like="$emit('toggle-like')"
    @edit="$emit('edit')"
    @delete="$emit('delete')"
    @view="$emit('view')"
    @select="$emit('select')"
  >
    <template #stats>
      <div class="stat-item">
        <span class="stat-value">
          {{ folder.modules.length }}
          {{ getModuleCountLabel(folder.modules.length) }}
        </span>
      </div>
    </template>

    <template #preview-text>
      Посмотреть
    </template>
  </base-card>
</template>

<script setup lang="ts">
import { Folder } from '@element-plus/icons-vue'
import BaseCard from '@/components/base/BaseCard.vue'
import type { Folder as FolderType } from '@/stores/folders'

interface Props {
  folder: FolderType
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

function getModuleCountLabel(count: number): string {
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
</script>

<style scoped>
.folder-card {
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

.folder-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.folder-card.selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.folder-header {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.folder-icon {
  font-size: 2rem;
  color: var(--el-color-primary);
}

.folder-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.folder-description {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  margin: 0;
}

.folder-stats {
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