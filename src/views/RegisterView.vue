<template>
  <div class="register">
    <el-card class="register-card">
      <template #header>
        <h2>Регистрация</h2>
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

        <el-form-item label="Email" prop="email">
          <el-input 
            v-model="form.email"
            type="email"
            placeholder="Введите email"
          />
        </el-form-item>

        <el-form-item label="Пароль" prop="password">
          <el-input 
            v-model="form.password"
            type="password"
            placeholder="Введите пароль"
          />
        </el-form-item>

        <el-form-item label="Подтверждение пароля" prop="confirmPassword">
          <el-input 
            v-model="form.confirmPassword"
            type="password"
            placeholder="Подтвердите пароль"
          />
        </el-form-item>

        <el-form-item>
          <el-button 
            type="primary" 
            @click="handleSubmit"
            :loading="loading"
            class="submit-button"
          >
            Зарегистрироваться
          </el-button>
        </el-form-item>

        <div class="login-link">
          Уже есть аккаунт? 
          <router-link to="/login">Войти</router-link>
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
  email: '',
  password: '',
  confirmPassword: ''
})

const validatePass = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('Введите пароль'))
  } else {
    if (form.confirmPassword !== '') {
      if (formRef.value) {
        formRef.value.validateField('confirmPassword')
      }
    }
    callback()
  }
}

const validatePass2 = (rule: any, value: string, callback: any) => {
  if (value === '') {
    callback(new Error('Подтвердите пароль'))
  } else if (value !== form.password) {
    callback(new Error('Пароли не совпадают'))
  } else {
    callback()
  }
}

const rules = {
  username: [
    { required: true, message: 'Введите имя пользователя', trigger: 'blur' },
    { min: 3, message: 'Минимум 3 символа', trigger: 'blur' }
  ],
  email: [
    { required: true, message: 'Введите email', trigger: 'blur' },
    { type: 'email', message: 'Неверный формат email', trigger: 'blur' }
  ],
  password: [
    { required: true, validator: validatePass, trigger: 'blur' },
    { min: 6, message: 'Минимум 6 символов', trigger: 'blur' }
  ],
  confirmPassword: [
    { required: true, validator: validatePass2, trigger: 'blur' }
  ]
}

const handleSubmit = async () => {
  if (!formRef.value) return

  try {
    await formRef.value.validate()
    loading.value = true
    
    const success = await authStore.register(form.username, form.email, form.password)
    
    if (success) {
      ElMessage.success('Регистрация выполнена успешно')
      router.push('/login')
    } else {
      ElMessage.error('Ошибка при регистрации')
    }
  } catch (error) {
    console.error('Registration error:', error)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.register {
  height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--el-bg-color);
}

.register-card {
  width: 100%;
  max-width: 400px;
}

.submit-button {
  width: 100%;
}

.login-link {
  text-align: center;
  margin-top: 1rem;
}

.login-link a {
  color: var(--el-color-primary);
  text-decoration: none;
}

.login-link a:hover {
  text-decoration: underline;
}
</style> 