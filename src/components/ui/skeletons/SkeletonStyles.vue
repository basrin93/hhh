<template>
  <!-- Этот компонент только для стилей, никакого контента -->
</template>

<script setup>
// Пустой скрипт, только стили
</script>

<style lang="sass">
// Переменные для скелетона
$skeleton-bg: #f0f0f0
$skeleton-shimmer: #e0e0e0

// Миксин для скелетон-анимации
@mixin skeleton-shimmer
  background: linear-gradient(90deg, $skeleton-bg 25%, $skeleton-shimmer 37%, $skeleton-bg 63%)
  background-size: 400% 100%
  animation: skeleton-loading 1.4s ease-in-out infinite

// Миксин для базового скелетона
@mixin skeleton-base
  @include skeleton-shimmer
  border-radius: 4px
  height: 16px
  min-height: 16px

// Анимация скелетона
@keyframes skeleton-loading
  0%
    background-position: 100% 50%
  100%
    background-position: 0% 50%

// Глобальные стили для скелетонов (можно использовать везде)
.skeleton-loading
  // Отключаем ховер эффекты во время загрузки
  :deep(.v-data-table__tr):hover
    background-color: transparent !important

    td
      background-color: transparent !important

    &::after
      display: none !important

  // Отключаем курсор для скелетон-строк
  :deep(.v-data-table__tr)
    cursor: default
    pointer-events: none

  // Блокируем сортировку во время загрузки
  :deep(.sortable-header)
    cursor: default !important
    pointer-events: none

// ==========================================
// СТИЛИ СКЕЛЕТОНА
// ==========================================

// Базовые скелетон-ячейки
.skeleton-cell
  @include skeleton-base
  width: 100%
  display: inline-block

// Размеры скелетонов
.skeleton-index
  width: 20px
  height: 14px

.skeleton-badge
  width: 80px
  height: 24px
  border-radius: 12px

.skeleton-text-short
  width: 60px
  height: 16px

.skeleton-text-medium
  width: 120px
  height: 16px

.skeleton-text-long
  width: 180px
  height: 16px

// Стили для скелетон-строк
:deep(.skeleton-row)
  cursor: default !important
  pointer-events: none

  &:hover
    background-color: transparent !important

    td
      background-color: transparent !important

  td
    padding: 16px !important

// Анимация появления реальных данных
:deep(.v-data-table__tr):not(.skeleton-row)
  animation: fade-in 0.3s ease-in-out

@keyframes fade-in
  from
    opacity: 0.7
  to
    opacity: 1

// Стили для отключения взаимодействий во время загрузки
.skeleton-loading
  :deep(.v-data-table__tr)
    pointer-events: none !important

  :deep(.v-pagination)
    pointer-events: none !important
    opacity: 0.7
</style>