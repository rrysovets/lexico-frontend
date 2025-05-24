<template>
  <div class="flashcards-mode">
    <div class="progress-container">
      <div class="progress-bar">
        <div 
          class="progress-fill"
          :class="{ 'is-learning': isLearningMode }"
          :style="{ width: `${progressPercentage}%` }"
        ></div>
      </div>
      <div class="progress-stats">
        <template v-if="isLearningMode">
          <div class="stats-item">
            <span class="stats-value orange">{{ notLearnedCount }}</span>
            Еще изучаю
          </div>
          <div class="progress-text">
            {{ learnedCount }} / {{ totalCards }}
          </div>
          <div class="stats-item">
            <span class="stats-value green">{{ learnedCount }}</span>
            Знаю
          </div>
        </template>
        <template v-else>
          <div class="progress-text">
            {{ currentIndex + 1 }} / {{ totalCards }}
          </div>
        </template>
      </div>
    </div>

    <div 
      class="flashcard"
      :class="{ 'is-flipped': isFlipped }"
      @click="flipCard"
    >
      <div class="flashcard-inner">
        <div class="flashcard-front">
          <div class="card-content">{{ currentCard.word }}</div>
          <div class="hint">
            <el-icon><Monitor /></el-icon>
            Нажмите <kbd>Пробел</kbd> или карточку, чтобы перевернуть её
          </div>
        </div>
        <div class="flashcard-back">
          <div class="card-content">{{ currentCard.translation }}</div>
          <div class="hint">
            <el-icon><Monitor /></el-icon>
            Нажмите <kbd>Пробел</kbd> или карточку, чтобы перевернуть её
          </div>
        </div>
      </div>
    </div>

    <div class="secondary-controls">
      <el-button
        class="secondary-button"
        text
        @click="shuffleCards"
      >
        <ShuffleIcon />
        <span>Перемешать</span>
      </el-button>

      <el-button
        v-if="isLearningMode"
        class="secondary-button"
        text
        :icon="RefreshRight"
        @click="resetProgress"
      >
        Отменить выбор
      </el-button>
    </div>

    <div class="study-controls" v-if="!isLearningMode">
      <div class="navigation-buttons">
        <el-button 
          class="nav-button"
          type="primary" 
          :icon="ArrowLeft"
          @click="previousCard"
          :disabled="currentIndex === 0"
        >
          Предыдущая
        </el-button>

        <el-button 
          class="start-learning-button"
          type="success"
          @click="startLearning"
        >
          Начать заучивание
        </el-button>

        <el-button 
          class="nav-button"
          type="primary" 
          :icon="ArrowRight"
          @click="nextCard"
          :disabled="currentIndex === cards.length - 1"
        >
          Следующая
        </el-button>
      </div>
    </div>

    <div class="learning-controls" v-if="isLearningMode">
      <div class="answer-buttons">
        <el-button 
          type="danger" 
          :icon="Close"
          @click="handleAnswer(false)"
        >
          Еще изучаю
        </el-button>
        <el-button 
          type="success" 
          :icon="Check"
          @click="handleAnswer(true)"
        >
          Знаю
        </el-button>
      </div>
      <el-button 
        class="return-button"
        text
        @click="returnToViewing"
      >
        Вернуться к просмотру
      </el-button>
    </div>

    <div class="finish-button">
      <el-button 
        type="warning"
        @click="$emit('finish')"
      >
        Завершить изучение
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { ArrowLeft, ArrowRight, Check, Close, Monitor, RefreshRight } from '@element-plus/icons-vue'
import { h } from 'vue'

const ShuffleIcon = () => h('svg', {
  viewBox: '0 0 24 24',
  fill: 'currentColor',
  class: 'shuffle-icon'
}, [
  h('path', {
    d: 'M7.5 3L3 7.5M3 7.5L7.5 12M3 7.5H16.5M16.5 12L21 16.5M21 16.5L16.5 21M21 16.5H7.5',
    stroke: 'currentColor',
    'stroke-width': '2',
    'stroke-linecap': 'round',
    'stroke-linejoin': 'round',
    fill: 'none'
  })
])

interface Card {
  word: string
  translation: string
  studied: boolean
  correct: boolean
}

const props = defineProps<{
  cards: Card[]
}>()

const emit = defineEmits<{
  (e: 'update:cards', cards: Card[]): void
  (e: 'finish'): void
}>()

const isFlipped = ref(false)
const currentIndex = ref(0)
const isLearningMode = ref(false)

// Отфильтрованные карточки для режима заучивания
const learningCards = computed(() => {
  if (!isLearningMode.value) {
    return props.cards
  }
  return props.cards.filter(card => !card.correct)
})

const currentCard = computed(() => {
  const cards = learningCards.value
  return cards[currentIndex.value] || props.cards[0]
})

const learnedCount = computed(() => props.cards.filter(card => card.correct).length)
const notLearnedCount = computed(() => props.cards.filter(card => !card.correct).length)
const totalCards = computed(() => props.cards.length)

// Прогресс показываем от общего количества карточек
const progressPercentage = computed(() => {
  if (isLearningMode.value) {
    return (learnedCount.value / totalCards.value) * 100
  }
  return ((currentIndex.value + 1) / totalCards.value) * 100
})

const flipCard = () => {
  isFlipped.value = !isFlipped.value
  if (!props.cards[currentIndex.value].studied) {
    const updatedCards = [...props.cards]
    updatedCards[currentIndex.value].studied = true
    emit('update:cards', updatedCards)
  }
}

const nextCard = () => {
  const cards = learningCards.value
  if (currentIndex.value < cards.length - 1) {
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

const startLearning = () => {
  isLearningMode.value = true
  currentIndex.value = 0
  isFlipped.value = false
}

const resetProgress = () => {
  const updatedCards = props.cards.map(card => ({
    ...card,
    correct: false
  }))
  emit('update:cards', updatedCards)
  // Возвращаемся к первой карточке
  currentIndex.value = 0
  isFlipped.value = false
}

const handleAnswer = (isCorrect: boolean) => {
  const updatedCards = [...props.cards]
  const currentCardIndex = updatedCards.findIndex(
    card => card.word === currentCard.value.word
  )
  
  if (currentCardIndex !== -1) {
    updatedCards[currentCardIndex].correct = isCorrect
    emit('update:cards', updatedCards)
  }

  // Если остались неизученные карточки, показываем следующую
  if (notLearnedCount.value > (isCorrect ? 1 : 0)) {
    isFlipped.value = false
    // Если это была последняя карточка в текущем наборе, начинаем сначала
    if (currentIndex.value >= learningCards.value.length - 1) {
      currentIndex.value = 0
    } else {
      currentIndex.value++
    }
  } else {
    // Если все карточки изучены, предлагаем закончить
    emit('finish')
  }
}

const handleKeyPress = (event: KeyboardEvent) => {
  if (event.code === 'Space' || event.key === ' ') {
    event.preventDefault()
    flipCard()
  } else if (!isLearningMode.value && (event.code === 'ArrowRight' || event.code === 'ArrowLeft')) {
    event.preventDefault()
    if (event.code === 'ArrowRight') {
      nextCard()
    } else {
      previousCard()
    }
  }
}

const shuffleCards = () => {
  const updatedCards = [...props.cards]
  for (let i = updatedCards.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [updatedCards[i], updatedCards[j]] = [updatedCards[j], updatedCards[i]]
  }
  emit('update:cards', updatedCards)
  currentIndex.value = 0
  isFlipped.value = false
}

const returnToViewing = () => {
  isLearningMode.value = false
  isFlipped.value = false
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyPress)
})

onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyPress)
})
</script>

<style scoped>
.flashcards-mode {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  padding-top: 1rem;
}

.progress-container {
  width: 100%;
  max-width: 500px;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.progress-bar {
  width: 100%;
  height: 4px;
  background: var(--el-fill-color-light);
  border-radius: 2px;
  overflow: hidden;
}

.progress-fill {
  height: 100%;
  background: var(--el-color-primary);
  transition: width 0.3s ease;
}

.progress-fill.is-learning {
  background: var(--el-color-success);
}

.progress-stats {
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.875rem;
  color: var(--el-text-color-secondary);
}

.progress-text {
  flex: 1;
  text-align: center;
}

.stats-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.stats-value {
  font-weight: 600;
}

.stats-value.orange {
  color: var(--el-color-danger);
}

.stats-value.green {
  color: var(--el-color-success);
}

.study-controls,
.learning-controls {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
}

.answer-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
}

.answer-buttons .el-button {
  flex: 1;
}

.hint {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  margin-top: auto;
}

kbd {
  background: var(--el-fill-color-light);
  padding: 0.125rem 0.375rem;
  border-radius: 4px;
  font-family: monospace;
}

.cancel-button {
  color: var(--el-text-color-secondary);
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
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 2rem;
  border-radius: 8px;
  background-color: white;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
}

.flashcard-back {
  transform: rotateY(180deg);
}

.card-content {
  font-size: 2rem;
  flex-grow: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.finish-button {
  margin-top: 1rem;
}

.navigation-buttons {
  display: flex;
  gap: 1rem;
  width: 100%;
  max-width: 500px;
  justify-content: center;
}

.nav-button {
  min-width: 130px;
}

.start-learning-button {
  min-width: 160px;
}

.controls-top {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
}

.shuffle-button {
  font-size: 0.875rem;
}

.secondary-controls {
  width: 100%;
  max-width: 500px;
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-bottom: 1rem;
}

.secondary-button {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
}

.shuffle-icon {
  width: 1em;
  height: 1em;
}

.secondary-button:hover {
  color: var(--el-color-primary);
}

.return-button {
  color: var(--el-text-color-secondary);
  font-size: 0.875rem;
  margin-top: 1rem;
}

.return-button:hover {
  color: var(--el-color-primary);
}

@media (max-width: 768px) {
  .card-content {
    font-size: 1.5rem;
  }

  .flashcard-front,
  .flashcard-back {
    padding: 1.5rem;
  }

  .hint {
    font-size: 0.75rem;
  }

  .navigation-buttons {
    flex-direction: column;
  }

  .nav-button,
  .start-learning-button {
    width: 100%;
  }
}
</style> 