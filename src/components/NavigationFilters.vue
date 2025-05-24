<template>
  <div class="filter-tabs">
    <button
      v-for="filter in navigationStore.availableFilters"
      :key="filter.id"
      class="filter-tab"
      :class="{ 'is-active': navigationStore.currentFilterId === filter.id }"
      @click="navigationStore.setFilter(filter.id)"
    >
      <el-icon><component :is="filter.icon" /></el-icon>
      <span class="filter-title">{{ filter.title }}</span>
    </button>
  </div>
</template>

<script setup lang="ts">
import { useNavigationStore } from '@/stores/navigation'

const navigationStore = useNavigationStore()
</script>

<style scoped>
.filter-tabs {
  display: flex;
  gap: 8px;
  padding: 8px;
  background: var(--el-bg-color);
  border-radius: 8px;
  border: 1px solid var(--el-border-color-light);
}

.filter-tab {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border: none;
  border-radius: 4px;
  background: transparent;
  color: var(--el-text-color-regular);
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.filter-tab:hover {
  background: var(--el-fill-color-light);
  color: var(--el-color-primary);
}

.filter-tab.is-active {
  background: var(--el-color-primary-light-9);
  color: var(--el-color-primary);
}

.filter-title {
  white-space: nowrap;
}

@media (max-width: 768px) {
  .filter-tabs {
    overflow-x: auto;
    padding: 8px;
  }

  .filter-tab {
    padding: 8px 12px;
  }
}
</style> 