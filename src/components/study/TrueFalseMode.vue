<template>
  <div class="truefalse-mode">
    <div class="truefalse-card">
      <div class="truefalse-question">
        <div class="word">{{ currentQuestion.word }}</div>
        <div class="translation">{{ currentQuestion.shownTranslation }}</div>
      </div>
      <div class="truefalse-actions">
        <el-button 
          type="success" 
          size="large"
          :icon="Check"
          @click="answerTrueFalse(true)"
          :disabled="hasAnswered"
        >
          Правда
        </el-button>
        <el-button 
          type="danger" 
          size="large"
          :icon="Close"
          @click="answerTrueFalse(false)"
          :disabled="hasAnswered"
        >
          Ложь
        </el-button>
      </div>
      <div v-if="hasAnswered" class="answer-feedback" :class="{ 'correct': isLastAnswerCorrect }">
        <el-icon class="feedback-icon">
          <component :is="isLastAnswerCorrect ? 'Check' : 'Close'" />
        </el-icon>
        <span class="feedback-text">
          {{ isLastAnswerCorrect ? 'Верно!' : 'Неверно!' }}
        </span>
        <div class="correct-answer" v-if="!isLastAnswerCorrect">
          Правильный перевод: {{ currentQuestion.correctTranslation }}
        </div>
      </div>
      <div class="navigation">
        <el-button 
          type="primary"
          @click="nextQuestion"
          :disabled="!hasAnswered || currentQuestionIndex === questions.length - 1"
        >
          Следующий вопрос
        </el-button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { Check, Close } from '@element-plus/icons-vue'

interface Card {
  word: string
  translation: string
  studied: boolean
  correct: boolean
}

interface TrueFalseQuestion {
  word: string
  correctTranslation: string
  shownTranslation: string
  isCorrectPair: boolean
}

const props = defineProps<{
  cards: Card[]
}>()

const emit = defineEmits<{
  (e: 'update:cards', cards: Card[]): void
}>()

const currentQuestionIndex = ref(0)
const hasAnswered = ref(false)
const isLastAnswerCorrect = ref(false)
const questions = ref<TrueFalseQuestion[]>([])

const currentQuestion = computed(() => 
  questions.value[currentQuestionIndex.value]
)

const prepareQuestions = () => {
  const allCards = [...props.cards]
  
  allCards.forEach((card, index) => {
    const isCorrectPair = Math.random() > 0.5
    const otherTranslation = allCards
      .filter((c, i) => i !== index)
      .map(c => c.translation)[Math.floor(Math.random() * (allCards.length - 1))]

    questions.value.push({
      word: card.word,
      correctTranslation: card.translation,
      shownTranslation: isCorrectPair ? card.translation : otherTranslation,
      isCorrectPair
    })
  })

  // Перемешиваем вопросы
  questions.value.sort(() => Math.random() - 0.5)
}

const answerTrueFalse = (answer: boolean) => {
  const question = currentQuestion.value
  isLastAnswerCorrect.value = answer === question.isCorrectPair
  hasAnswered.value = true
  
  // Обновляем статистику карточки
  const updatedCards = [...props.cards]
  const cardIndex = updatedCards.findIndex(card => card.word === question.word)
  if (cardIndex !== -1) {
    updatedCards[cardIndex].studied = true
    updatedCards[cardIndex].correct = isLastAnswerCorrect.value
    emit('update:cards', updatedCards)
  }
}

const nextQuestion = () => {
  if (currentQuestionIndex.value < questions.value.length - 1) {
    currentQuestionIndex.value++
    hasAnswered.value = false
    isLastAnswerCorrect.value = false
  }
}

onMounted(() => {
  prepareQuestions()
})
</script>

<style scoped>
.truefalse-mode {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.truefalse-card {
  background: white;
  border-radius: 12px;
  padding: 2rem;
  box-shadow: 0 2px 12px 0 rgba(0,0,0,.1);
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.truefalse-question {
  text-align: center;
}

.truefalse-question .word {
  font-size: 2rem;
  font-weight: 600;
  margin-bottom: 1rem;
  color: var(--el-text-color-primary);
}

.truefalse-question .translation {
  font-size: 1.5rem;
  color: var(--el-text-color-regular);
}

.truefalse-actions {
  display: flex;
  justify-content: center;
  gap: 1rem;
}

.answer-feedback {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem;
  border-radius: 8px;
  background-color: var(--el-color-danger-light-9);
}

.answer-feedback.correct {
  background-color: var(--el-color-success-light-9);
}

.feedback-icon {
  font-size: 2rem;
}

.feedback-text {
  font-size: 1.25rem;
  font-weight: 600;
}

.correct-answer {
  margin-top: 0.5rem;
  color: var(--el-text-color-secondary);
}

@media (max-width: 768px) {
  .truefalse-card {
    padding: 1rem;
  }

  .truefalse-question .word {
    font-size: 1.5rem;
  }

  .truefalse-question .translation {
    font-size: 1.25rem;
  }

  .truefalse-actions {
    flex-direction: column;
  }
}
</style> 