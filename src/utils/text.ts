export function getDictionaryCountLabel(count: number): string {
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