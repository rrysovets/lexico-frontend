<template>
  <div class="table-container">
    <table class="word-table">
      <thead>
        <tr>
          <th>Слово</th>
          <th>Перевод</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(pair, index) in wordPairs" :key="index">
          <td>{{ pair.word }}</td>
          <td>{{ pair.translation }}</td>
        </tr>
        <tr v-if="wordPairs.length === 0">
          <td colspan="2" class="empty-text">Словарь пст</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script setup lang="ts">
interface WordPair {
  word: string
  translation: string
}

defineProps<{
  wordPairs: WordPair[]
}>()
</script>

<style scoped>
.table-container {
  padding: 24px;
  overflow-x: auto;
}

.word-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 14px;
}

.word-table th {
  text-align: left;
  padding: 16px;
  color: #5f6368;
  font-weight: 500;
  border-bottom: 1px solid #dadce0;
  white-space: nowrap;
}

.word-table td {
  padding: 16px;
  color: #202124;
  border-bottom: 1px solid #dadce0;
}

.word-table tr:last-child td {
  border-bottom: none;
}

.word-table tr:hover {
  background-color: #f8f9fa;
}

.empty-text {
  text-align: center;
  color: #5f6368;
  padding: 32px !important;
}
</style> 