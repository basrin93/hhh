<template>
  <v-card class="filters-card">
    <v-card-title class="filters-header">
      <span>Фильтры</span>
      <v-chip
          v-if="computedActiveFiltersCount > 0"
          color="primary"
          size="small"
          class="ml-2"
          closable
          @click:close="() => handleResetAll()"
      >
        {{ computedActiveFiltersCount }}
      </v-chip>
    </v-card-title>

    <div class="filters-layout">
      <!-- Вертикальные табы слева -->
      <div class="filters-tabs">
        <div
            v-for="(tab, index) in filterTabs"
            :key="index"
            class="filter-tab"
            :class="{ active: activeTab === index }"
            @click="activeTab = index"
        >
          <v-badge
              v-if="getTabActiveCount(tab.id) > 0"
              :content="getTabActiveCount(tab.id)"
              color="primary"
              dot-color="primary"
              inline
          >
            {{ tab.title }}
          </v-badge>
          <span v-else>{{ tab.title }}</span>
        </div>
      </div>

      <!-- Содержимое фильтров -->
      <v-card-text class="filters-content">
        <!-- Основные фильтры через отдельный компонент -->
        <BasicFilters
            v-show="activeTab === 0"
            :filters="filters"
            @update:filter="handleUpdateFilter"
            @clear-filter="handleClearFilter"
        />
        <!-- Компонент диапазонных фильтров -->
        <RangeFiltersComponent
            v-show="activeTab === 1"
            ref="rangeFiltersRef"
            :filters="filters"
            :is-enabled="isRangeFiltersEnabled"
            @validation-changed="handleRangeValidationChanged"
        />
        <!-- Компонент дополнительных фильтров -->
        <AdditionalFiltersComponent
            v-show="activeTab === 2"
            ref="additionalFiltersRef"
            :filters="filters"
            :is-enabled="isAdditionalFiltersEnabled"
            @validation-changed="handleAdditionalValidationChanged"
            @clear-filter="handleClearFilter"
            @update:filter="(type, value) => $emit('update:filter', type, value)"
        />
      </v-card-text>
    </div>

    <v-divider></v-divider>

    <v-card-actions class="filters-actions">
      <v-btn
          color="grey-lighten-1"
          variant="text"
          @click="() => handleResetAll()"
          :disabled="!computedActiveFiltersCount"
      >
        <v-icon start>mdi-refresh</v-icon>
        Сбросить
      </v-btn>
      <v-spacer />
      <v-btn
          color="primary"
          @click="() => handleApply()"
          :disabled="!hasActiveFilters"
      >
        Применить
        <v-icon end>mdi-check</v-icon>
      </v-btn>
    </v-card-actions>
  </v-card>
</template>
<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {useVehicleFiltersStore} from '@/Domains/Stock/Stores/vehicleFiltersStore';
import {useErrorHandler} from '@/composables/ErrorJobers/useErrorHandler';
import {useFilterInitialization} from '@/composables/Filters/useFilterInitialization';
import {useFeatures} from '@/composables/useFeatures';
import BasicFilters from '@/Domains/Stock/Components/DataTable/modals/filters/components/BasicFilters.vue';
import RangeFilters from '@/Domains/Stock/Components/DataTable/modals/filters/components/RangeFilters.vue';
import AdditionalFilters from '@/Domains/Stock/Components/DataTable/modals/filters/components/AdditionalFilters.vue';

const props = defineProps(['filters', 'activeFiltersCount']);
const emit = defineEmits(['apply', 'reset', 'clear-filter', 'update:filter']);

const store = useVehicleFiltersStore();
const { handleAsync } = useErrorHandler({ logPrefix: '🚗' });
const { initializeFilters } = useFilterInitialization(store, handleAsync);
const { isEnabled, getComponentOrBanner } = useFeatures();

const isRangeFiltersEnabled = isEnabled('RANGE_FILTERS');
const isAdditionalFiltersEnabled = isEnabled('ADDITIONAL_FILTERS');

const RangeFiltersComponent = getComponentOrBanner('RANGE_FILTERS', RangeFilters);
const AdditionalFiltersComponent = getComponentOrBanner('ADDITIONAL_FILTERS', AdditionalFilters);

const rangeFiltersRef = ref(null);
const additionalFiltersRef = ref(null);
const rangeValidationError = ref(false);
const additionalValidationError = ref(false);
const activeTab = ref(0);

// Определение табов фильтров
const filterTabs = [
  { id: 'basic', title: 'Базовые' },
  { id: 'range', title: 'Диапазонные' },
  { id: 'additional', title: 'Дополнительные' }
];

// Получение количества активных фильтров для конкретного таба
const getTabActiveCount = (tabId) => {
  if (tabId === 'basic') {
    let count = 0;

    // Считаем массивы фильтров
    const arrayFilters = ['status', 'vehicleType', 'vehicleKind', 'vehicleSubKind', 'brand', 'model', 'equipment', 'liquidity'];
    count += Object.entries(props.filters || {})
        .filter(([key, value]) => Array.isArray(value) && arrayFilters.includes(key))
        .reduce((sum, [_, arr]) => sum + arr.length, 0);

    // Считаем approved_for_sale только если он не null
    if (props.filters?.approved_for_sale !== null && props.filters?.approved_for_sale !== undefined) {
      count += 1;
    }
    return count;
  } else if (tabId === 'range' && isRangeFiltersEnabled.value && rangeFiltersRef.value) {
    return rangeFiltersRef.value.countActiveRangeFilters();
  } else if (tabId === 'additional' && isAdditionalFiltersEnabled.value && additionalFiltersRef.value) {
    return additionalFiltersRef.value.countActiveFilters();
  }
  return 0;
};

// Обработчики ошибок валидации
const handleRangeValidationChanged = (hasErrors) => {
  rangeValidationError.value = hasErrors;
};

const handleAdditionalValidationChanged = (hasErrors) => {
  additionalValidationError.value = hasErrors;
};

// Обработчики для передачи событий из дочернего компонента родителю
const handleUpdateFilter = (filterType, value) => {
  emit('update:filter', filterType, value);
};

const handleClearFilter = (filterType) => {
  emit('clear-filter', filterType);
};

// Общий флаг состояния валидации
const validationError = computed(() => {
  return rangeValidationError.value || additionalValidationError.value;
});

// Применение фильтров
const handleApply = () => {
  if (validationError.value) return;

  // Применяем фильтры из обоих компонентов
  if (isRangeFiltersEnabled.value && rangeFiltersRef.value) {
    rangeFiltersRef.value.applyRangeFilters();
  }

  if (isAdditionalFiltersEnabled.value && additionalFiltersRef.value) {
    additionalFiltersRef.value.applyAdditionalFilters();
  }

  emit('apply');
};

// Сброс всех фильтров
const handleResetAll = () => {
  if (isRangeFiltersEnabled.value && rangeFiltersRef.value) {
    rangeFiltersRef.value.resetRangeFilters();
    rangeValidationError.value = false;
  }

  if (isAdditionalFiltersEnabled.value && additionalFiltersRef.value) {
    additionalFiltersRef.value.resetAdditionalFilters();
    additionalValidationError.value = false;
  }

  emit('reset');
};

const computedActiveFiltersCount = computed(() => {
  if (!props.filters) return 0;

  let totalCount = 0;

  // Считаем стандартные массивы фильтров
  const arrayFilters = ['status', 'vehicleType', 'vehicleKind', 'vehicleSubKind', 'brand', 'model', 'equipment', 'liquidity'];
  totalCount += Object.entries(props.filters)
      .filter(([key, value]) => Array.isArray(value) && arrayFilters.includes(key))
      .reduce((sum, [_, arr]) => sum + arr.length, 0);

  // Считаем диапазонные фильтры
  if (isRangeFiltersEnabled.value && rangeFiltersRef.value) {
    totalCount += rangeFiltersRef.value.countActiveRangeFilters();
  }

  // Считаем дополнительные фильтры
  if (isAdditionalFiltersEnabled.value && additionalFiltersRef.value) {
    totalCount += additionalFiltersRef.value.countActiveFilters();
  }

  // Считаем region только если он установлен
  if (props.filters.region) {
    totalCount += 1;
  }

  // Считаем approved_for_sale только если он не null (исправлено!)
  if (props.filters.approved_for_sale !== null && props.filters.approved_for_sale !== undefined) {
    totalCount += 1;
  }

  return totalCount || props.activeFiltersCount;
});

// Проверка наличия активных фильтров
const hasActiveFilters = computed(() => {
  if (validationError.value) return false;

  return computedActiveFiltersCount.value > 0;
});

// Отслеживание состояния валидации в компонентах фильтров
watch([() => rangeFiltersRef.value, () => additionalFiltersRef.value],
    ([rangeRef, additionalRef]) => {
      if (rangeRef) {
        rangeValidationError.value = rangeRef.hasValidationErrors || false;
      }
      if (additionalRef) {
        additionalValidationError.value = additionalRef.hasValidationErrors || false;
      }
    },
    { immediate: true, deep: true }
);

// Отключение неактивных табов
watch([isRangeFiltersEnabled, isAdditionalFiltersEnabled], () => {
  // Если выбранный таб недоступен, переключаемся на базовые фильтры
  if ((activeTab.value === 1 && !isRangeFiltersEnabled.value) ||
      (activeTab.value === 2 && !isAdditionalFiltersEnabled.value)) {
    activeTab.value = 0;
  }
});

onMounted(async () => {
  await initializeFilters(props.filters);
});
</script>
<style lang="sass">
@import 'styles/filters'
</style>