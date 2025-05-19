import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import App from './App.vue'
import router from './router'
import { initializeApp } from './utils/init'
import './assets/main.css'

const app = createApp(App)
const pinia = createPinia()

app.use(pinia)
app.use(router)
app.use(ElementPlus)

// Инициализируем приложение перед монтированием
initializeApp().then(() => {
  app.mount('#app')
}).catch(error => {
  console.error('Failed to initialize app:', error)
  // Всё равно монтируем приложение, чтобы пользователь мог войти
  app.mount('#app')
}) 