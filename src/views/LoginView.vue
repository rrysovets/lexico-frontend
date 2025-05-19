<template>
  <div class="login">
    <el-card class="login-card">
      <template #header>
        <h2>Вход в систему</h2>
      </template>

      <el-form 
        :model="form"
        :rules="rules"
        ref="formRef"
        label-position="top"
      >
        <el-form-item label="Имя пользователя" prop="username">
          <el-input 
            v-model="form.username"
            placeholder="Введите имя пользователя"
          />
        </el-form-item>

        <el-form-item label="Пароль" prop="password">
          <el-input 
            v-model="form.password"
            type="password"
            placeholder="Введите пароль"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="loading"
            class="submit-button"
          >
            Войти
          </el-button>
        </el-form-item>

        <div class="register-link">
          Нет аккаунта? 
          <router-link to="/register">Зарегистрироваться</router-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import { ElMessage } from 'element-plus'
import type { FormInstance } from 'element-plus'

const router = useRouter()
const authStore = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)

const form = reactive({
  username: '',
  password: ''
})

const rules = {
  username: [
    { required: true, message: 'Введите имя пользователя', trigger: 'blur' }
  ],
  password: [
    { required: true, message: 'Введите пароль', trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    
    const success = await authStore.login(form.username, form.password)
    
    if (success) {
      ElMessage.success('Вход выполнен успешно')
      router.push('/')
    } else {
      ElMessage.error('Неверное имя пользователя или пароль')
    }
  } catch (error) {
    console.error('Login error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color);
}

.login-card {
  width: 100%;
  max-width: 400px;
}

.submit-button {
  width: 100%;
}

.register-link {
  text-align: center;
  margin-top: 1rem;
}

.register-link a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.register-link a:hover {
  text-decoration: underline;
}
</style> 