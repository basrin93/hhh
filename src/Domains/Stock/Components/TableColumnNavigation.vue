<template>
  <div class="chips">
    <v-chip
        v-for="header in navigationHeaders"
        :key="header.value"
        class="mr-2 mb-2"
        :variant="activeColumn === header.value ? 'elevated' : 'outlined'"
        :class="{ 'active-chip': activeColumn === header.value }"
        color="primary"
        @click="scrollToColumn(header.value)"
    >
      {{ header.text }}
      <v-icon
          v-if="activeColumn === header.value"
          class="ml-1"
          size="small"
      >
        mdi-check-circle
      </v-icon>
    </v-chip>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, nextTick, onMounted, onBeforeUnmount } from 'vue';
import type { Header } from '@/types';
import { localStorageUtils } from '@/utils/localStorage';

interface Props {
  headers: Header[];
}

const STORAGE_KEY = 'table-scroll-position';
const ACTIVE_COLUMN_KEY = 'active-column';

const props = defineProps<Props>();
const activeColumn = ref<string | null>(null);
const tableWrapper = ref<Element | null>(null);

const navigationHeaders = computed(() => {
  const allowedColumns = [
    'equipment.engine_power_kw',
    'equipment.mover_type.name',
    'leasing_contract.supplier.inn'
  ];

  return props.headers.filter(header =>
      header.visible && allowedColumns.includes(header.value)
  );
});

// Сохраняем позицию скролла при скролле
const handleScroll = () => {
  if (tableWrapper.value) {
    localStorageUtils.saveData(STORAGE_KEY, tableWrapper.value.scrollLeft);
  }
};

const scrollToColumn = async (columnValue: string) => {
  activeColumn.value = columnValue;
  // Сохраняем активную колонку
  localStorageUtils.saveData(ACTIVE_COLUMN_KEY, columnValue);

  await nextTick();

  tableWrapper.value = document.querySelector('.v-data-table__wrapper');
  const headers = document.querySelectorAll('th');
  let targetHeader: Element | null = null;

  headers.forEach((header) => {
    if (header.textContent?.includes(navigationHeaders.value.find(h => h.value === columnValue)?.text || '')) {
      targetHeader = header;
    }
  });

  if (!tableWrapper.value || !targetHeader) {
    console.log('Элементы не найдены:', { tableWrapper: tableWrapper.value, targetHeader });
    return;
  }

  const firstColumn = headers[0];
  const secondColumn = headers[1];

  const firstColumnWidth = firstColumn ? firstColumn.offsetWidth : 0;
  const secondColumnWidth = secondColumn ? secondColumn.offsetWidth : 0;
  const totalStickyWidth = firstColumnWidth + secondColumnWidth;

  const headerRect = targetHeader.getBoundingClientRect();
  const tableRect = tableWrapper.value.getBoundingClientRect();
  const wrapperScrollLeft = tableWrapper.value.scrollLeft;

  const isFixedColumn = columnValue === 'index' || columnValue === 'status.name';

  if (isFixedColumn) {
    tableWrapper.value.scrollLeft = 0;
    return;
  }

  const isLastColumn = targetHeader === headers[headers.length - 1];

  let scrollPosition;
  if (isLastColumn) {
    const maxScroll = tableWrapper.value.scrollWidth - tableWrapper.value.clientWidth;
    scrollPosition = Math.min(
        (headerRect.left - tableRect.left) + wrapperScrollLeft - totalStickyWidth,
        maxScroll
    );
  } else {
    scrollPosition = (headerRect.left - tableRect.left) + wrapperScrollLeft - totalStickyWidth;
  }

  tableWrapper.value.scrollTo({
    left: Math.max(0, scrollPosition),
    behavior: 'smooth'
  });
};

// Восстанавливаем состояние при монтировании
onMounted(async () => {
  tableWrapper.value = document.querySelector('.v-data-table__wrapper');

  if (tableWrapper.value) {
    // Восстанавливаем позицию скролла
    const savedScrollPosition = localStorageUtils.getData(STORAGE_KEY);
    if (savedScrollPosition !== null) {
      tableWrapper.value.scrollLeft = savedScrollPosition;
    }

    // Восстанавливаем активную колонку
    const savedActiveColumn = localStorageUtils.getData(ACTIVE_COLUMN_KEY);
    if (savedActiveColumn && navigationHeaders.value.some(h => h.value === savedActiveColumn)) {
      activeColumn.value = savedActiveColumn;
    }

    // Добавляем слушатель скролла
    tableWrapper.value.addEventListener('scroll', handleScroll);
  }
});

// Очищаем слушатель при размонтировании
onBeforeUnmount(() => {
  if (tableWrapper.value) {
    tableWrapper.value.removeEventListener('scroll', handleScroll);
  }
});
</script>

<style scoped lang="sass">
.chips
  padding-left: 16px

:deep(.v-chip)
  margin: 0
  border: 2px solid transparent

  &.active-chip
    background-color: $alfa_primary-blue
    color: white
    border: 2px solid $alfa_primary-blue
    font-weight: 600

  .v-chip__content
    font-weight: 500
    font-size: 13px
</style>