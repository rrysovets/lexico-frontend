<template>
  <div>
    <app-header back-link="/" back-text="Вернуться к модулям">
      <el-menu-item>
        {{ currentIndex + 1 }} / {{ totalCards }}
      </el-menu-item>
    </app-header>

    <div class="study-container" v-if="cards.length">
      <!-- Карточка -->
      <div 
        class="flashcard"
        :class="{ 'is-flipped': isFlipped }"
        @click="flipCard"
      >
        <div class="flashcard-inner">
          <div class="flashcard-front">
            <div class="card-content">{{ currentCard.word }}</div>
          </div>
          <div class="flashcard-back">
            <div class="card-content">{{ currentCard.translation }}</div>
          </div>
        </div>
      </div>

      <!-- Навигация -->
      <div class="navigation">
        <el-button 
          type="primary" 
          icon="el-icon-arrow-left"
          @click="previousCard"
          :disabled="currentIndex === 0"
        >
          Предыдущая
        </el-button>
        <el-button 
          type="primary" 
          icon="el-icon-arrow-right"
          @click="nextCard"
          :disabled="currentIndex === cards.length - 1"
        >
          Следующая
        </el-button>
      </div>
    </div>
    <div v-else class="empty-state">
      <el-empty description="Нет выбранных модулей для изучения">
        <el-button type="primary" @click="$router.push('/')">
          Выбрать модули
        </el-button>
      </el-empty>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useModulesStore } from '@/stores/modules'
import { useRouter } from 'vue-router'
import AppHeader from '@/components/AppHeader.vue'

const router = useRouter()
const modulesStore = useModulesStore()

interface Card {
  word: string
  translation: string
}

const isFlipped = ref(false)
const currentIndex = ref(0)
const cards = ref<Card[]>([])

// Подготовка карточек из выбранных модулей
const prepareCards = () => {
  cards.value = []
  const selectedModules = modulesStore.modules.filter(
    module => modulesStore.selectedModules.includes(module.id)
  )

  selectedModules.forEach(module => {
    Object.entries(module.dictionary).forEach(([word, translation]) => {
      cards.value.push({ word, translation })
    })
  })

  // Перемешиваем карточки
  cards.value.sort(() => Math.random() - 0.5)
}

const totalCards = computed(() => cards.value.length)
const currentCard = computed(() => cards.value[currentIndex.value])

const flipCard = () => {
  isFlipped.value = !isFlipped.value
}

const nextCard = () => {
  if (currentIndex.value < cards.value.length - 1) {
    isFlipped.value = false
    currentIndex.value++
  }
}

const previousCard = () => {
  if (currentIndex.value > 0) {
    isFlipped.value = false
    currentIndex.value--
  }
}

onMounted(() => {
  if (!modulesStore.selectedModules.length) {
    router.push('/')
    return
  }
  prepareCards()
})
</script>

<style scoped>
.study-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding: 2rem;
}

.flashcard {
  width: 100%;
  max-width: 500px;
  height: 300px;
  perspective: 1000px;
  cursor: pointer;
}

.flashcard-inner {
  position: relative;
  width: 100%;
  height: 100%;
  text-align: center;
  transition: transform 0.6s;
  transform-style: preserve-3d;
}

.flashcard.is-flipped .flashcard-inner {
  transform: rotateY(180deg);
}

.flashcard-front,
.flashcard-back {
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.flashcard-back {
  transform: rotateY(180deg);
}

.card-content {
  font-size: 2rem;
  padding: 2rem;
}

.navigation {
  display: flex;
  gap: 1rem;
}

.empty-state {
  height: calc(100vh - 60px);
  display: flex;
  align-items: center;
  justify-content: center;
}
</style> 