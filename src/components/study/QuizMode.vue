<template>
  <div class="quiz-mode">
    <h3>Режим тестирования</h3>
    <p>В разработке...</p>
  </div>
</template>

<script setup lang="ts">
interface Card {
  word: string
  translation: string
  studied: boolean
  correct: boolean
}

defineProps<{
  cards: Card[]
}>()

defineEmits<{
  (e: 'update:cards', cards: Card[]): void
}>()
</script>

<style scoped>
.quiz-mode {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
</style> 