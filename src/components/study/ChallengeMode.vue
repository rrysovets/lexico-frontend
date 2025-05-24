<template>
  <div class="challenge-mode">
    <h3>Режим испытания</h3>
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
.challenge-mode {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
}
</style> 