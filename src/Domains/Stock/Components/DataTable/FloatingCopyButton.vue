<template>
  <div
      v-show="isVisible"
      ref="copyButtonRef"
      class="floating-copy-button"
      title="Нажмите, чтобы скопировать"
      @click="handleClick"
  ></div>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from 'vue';

const props = defineProps({
  tableSelector: {
    type: String,
    default: '.improved-table'
  },
  getHeaderText: {
    type: Function,
    default: (headerIndex) => `Колонка ${headerIndex + 1}`
  }
});

const emit = defineEmits(['copy']);

const copyButtonRef = ref<HTMLElement | null>(null);
const isVisible = ref(false);

// Текущая ячейка и заголовок
let currentCell: HTMLElement | null = null;
let currentHeaderText: string = '';

// Проверка, что ячейка содержит копируемый текст
function isCellCopyable(cell: HTMLElement): boolean {
  const text = cell.textContent?.trim();
  return !!(text && text !== '-' && text !== '');
}

// Обработчик клика
function handleClick() {
  if (currentCell) {
    const text = currentCell.textContent?.trim();
    if (text && text !== '-' && text !== '') {
      emit('copy', { text, header: currentHeaderText });
    }
  }
}

// Обработчик движения мыши
function handleTableMouseMove(event: MouseEvent) {
  const target = event.target as HTMLElement;

  // Находим ближайшую ячейку
  let cell = target;
  while (cell && cell.tagName !== 'TD') {
    cell = cell.parentElement as HTMLElement;
    if (!cell) break;
  }

  // Если мы над ячейкой
  if (cell && cell.tagName === 'TD' && isCellCopyable(cell)) {
    // Получаем заголовок ячейки
    const headerIndex = Array.from(cell.parentElement?.children || []).indexOf(cell);
    currentHeaderText = props.getHeaderText(headerIndex);

    // Позиционируем кнопку копирования
    const rect = cell.getBoundingClientRect();
    if (copyButtonRef.value) {
      copyButtonRef.value.style.top = `${rect.top - 5}px`;
      copyButtonRef.value.style.left = `${rect.right - 30}px`;
    }

    isVisible.value = true;
    currentCell = cell;
  } else {
    // Проверяем, не находимся ли мы над самой кнопкой копирования
    if (copyButtonRef.value) {
      const buttonRect = copyButtonRef.value.getBoundingClientRect();
      const isOverButton =
          event.clientX >= buttonRect.left &&
          event.clientX <= buttonRect.right &&
          event.clientY >= buttonRect.top &&
          event.clientY <= buttonRect.bottom;

      // Скрываем кнопку только если мышь не над кнопкой
      if (!isOverButton) {
        isVisible.value = false;
        currentCell = null;
      }
    } else {
      isVisible.value = false;
      currentCell = null;
    }
  }
}

// Инициализация и привязка обработчиков событий
onMounted(() => {
  // Добавляем кнопку в верхний уровень DOM для правильного z-index
  document.body.appendChild(copyButtonRef.value as HTMLElement);

  // Добавляем обработчик движения мыши для таблицы
  const tableElement = document.querySelector(props.tableSelector);
  if (tableElement) {
    tableElement.addEventListener('mousemove', handleTableMouseMove);
  }
});

// Очистка обработчиков событий
onBeforeUnmount(() => {
  // Удаляем обработчик движения мыши
  const tableElement = document.querySelector(props.tableSelector);
  if (tableElement) {
    tableElement.removeEventListener('mousemove', handleTableMouseMove);
  }

  // Удаляем элемент из DOM
  if (document.body.contains(copyButtonRef.value)) {
    document.body.removeChild(copyButtonRef.value as HTMLElement);
  }
});
</script>

<style lang="sass">
.floating-copy-button
  position: fixed
  width: 24px
  height: 24px
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='white' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect x='9' y='9' width='13' height='13' rx='2' ry='2'%3E%3C/rect%3E%3Cpath d='M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1'%3E%3C/path%3E%3C/svg%3E")
  background-size: 16px
  background-position: center
  background-repeat: no-repeat
  background-color: #1976d2
  border-radius: 50%
  cursor: pointer
  z-index: 35
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2)
  transition: all 0.2s ease

  &:hover
    transform: scale(1.1)
    box-shadow: 0 3px 8px rgba(0, 0, 0, 0.3)

  &:active
    transform: scale(0.95)
</style>