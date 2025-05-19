<template>
  <div class="header">
    <el-menu mode="horizontal" :router="true">
      <el-menu-item :index="backLink">{{ backText }}</el-menu-item>
      <slot></slot>
      <div class="flex-grow"></div>
      <el-menu-item >
        <el-icon><User /></el-icon>
        <span style="margin-left: 8px">{{ authStore.user?.username }}</span>

      </el-menu-item>
      <el-menu-item @click="handleLogout">
        <el-icon><SwitchButton /></el-icon>
        <span style="margin-left: 8px">Выйти</span>
      </el-menu-item>
    </el-menu>
  </div>
</template>

<script setup lang="ts">
import { useAuthStore } from '@/stores/auth'
import { User, SwitchButton } from '@element-plus/icons-vue'
import { useRouter } from 'vue-router'

const router = useRouter()
const authStore = useAuthStore()

defineProps<{
  backLink: string
  backText: string
}>()

async function handleLogout() {
  await authStore.logout()
  router.push('/login')
}
</script>

<style scoped>
.header {
  border-bottom: 1px solid var(--el-border-color-light);
}

.flex-grow {
  flex-grow: 1;
}
</style> 