<template>
  <div class="relative">
    <EditModePanel
        v-if="isEditMode"
        :selected-items="selectedItems"
        :selected-statuses="getSelectedStatuses"
        :headers="headers"
        @cancel="cancelEditing"
        @save="handleSave"
    />

    <div class="table-wrapper" :class="{'edit-mode': isEditMode}">
      <v-data-table
          ref="dataTable"
          :headers="visibleHeadersWithIndex"
          :items="displayItems"
          :page="page"
          :items-per-page="itemsPerPage"
          :loading="false"
          class="elevation-1 scrollable-table improved-table"
          :class="{'table-edit-mode': isEditMode, 'skeleton-loading': shouldShowSkeleton}"
          item-key="uid"
          :footer-props="customFooterProps"
          @click:row="handleRowClick"
          @page-count="handlePageCountChange"
          @update:page="handlePageChange"
          @update:items-per-page="handleItemsPerPageChange"
          hover
          :sort-by="[]"
          :sort-desc="[]"
          show-select
          v-model="selectedItems"
      >
        <template #item.index="{ index, item }">
          <div v-if="item._skeleton" class="skeleton-cell skeleton-index"></div>
          <span v-else>{{ calculateItemIndex(index) }}</span>
        </template>

        <template #item.status.name="{ item }">
          <div v-if="item._skeleton" class="skeleton-cell skeleton-badge"></div>
          <StatusBadge v-else :label="item.status.name"/>
        </template>

        <template #[`item.vin`]="{ item }">
          <div v-if="item._skeleton" class="skeleton-cell skeleton-text-long"></div>
          <span v-else v-html="highlightCell(item.vin)"></span>
        </template>

        <template #[`item.lot_number`]="{ item }">
          <div v-if="item._skeleton" class="skeleton-cell skeleton-text-short"></div>
          <span v-else v-html="highlightCell(item.lot_number)"></span>
        </template>

        <template #[`item.state_number`]="{ item }">
          <div v-if="item._skeleton" class="skeleton-cell skeleton-text-medium"></div>
          <span v-else v-html="highlightCell(item.state_number)"></span>
        </template>

        <template #[`item.leasing_contract.leasing_contract_number`]="{ item }">
          <div v-if="item._skeleton" class="skeleton-cell skeleton-text-long"></div>
          <span v-else v-html="highlightCell(getNestedValue(item, 'leasing_contract.leasing_contract_number'))"></span>
        </template>

        <!-- Универсальный скелетон для остальных полей -->
        <template v-for="header in skeletonHeaders" #[`item.${header.value}`]="{ item }">
          <div v-if="item._skeleton" class="skeleton-cell" :class="getSkeletonClass(header.value)"></div>
          <span v-else>{{ getNestedValue(item, header.value) }}</span>
        </template>
      </v-data-table>
    </div>

    <div class="text-center pt-2 d-flex align-center justify-center">
      <v-pagination
          v-model="page"
          :length="pageCount"
          :total-visible="7"
          :disabled="shouldShowSkeleton"
      ></v-pagination>
    </div>

    <FloatingCopyButton
        :table-selector="'.improved-table'"
        :get-header-text="getHeaderTextByIndex"
        @copy="handleCopy"
    />

    <v-snackbar
        v-model="showSnackbar"
        :timeout="2000"
        color="success"
        location="top"
    >
      {{ snackbarText }}
    </v-snackbar>

    <SkeletonStyles />
  </div>
</template>

<script setup lang="ts">
import StatusBadge from '../StatusBadge.vue';
import FloatingCopyButton from '@/Domains/Stock/Components/DataTable/FloatingCopyButton.vue';
import EditModePanel from '@/Domains/Stock/Components/DataTable/MassEditComponents/Main/EditModePanel.vue';
import SkeletonStyles from '@/components/ui/skeletons/SkeletonStyles.vue';

import {computed, onBeforeUnmount, onMounted, ref, watch} from 'vue';
import {Header, Item} from '@/types';
import {getNestedValue, highlightText} from '@/utils/highlight';
import {getStatusCodeByName} from '@/constants/statusMappings';
import {NON_SORTABLE_COLUMNS} from '@/Domains/Stock/Constants/NonSortable';
import {usePagination} from '@/Domains/Stock/Composables/table/usePagination';
import {useCopyToClipboard} from '@/Domains/Stock/Composables/table/useCopyToClipboard';
import {useTableRowClick} from '@/composables/useTableRowClick';
import {useProgressiveSkeleton} from '@/components/ui/skeletons/useProgressiveSkeleton';

interface FooterProps {
  itemsPerPageOptions: number[];
  itemsPerPageText: string;
}

interface DataTableProps {
  headers: Header[];
  items: Item[];
  footerProps: FooterProps;
  search: string;
  totalCount: number;
  loading: boolean;
  sortBy: string[];
  sortDesc: boolean[];
  isEditMode?: boolean;
  searchLoading?: boolean;
}

interface SelectedItemStatus {
  uid: string;
  status: string | null;
  statusCode: string | null;
}

interface SortOrder {
  index: number;
  direction: 'asc' | 'desc';
}

const emit = defineEmits(['update:page', 'update:items-per-page', 'update:sort', 'save', 'cancel']);
const props = withDefaults(defineProps<DataTableProps>(), {
  isEditMode: false,
  searchLoading: false
});

const dataTable = ref(null);
let observer: MutationObserver | null = null;

const selectedItems = ref<Item[]>([]);

// Флаг для показа скелетонов
const shouldShowSkeleton = computed(() => {
  return props.loading || props.searchLoading;
});

const {
  page,
  pageCount,
  itemsPerPage,
  isRecalculating,
  currentPage,
  currentItemsPerPage,
  calculateItemIndex,
  handlePageChange,
  handleItemsPerPageChange,
  handlePageCountChange
} = usePagination({
  totalCount: computed(() => props.totalCount),
  onPageChange: (page) => emit('update:page', page),
  onItemsPerPageChange: (itemsPerPage) => emit('update:items-per-page', itemsPerPage)
});


const { displayItems, getSkeletonClass } = useProgressiveSkeleton(
    computed(() => props.items),
    itemsPerPage,
    shouldShowSkeleton,
    computed(() => props.headers)
);

const skeletonHeaders = computed(() => {
  const processedFields = ['index', 'status.name', 'vin', 'lot_number', 'state_number', 'leasing_contract.leasing_contract_number'];
  return props.headers?.filter(header =>
      header.visible && !processedFields.includes(header.value)
  ) || [];
});

const getSelectedStatuses = computed<SelectedItemStatus[]>(() => {
  return selectedItems.value
      .filter(item => !item._skeleton) // Исключаем скелетоны из выбора
      .map(item => {
        const statusName = item.status?.name || null;
        return {
          uid: item.uid,
          status: statusName,
          statusCode: statusName ? getStatusCodeByName(statusName) : item.status?.code || null
        };
      });
});

watch(() => props.isEditMode, (newValue) => {
  if (!newValue) {
    selectedItems.value = [];
  }

  setTimeout(() => {
    setupSortingHandlers();
    updateSortIndicators();
  }, 100);
});

async function handleSave() {
  emit('save', getSelectedStatuses.value);
  selectedItems.value = [];
}

function cancelEditing() {
  emit('cancel');
}

const itemsRangeText = computed(() => {
  const start = (page.value - 1) * itemsPerPage.value + 1;
  const potentialEnd = start + itemsPerPage.value - 1;
  const end = Math.min(potentialEnd, props.totalCount);
  return `${start}-${end} из ${props.totalCount}`;
});

const { showSnackbar, snackbarText, copyToClipboard } = useCopyToClipboard();
const { handleRowClick: baseHandleRowClick } = useTableRowClick();

function handleRowClick(event: Event, row: any) {
  // Блокируем клики во время загрузки
  if (row.item._skeleton || shouldShowSkeleton.value) return;

  if (!props.isEditMode) {
    baseHandleRowClick(event, row);
  }
}

const visibleHeadersWithIndex = computed(() => {
  const headersList = [
    { text: '№', value: 'index', sortable: false, width: '50px' }
  ];

  if (props.headers) {
    const filteredHeaders = props.headers
        .filter(header => header.visible)
        .map(header => {
          const isColumnSortable = !NON_SORTABLE_COLUMNS.includes(header.value);
          return {
            ...header,
            sortable: isColumnSortable
          };
        });

    headersList.push(...filteredHeaders);
  }

  return headersList;
});

const customFooterProps = computed(() => ({
  ...props.footerProps,
  itemsPerPage: itemsPerPage.value,
  pageCount: pageCount.value,
  itemsPerPageText: props.footerProps.itemsPerPageText,
  itemsLength: props.totalCount,
  pageText: itemsRangeText.value
}));

function highlightCell(text: any): string {
  return highlightText(text, { searchValue: props.search });
}

function getHeaderTextByIndex(index: number): string {
  const adjustedIndex = index;

  return (adjustedIndex > 0 && adjustedIndex < visibleHeadersWithIndex.value.length + 1)
      ? visibleHeadersWithIndex.value[adjustedIndex - 1].text
      : 'Значение';
}

function handleCopy({ text, header }) {
  copyToClipboard(text, header || 'Значение');
}

function getSortOrder(column: string): SortOrder | null {
  const index = props.sortBy.indexOf(column);
  if (index === -1) return null;

  return {
    index: index + 1,
    direction: props.sortDesc[index] ? 'desc' : 'asc'
  };
}

function updateSortIndicators() {
  const headers = document.querySelectorAll('.improved-table th');

  headers.forEach((header, index) => {
    // Пропускаем checkbox и индекс
    if (index <= 1) return;

    // Правильный расчет индекса для заголовков
    const headerIndex = index - 2; // Вычитаем 2 (checkbox + index)
    const headerData = visibleHeadersWithIndex.value[headerIndex + 1]; // +1 так как в visibleHeadersWithIndex первый элемент - это index

    if (!headerData) return;

    const column = headerData.value;
    const sortable = headerData.sortable;

    if (!column || !sortable) {
      header.querySelectorAll('.sort-indicator, .sort-hint').forEach(el => el.remove());
      header.classList.remove('sortable-header', 'active-sort', 'inactive-sort');
      return;
    }

    header.querySelectorAll('.sort-indicator, .sort-hint').forEach(el => el.remove());

    const sortOrder = getSortOrder(column);

    if (sortOrder) {
      const indicator = document.createElement('span');
      indicator.className = 'sort-indicator';

      indicator.textContent = sortOrder.direction === 'asc' ? '↓' : '↑';

      if (props.sortBy.length > 1) {
        indicator.textContent += ` ${sortOrder.index}`;
      }

      header.appendChild(indicator);
      header.classList.add('active-sort');
      header.classList.remove('inactive-sort');
    } else {
      header.classList.remove('active-sort');
      header.classList.add('inactive-sort');

      const hint = document.createElement('span');
      hint.className = 'sort-hint';
      hint.textContent = '↕';
      header.appendChild(hint);
    }
  });
}

function setupSortingHandlers() {
  const headers = document.querySelectorAll('.improved-table th');

  headers.forEach((header, index) => {
    // Пропускаем checkbox и индекс
    if (index <= 1) return;

    // Правильный расчет индекса для заголовков
    const headerIndex = index - 2; // Вычитаем 2 (checkbox + index)
    const headerData = visibleHeadersWithIndex.value[headerIndex + 1]; // +1 так как в visibleHeadersWithIndex первый элемент - это index

    if (!headerData) return;

    const column = headerData.value;
    const sortable = headerData.sortable;

    if (!sortable) {
      header.classList.remove('sortable-header', 'active-sort', 'inactive-sort');
      header.querySelectorAll('.sort-indicator, .sort-hint').forEach(el => el.remove());
      return;
    }

    header.classList.add('sortable-header');

    const newHeader = header.cloneNode(true);
    header.parentNode?.replaceChild(newHeader, header);

    newHeader.addEventListener('click', (event) => {
      if (props.isEditMode || shouldShowSkeleton.value) return;

      const columnIndex = props.sortBy.indexOf(column);

      if (columnIndex === -1) {
        emit('update:sort', { column, desc: false });
      } else if (!props.sortDesc[columnIndex]) {
        emit('update:sort', { column, desc: true });
      } else {
        emit('update:sort', { column, desc: true });
      }
    });
  });
}


onMounted(() => {
  currentPage.value = page.value;
  currentItemsPerPage.value = itemsPerPage.value;

  setTimeout(() => {
    setupSortingHandlers();
    updateSortIndicators();

    observer = new MutationObserver(() => {
      setTimeout(updateSortIndicators, 10);
    });

    const table = document.querySelector('.improved-table');
    if (table) {
      observer.observe(table, {
        attributes: true,
        childList: true,
        subtree: true
      });
    }
  }, 200);
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
});
</script>

<style lang="sass" scoped>
@import "styles/DataTable"
</style>