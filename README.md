# lexico

Современное веб-приложение для изучения слов и терминов. Разработано с использованием Vue 3, Element Plus и современных веб-технологий.

## Возможности

- 📚 Создание и управление учебными модулями
- 🌍 Публичные и приватные модули
- 🔍 Умный поиск по модулям
- ⭐ Система рейтинга и избранного
- 🤖 AI-генерация словарей по темам
- 📱 Адаптивный дизайн

## Технологии

- Vue 3 + TypeScript
- Element Plus UI Framework
- Vite
- Pinia для управления состоянием
- Vue Router для навигации

## Установка

```bash
# Клонирование репозитория
git clone https://github.com/your-username/lexico.git

# Переход в директорию проекта
cd lexico/frontend

# Установка зависимостей
npm install

# Запуск в режиме разработки
npm run dev

# Сборка для продакшена
npm run build
```

## Структура проекта

```
frontend/
├── src/
│   ├── assets/         # Статические ресурсы
│   ├── components/     # Vue компоненты
│   ├── router/         # Конфигурация маршрутизации
│   ├── stores/         # Хранилища Pinia
│   ├── types/          # TypeScript типы
│   └── views/          # Компоненты страниц
├── public/             # Публичные файлы
└── index.html          # Входная точка HTML
```

## Разработка

### Рекомендуемые IDE настройки

- [VS Code](https://code.visualstudio.com/) + [Volar](https://marketplace.visualstudio.com/items?itemName=Vue.volar)

### Форматирование кода

Проект использует ESLint и Prettier для поддержания единого стиля кода. Запустите форматирование:

```bash
# Проверка стиля кода
npm run lint

# Автоматическое исправление
npm run lint:fix
```

## Лицензия

[MIT](LICENSE) 
