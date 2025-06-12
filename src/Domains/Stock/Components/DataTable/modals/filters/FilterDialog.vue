<template>
  <v-menu
      v-model="dialog"
      location="bottom end"
      :close-on-content-click="false"
      min-width="990"
      transition="scroll-y-transition"
      activator="#filters-trigger"
      @update:model-value="handleMenuOpen"
      style="z-index: 1000"
  >
    <v-card v-if="isLoading" class="pa-4">
      <v-progress-circular indeterminate />
    </v-card>

    <filter-content
        v-else
        :filters="filters"
        :active-filters-count="getActiveFiltersCount"
        @apply="handleApply"
        @reset="handleReset"
        @update:filter="handleFilterUpdate"
        @clear-filter="handleClearFilter"
    />
  </v-menu>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {useStockStore} from '@/Domains/Stock/Stores/stockStore';
import {useVehicleFiltersStore} from '@/Domains/Stock/Stores/vehicleFiltersStore';
import FilterContent from './FilterContent.vue';
import {localStorageUtils} from '@/utils/localStorage';

const stockStore = useStockStore();
const vehicleFiltersStore = useVehicleFiltersStore();

const isLoading = ref(false);
const isInitialized = ref(false);

const getFiltersStorageKey = computed(() => `vehicle-filters-${stockStore.currentStatusGroup.toLowerCase()}`);

// Важное изменение: меняем computed на ref для прямого управления
const dialog = ref(false);

// Создаем watcher для syncing между store и local ref
watch(
    () => stockStore.filterDialog,
    (newValue) => {
      dialog.value = newValue;
    }
);

// Также наблюдаем за изменением локального значения
watch(
    dialog,
    (newValue) => {
      if (!newValue) stockStore.filterDialog = false;
    }
);

interface Filters {
  status: string[];
  vehicleType: string[];
  vehicleKind: string[];
  vehicleSubKind: string[];
  year: number[];
  liquidity: string[];
  powerHP: number[];
  powerKW: number[];
  brand: string[];
  model: string[];
  equipment: string[];
  approved_for_sale: boolean | null;
  region: string | null;
  address: string | null;
  // Новые диапазонные фильтры
  yearMin: number | null;
  yearMax: number | null;
  powerHPMin: number | null;
  powerHPMax: number | null;
  powerKWMin: number | null;
  powerKWMax: number | null;
  dateOfSeizureMin: string | null;
  dateOfSeizureMax: string | null;
  mileageMin: number | null;
  mileageMax: number | null;
  engineHoursMin: number | null;
  engineHoursMax: number | null;
}

const filters = ref<Filters>({
  status: stockStore.statusFilter,
  vehicleType: [],
  vehicleKind: [],
  vehicleSubKind: [],
  year: [],
  liquidity: [],
  powerHP: [],
  powerKW: [],
  brand: [],
  model: [],
  equipment: [],
  approved_for_sale: null,
  region: null,
  address: null,
  // Инициализация новых диапазонных фильтров
  yearMin: null,
  yearMax: null,
  powerHPMin: null,
  powerHPMax: null,
  powerKWMin: null,
  powerKWMax: null,
  dateOfSeizureMin: null,
  dateOfSeizureMax: null,
  mileageMin: null,
  mileageMax: null,
  engineHoursMin: null,
  engineHoursMax: null
});

const getActiveFiltersCount = computed(() => {
  let count = 0;

  for (const key in filters.value) {
    if (Array.isArray(filters.value[key])) {
      count += filters.value[key].length;
    } else if (filters.value[key] !== null && filters.value[key] !== undefined &&
        filters.value[key] !== "" &&
        filters.value[key] !== 0) {
      count += 1;
    }
  }

  return count || 0;
});

const activeFiltersCount = getActiveFiltersCount;

// Экспортируем значение наружу
defineExpose({
  activeFiltersCount
});
const loadSavedFilters = async () => {
  try {
    const savedFilters = localStorageUtils.getData(getFiltersStorageKey.value);
    if (!savedFilters) return;

    if (savedFilters.vehicleType?.length) {
      await vehicleFiltersStore.handleVehicleTypeChange(savedFilters.vehicleType[0]);

      if (savedFilters.vehicleKind?.length) {
        await vehicleFiltersStore.handleVehicleKindChange(savedFilters.vehicleKind[0]);

        if (savedFilters.vehicleSubKind?.length) {
          await vehicleFiltersStore.loadBrands({
            type: savedFilters.vehicleType[0],
            subtype1: savedFilters.vehicleKind[0],
            subtype2: savedFilters.vehicleSubKind[0]
          });
        }
      }
    }

    if (savedFilters.brand?.length) {
      const brandsParams: Record<string, string> = {};

      if (savedFilters.vehicleType?.length) {
        brandsParams.type = savedFilters.vehicleType[0];
      }
      if (savedFilters.vehicleKind?.length) {
        brandsParams.subtype1 = savedFilters.vehicleKind[0];
      }
      if (savedFilters.vehicleSubKind?.length) {
        brandsParams.subtype2 = savedFilters.vehicleSubKind[0];
      }

      if (Object.keys(brandsParams).length > 0) {
        await vehicleFiltersStore.loadBrands(brandsParams);
      }

      await vehicleFiltersStore.loadModels(savedFilters.brand[0]);

      if (savedFilters.model?.length) {
        await vehicleFiltersStore.loadEquipments(savedFilters.model[0]);
      }
    }

    // Обновляем все фильтры, включая диапазонные
    Object.assign(filters.value, savedFilters);
  } catch (error) {
    console.error('Ошибка при загрузке сохраненных фильтров:', error);
  }
};

const initializeBasicFilters = async () => {
  if (!isInitialized.value) {
    await Promise.all([
      vehicleFiltersStore.loadStatuses(stockStore.currentStatusGroup),
      vehicleFiltersStore.loadLiquidities(),
      vehicleFiltersStore.loadVehicleTypes()
    ]);
    isInitialized.value = true;
  }
};

const loadDependentFilters = async () => {
  try {
    isLoading.value = true;
    await loadSavedFilters();
  } finally {
    isLoading.value = false;
  }
};

const handleMenuOpen = async (value: boolean) => {
  if (value) {
    if (!isInitialized.value) {
      await initializeBasicFilters();
    }
    await loadDependentFilters();
  }
};

// Изменено: обрабатываем диапазонные фильтры
const handleApply = () => {
  // Сохраняем все фильтры в localStorage
  localStorageUtils.saveData(getFiltersStorageKey.value, filters.value);

  // Создаем копию фильтров для предотвращения проблем с реактивностью
  const filtersCopy = JSON.parse(JSON.stringify(filters.value));

  // Применяем фильтры через стор
  stockStore.applyFilters(filtersCopy);

  // Закрываем диалог
  dialog.value = false;
};

const handleReset = async () => {
  localStorageUtils.clearData(getFiltersStorageKey.value);

  // Сбрасываем все значения фильтров, включая диапазонные
  filters.value = {
    status: [],
    vehicleType: [],
    vehicleKind: [],
    vehicleSubKind: [],
    year: [],
    liquidity: [],
    powerHP: [],
    powerKW: [],
    brand: [],
    model: [],
    equipment: [],
    yearMin: null,
    yearMax: null,
    powerHPMin: null,
    powerHPMax: null,
    powerKWMin: null,
    powerKWMax: null,
    dateOfSeizureMin: null,
    dateOfSeizureMax: null,
    mileageMin: null,
    mileageMax: null,
    engineHoursMin: null,
    engineHoursMax: null,
    approved_for_sale: null,
    region: null,
    address: null
  };

  await Promise.all([
    stockStore.resetFilters(),
    vehicleFiltersStore.$reset()
  ]);

  isInitialized.value = false;
};

// Обработчик обновления значений фильтров, включая диапазонные
const handleFilterUpdate = (filterType: keyof Filters, value: any) => {
  console.log(`Updating filter ${filterType} with value:`, value);

  // Обновляем значение в объекте фильтров
  filters.value[filterType] = value;

  // Особый случай для статуса
  if (filterType === 'status') {
    stockStore.statusFilter = value;
  }
};

// В handleClearFilter в FilterDialog
const handleClearFilter = (filterType: keyof Filters) => {


  if (Array.isArray(filters.value[filterType])) {
    filters.value[filterType] = [];
  } else {
    filters.value[filterType] = null;
  }
  stockStore.applyFilters({
    ...filters.value
  });
};

onMounted(async () => {
  const savedFilters = localStorageUtils.getData(getFiltersStorageKey.value);
  if (savedFilters && Object.keys(savedFilters).length > 0) {
    isLoading.value = true;
    try {
      await initializeBasicFilters();
      await loadSavedFilters();
    } finally {
      isLoading.value = false;
    }
  }

  // Инициализация начального значения dialog из store
  dialog.value = stockStore.filterDialog;
});
</script>