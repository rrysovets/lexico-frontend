<template>
  <div 
    class="base-card"
    :class="{
      'is-selected': isSelected,
      'is-disabled': isDisabled
    }"
    @click="handleSelect"
  >
    <div class="card-header">
      <div class="item-info">
        <div class="visibility-badge" :class="{ 'is-public': isPublic }">
          {{ isPublic ? 'Публичный' : 'Приватный' }}
        </div>
        <div class="author-badge">
          <el-icon><User /></el-icon>
          {{ author }}
        </div>
      </div>

      <div class="actions">
        <button 
          v-if="rating !== undefined"
          class="like-button"
          :class="{ 'is-liked': isLiked }"
          @click.stop="$emit('toggle-like')"
        >
          <el-icon><Star /></el-icon>
          <span class="like-count">{{ rating }}</span>
        </button>

        <el-dropdown 
          v-if="isPersonal" 
          trigger="click" 
          @command="handleCommand"
          @click.stop
        >
          <button class="action-button">
            <el-icon><More /></el-icon>
          </button>
          <template #dropdown>
            <el-dropdown-menu>
              <el-dropdown-item command="edit">
                <el-icon><Edit /></el-icon>
                Редактировать
              </el-dropdown-item>
              <el-dropdown-item command="delete">
                <el-icon><Delete /></el-icon>
                Удалить
              </el-dropdown-item>
            </el-dropdown-menu>
          </template>
        </el-dropdown>
      </div>
    </div>

    <div class="card-content">
      <div class="content-main">
        <div class="title-with-icon">
          <el-icon class="title-icon" :size="24">
            <component :is="icon" />
          </el-icon>
          <h3 class="item-title">{{ title }}</h3>
        </div>
        
        <div class="item-stats">
          <slot name="stats" />
        </div>
      </div>
    </div>

    <div class="card-footer">
      <button 
        class="preview-button"
        @click.stop="$emit('view')"
      >
        <el-icon><View /></el-icon>
        <slot name="preview-text">Просмотреть</slot>
      </button>

      <button 
        v-if="selectable"
        class="select-button"
        :class="{ 'is-selected': isSelected }"
        @click.stop="$emit('select')"
      >
        <el-icon><Check /></el-icon>
        {{ isSelected ? 'Выбрано' : 'Выбрать' }}
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { 
  Star, More, Edit, Delete, User, 
  View, Check
} from '@element-plus/icons-vue'
import type { Component } from 'vue'

interface Props {
  title: string
  author: string
  isPublic: boolean
  isPersonal?: boolean
  isSelected?: boolean
  isDisabled?: boolean
  rating?: number
  isLiked?: boolean
  selectable?: boolean
  icon: Component
}

const props = withDefaults(defineProps<Props>(), {
  isPersonal: false,
  isSelected: false,
  isDisabled: false,
  rating: undefined,
  isLiked: false,
  selectable: false
})

const emit = defineEmits<{
  (e: 'select'): void
  (e: 'toggle-like'): void
  (e: 'edit'): void
  (e: 'delete'): void
  (e: 'view'): void
}>()

function handleCommand(command: string) {
  switch (command) {
    case 'edit':
      emit('edit')
      break
    case 'delete':
      emit('delete')
      break
  }
}

function handleSelect() {
  if (!props.isDisabled && props.selectable) {
    emit('select')
  }
}
</script>

<style scoped>
.base-card {
  position: relative;
  background: white;
  border-radius: 24px;
  border: 2px solid var(--el-border-color-light);
  transition: all 0.3s ease;
  cursor: pointer;
  overflow: hidden;
  height: 100%;
  display: flex;
  flex-direction: column;
}

.base-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.08);
  border-color: var(--el-color-primary-light-5);
}

.base-card.is-selected {
  border-color: var(--el-color-primary);
  background: var(--el-color-primary-light-9);
}

.base-card.is-disabled {
  opacity: 0.7;
  cursor: not-allowed;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.25rem 1.5rem;
}

.item-info {
  display: flex;
  gap: 0.75rem;
  align-items: center;
}

.visibility-badge {
  display: flex;
  align-items: center;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  font-weight: 500;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
}

.visibility-badge.is-public {
  background-color: var(--el-color-success-light-8);
  color: var(--el-color-success-dark-2);
}

.author-badge {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  font-size: 0.875rem;
  color: var(--el-text-color-regular);
  background-color: var(--el-fill-color-light);
}

.actions {
  display: flex;
  gap: 0.75rem;
}

.like-button,
.action-button {
  display: flex;
  align-items: center;
  gap: 0.375rem;
  padding: 0.25rem 0.75rem;
  border-radius: 20px;
  border: none;
  background-color: var(--el-fill-color-light);
  color: var(--el-text-color-regular);
  font-size: 0.875rem;
  cursor: pointer;
  transition: all 0.3s ease;
}

.like-button:hover,
.action-button:hover {
  background-color: var(--el-fill-color);
  transform: scale(1.05);
}

.like-button.is-liked {
  background-color: var(--el-color-warning-light-8);
  color: var(--el-color-warning-dark-2);
}

.like-count {
  font-weight: 500;
}

.card-content {
  padding: 0 1.5rem 1.5rem;
  text-align: center;
  flex-grow: 1;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.content-main {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.title-with-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
}

.title-icon {
  color: var(--el-color-primary);
  opacity: 0.9;
}

.item-title {
  font-size: 1.375rem;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin: 0;
}

.item-stats {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
}

.card-footer {
  display: flex;
  gap: 0.75rem;
  padding: 1.5rem;
  background-color: var(--el-fill-color-lighter);
  border-bottom-left-radius: 22px;
  border-bottom-right-radius: 22px;
}

.preview-button,
.select-button {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1.25rem;
  border-radius: 16px;
  border: none;
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  flex: 1;
}

.preview-button {
  background-color: white;
  color: var(--el-text-color-primary);
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.preview-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
}

.select-button {
  background-color: var(--el-color-primary);
  color: white;
  box-shadow: 0 2px 6px rgba(var(--el-color-primary-rgb), 0.2);
}

.select-button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(var(--el-color-primary-rgb), 0.3);
}

.select-button.is-selected {
  background-color: var(--el-color-success);
  box-shadow: 0 2px 6px rgba(var(--el-color-success-rgb), 0.2);
}

.select-button.is-selected:hover {
  box-shadow: 0 4px 12px rgba(var(--el-color-success-rgb), 0.3);
}

@media (max-width: 768px) {
  .card-header {
    padding: 1rem 1.25rem;
  }

  .card-content {
    padding: 0 1.25rem 1.25rem;
  }

  .card-footer {
    padding: 1.25rem;
    flex-direction: column;
  }

  .visibility-badge,
  .author-badge,
  .like-button,
  .action-button {
    padding: 0.25rem 0.5rem;
    font-size: 0.75rem;
  }

  .item-title {
    font-size: 1.25rem;
  }

  .item-stats {
    font-size: 0.75rem;
  }
}
</style> 