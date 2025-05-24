<template>
  <div class="dictionary-section">
    <div class="section-header">
      <h3>Словарь</h3>
      <div class="dictionary-stats">
        <span>{{ wordPairs.length }} {{ getDictionaryCountLabel(wordPairs.length) }}</span>
      </div>
    </div>

    <div class="dictionary-container">
      <div ref="dictionaryListRef" class="dictionary-list">
        <div v-for="(pair, index) in wordPairs" :key="index" class="dictionary-item">
          <span class="item-number">{{ index + 1 }}</span>
          <el-input
            v-model="pair.key"
            class="word-input"
            placeholder="Слово"
            @input="emitUpdate"
          />
          <span class="separator">—</span>
          <el-input
            v-model="pair.value"
            class="translation-input"
            placeholder="Перевод"
            @input="emitUpdate"
          />
          <el-button
            class="remove-button"
            :class="{ 'single-item': wordPairs.length === 1 }"
            :disabled="wordPairs.length === 1"
            @click="removePair(index)"
          >
            <el-icon><Delete /></el-icon>
          </el-button>
        </div>
      </div>

      <el-button class="add-pair-button" @click="addPair">
        <el-icon><Plus /></el-icon>
        Добавить слово
      </el-button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { Delete, Plus } from '@element-plus/icons-vue'

interface WordPair {
  key: string
  value: string
}

const props = defineProps<{
  modelValue: Record<string, string>
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: Record<string, string>): void
}>()

const dictionaryListRef = ref<HTMLElement | null>(null)

const wordPairs = ref<WordPair[]>([])

// Инициализация пар слов из входящего значения
watch(() => props.modelValue, (newValue) => {
  if (Object.keys(newValue).length === 0) {
    wordPairs.value = [{ key: '', value: '' }]
  } else {
    wordPairs.value = Object.entries(newValue).map(([key, value]) => ({ key, value }))
  }
}, { immediate: true })

function addPair() {
  wordPairs.value.push({ key: '', value: '' })
  scrollToBottom()
}

function removePair(index: number) {
  if (wordPairs.value.length <= 1) return
  wordPairs.value.splice(index, 1)
  emitUpdate()
}

function scrollToBottom() {
  setTimeout(() => {
    if (dictionaryListRef.value) {
      const container = dictionaryListRef.value
      const lastItem = container.lastElementChild
      if (lastItem) {
        lastItem.scrollIntoView({ behavior: 'smooth', block: 'end' })
      }
    }
  }, 100)
}

function emitUpdate() {
  const dictionary = wordPairs.value.reduce((acc, pair) => {
    if (pair.key && pair.value) {
      acc[pair.key] = pair.value
    }
    return acc
  }, {} as Record<string, string>)
  
  emit('update:modelValue', dictionary)
}

function getDictionaryCountLabel(count: number): string {
  const lastDigit = count % 10
  const lastTwoDigits = count % 100

  if (lastTwoDigits >= 11 && lastTwoDigits <= 19) {
    return 'слов'
  }

  if (lastDigit === 1) {
    return 'слово'
  }

  if (lastDigit >= 2 && lastDigit <= 4) {
    return 'слова'
  }

  return 'слов'
}
</script>

<style scoped>
.dictionary-section {
  background-color: var(--md-sys-color-surface);
  border-radius: var(--border-radius-xl);
  padding: var(--spacing-lg);
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--spacing-lg);
}

.section-header h3 {
  font-size: 20px;
  font-weight: 500;
  color: var(--md-sys-color-on-primary-container);
  margin: 0;
}

.dictionary-list {
  max-height: 400px;
  overflow-y: auto;
  margin-bottom: var(--spacing-6);
  padding-right: var(--spacing-4);
  scroll-behavior: smooth;
}

.dictionary-item {
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-4);
  background-color: var(--color-secondary-50);
  border-radius: var(--border-radius-lg);
  margin-bottom: var(--spacing-2);
  transition: var(--transition-all);
  border: 1px solid var(--color-secondary-200);
}

.dictionary-item:hover {
  transform: translateY(-2px);
  box-shadow: var(--shadow-md);
  border-color: var(--color-primary-200);
}

.item-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  border-radius: var(--border-radius-full);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
}

.word-input,
.translation-input {
  flex: 1;
}

.word-input :deep(.el-input__wrapper),
.translation-input :deep(.el-input__wrapper) {
  border-radius: var(--border-radius-md);
  transition: var(--transition-all);
  background-color: white;
  border: 1px solid var(--color-secondary-200);
  box-shadow: none !important;
}

.word-input :deep(.el-input__wrapper:hover),
.translation-input :deep(.el-input__wrapper:hover) {
  border-color: var(--color-primary-300);
}

.word-input :deep(.el-input__wrapper:focus-within),
.translation-input :deep(.el-input__wrapper:focus-within) {
  border-color: var(--color-primary-500);
  box-shadow: var(--shadow-sm) !important;
}

.separator {
  color: var(--color-secondary-400);
  font-weight: var(--font-weight-medium);
}

.remove-button {
  background-color: var(--color-error-50);
  color: var(--color-error-500);
  border: none;
  border-radius: var(--border-radius-full);
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: var(--transition-all);
  cursor: pointer;
}

.remove-button:hover:not(:disabled) {
  background-color: var(--color-error-500);
  color: white;
  transform: scale(1.1);
}

.remove-button.single-item {
  opacity: 0.5;
  cursor: not-allowed;
  background-color: var(--color-secondary-100);
  color: var(--color-secondary-500);
}

.add-pair-button {
  width: 100%;
  height: 48px;
  border-radius: var(--border-radius-lg);
  background-color: var(--color-primary-50);
  color: var(--color-primary-700);
  font-size: var(--font-size-base);
  font-weight: var(--font-weight-medium);
  border: 1px dashed var(--color-primary-200);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: var(--spacing-2);
  transition: var(--transition-all);
  cursor: pointer;
}

.add-pair-button:hover {
  transform: translateY(-1px);
  background-color: var(--color-primary-100);
  border-color: var(--color-primary-300);
}

.add-pair-button:active {
  transform: translateY(0);
}

/* Скроллбар */
.dictionary-list::-webkit-scrollbar {
  width: 8px;
  height: 8px;
}

.dictionary-list::-webkit-scrollbar-track {
  background-color: var(--color-secondary-100);
  border-radius: var(--border-radius-full);
}

.dictionary-list::-webkit-scrollbar-thumb {
  background-color: var(--color-secondary-300);
  border-radius: var(--border-radius-full);
  border: 2px solid var(--color-secondary-100);
}

.dictionary-list::-webkit-scrollbar-thumb:hover {
  background-color: var(--color-primary-300);
}
</style> 