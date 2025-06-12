<template>
  <div class="filters-grid">
    <!-- Основные параметры -->
    <div class="filter-group">
      <div class="filter-group-title">Основные параметры</div>
      <v-select
          v-model="filters.status"
          :items="getFilteredItems('status', store.statusItems || [])"
          label="Статус"
          multiple
          chips
          closable-chips
          clearable
          item-title="text"
          item-value="value"
          density="comfortable"
          class="mb-2"
          hide-details
          @update:modelValue="(value) => handleStatusChange(value)"
          @click:clear="() => handleClearFilter('status')"
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="status"
          />
        </template>
      </v-select>
      <v-select
          v-model="filters.liquidity"
          :items="getFilteredItems('liquidity', store.liquidityItems || [])"
          label="Ликвидность"
          multiple
          chips
          closable-chips
          clearable
          density="comfortable"
          item-title="text"
          item-value="value"
          hide-details
          class="mb-2"
          @update:modelValue="(value) => handleLiquidityChange(value)"
          @click:clear="() => handleClearFilter('liquidity')"
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="liquidity"
          />
        </template>
      </v-select>
      <v-select
          v-model="filters.approved_for_sale"
          :items="approvedForSaleItems"
          label="Допуск к реализации"
          clearable
          density="comfortable"
          hide-details
          class="mb-2"
          item-title="text"
          item-value="value"
          @update:modelValue="(value) => handleApprovedForSaleChange(value)"
          @click:clear="() => handleClearFilter('approved_for_sale')"
      />
    </div>

    <!-- Параметры ТС -->
    <div class="filter-group">
      <div class="filter-group-title">Параметры ТС</div>
      <v-select
          v-model="filters.vehicleType"
          :items="getFilteredItems('vehicleType', store.vehicleTypeItems || [])"
          label="Тип ТС"
          multiple
          chips
          closable-chips
          clearable
          density="comfortable"
          hide-details
          class="mb-2"
          item-title="text"
          item-value="value"
          @update:modelValue="(value) => handleVehicleTypeChange(value)"
          @click:clear="() => handleClearFilter('vehicleType')"
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="vehicleType"
          />
        </template>
      </v-select>
      <v-select
          v-model="filters.vehicleKind"
          :items="getFilteredItems('vehicleKind', store.vehicleKindItems || [])"
          label="Вид ТС"
          multiple
          chips
          closable-chips
          clearable
          density="comfortable"
          hide-details
          class="mb-2"
          :disabled="isVehicleKindDisabled"
          item-title="text"
          item-value="value"
          @update:modelValue="(value) => handleVehicleKindChange(value)"
          @click:clear="() => handleClearFilter('vehicleKind')"
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="vehicleKind"
          />
        </template>
      </v-select>
      <v-select
          v-model="filters.vehicleSubKind"
          :items="getFilteredItems('vehicleSubKind', store.vehicleSubKindItems || [])"
          label="Подвид ТС"
          multiple
          chips
          closable-chips
          clearable
          density="comfortable"
          hide-details
          :disabled="isVehicleSubKindDisabled"
          item-title="text"
          item-value="value"
          @update:modelValue="(value) => handleVehicleSubKindChange(value)"
          @click:clear="() => handleClearFilter('vehicleSubKind')"
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="vehicleSubKind"
          />
        </template>
      </v-select>
    </div>

    <!-- Параметры модели -->
    <div class="filter-group">
      <div class="filter-group-title">Параметры модели</div>
      <v-select
          v-model="filters.brand"
          :items="getFilteredItems('brand', store.brandItems || [])"
          label="Бренд"
          multiple
          chips
          closable-chips
          clearable
          density="comfortable"
          hide-details
          class="mb-2"
          :disabled="(store.brandItems || []).length === 0"
          item-title="text"
          item-value="value"
          @update:modelValue="(value) => handleBrandChange(value)"
          @click:clear="() => handleClearFilter('brand')"
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="brand"
          />
        </template>
      </v-select>
      <v-select
          v-model="filters.model"
          :items="getFilteredItems('model', store.modelItems || [])"
          label="Модель"
          multiple
          chips
          closable-chips
          clearable
          density="comfortable"
          hide-details
          class="mb-2"
          :disabled="!filters.brand?.length"
          item-title="text"
          item-value="value"
          @update:modelValue="(value) => handleModelChange(value)"
          @click:clear="() => handleClearFilter('model')"
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="model"
          />
        </template>
      </v-select>
      <v-select
          v-model="filters.equipment"
          :items="getFilteredItems('equipment', store.equipmentItems || [])"
          label="Комплектация"
          multiple
          chips
          closable-chips
          clearable
          density="comfortable"
          hide-details
          :disabled="!filters.model?.length"
          item-title="text"
          item-value="value"
          @update:modelValue="(value) => handleEquipmentChange(value)"
          @click:clear="() => handleClearFilter('equipment')"
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="equipment"
          />
        </template>
      </v-select>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, provide, watch} from 'vue';
import {useVehicleFiltersStore} from '@/Domains/Stock/Stores/vehicleFiltersStore';
import {useFilterDependencies} from '@/composables/Filters/useFilterDependencies';
import {useErrorHandler} from '@/composables/ErrorJobers/useErrorHandler';
import {SelectSearchService} from '@/components/ui/Searchbar/SelectSearchService';
import SelectSearchField from '@/components/ui/Searchbar/SelectSearch.vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:filter', 'clear-filter']);

const store = useVehicleFiltersStore();
const { handleAsync } = useErrorHandler({ logPrefix: '🚗' });
const { clearDependentFields } = useFilterDependencies();

const approvedForSaleItems = [
  { text: 'Да', value: 'true' },
  { text: 'Нет', value: 'false' },
  { text: 'Не указано', value: 'unknown' }
];

// Инициализация сервиса поиска
const filterNames = ['status', 'liquidity', 'vehicleType', 'vehicleKind', 'vehicleSubKind', 'brand', 'model', 'equipment'];
const searchService = new SelectSearchService(filterNames);
const searchValues = searchService.getSearchValues();

// Предоставляем сервис поиска и значения поиска для дочерних компонентов
provide('searchService', searchService);
provide('searchValues', searchValues);

// Вычисление состояния disabled для селектов
const isVehicleKindDisabled = computed(() =>
    props.filters.vehicleType?.length > 1 || !props.filters.vehicleType?.length
);

const isVehicleSubKindDisabled = computed(() =>
    props.filters.vehicleKind?.length > 1 || !props.filters.vehicleKind?.length
);

// Функция для получения отфильтрованных элементов (реактивная)
const getFilteredItems = (filterName, items) => {
  const searchQuery = searchValues[filterName]?.toLowerCase() || '';

  if (!searchQuery) return items;

  return items.filter(item => {
    const itemText = (item.text || '').toLowerCase();
    return itemText.includes(searchQuery);
  });
};

// Универсальный обработчик изменения фильтра
const handleFilterChange = async (
    filterType: string,
    value: string[],
    loadDependencies?: (ids: string[]) => Promise<void>
) => {
  props.filters[filterType] = value;

  if (!value?.length) {
    clearDependentFields(filterType, props.filters);
    return;
  }

  if (loadDependencies) {
    await handleAsync(
        () => loadDependencies(value),
        `загрузка зависимостей для ${filterType}`
    );
  }
};

// Обработчики изменения конкретных фильтров
const handleVehicleTypeChange = (value: string[]) =>
    handleFilterChange('vehicleType', value, store.handleVehicleTypeChange);

const handleVehicleKindChange = (value: string[]) =>
    handleFilterChange('vehicleKind', value, store.handleVehicleKindChange);

const handleVehicleSubKindChange = async (value: string[]) => {
  await handleFilterChange('vehicleSubKind', value);

  if (value?.length) {
    await handleAsync(async () => {
      await store.loadBrands({ types: value });
    }, 'загрузка брендов после изменения подвида ТС');
  }
};

const handleBrandChange = (value: string[]) =>
    handleFilterChange('brand', value, store.loadModels);

const handleModelChange = (value: string[]) =>
    handleFilterChange('model', value, store.loadEquipments);

const handleEquipmentChange = (value: string[]) =>
    handleFilterChange('equipment', value);

const handleLiquidityChange = (value: string[]) =>
    handleFilterChange('liquidity', value);

const handleStatusChange = (value: string[]) =>
    emit('update:filter', 'status', value);

// Исправленный обработчик изменения фильтра допуска к реализации
const handleApprovedForSaleChange = (value) => {
  emit('update:filter', 'approved_for_sale', value);
};

const handleClearFilter = (filterType: string) => {
  searchService.clearSearch(filterType);
  emit('clear-filter', filterType);
};

// Создание watcher'ов для отслеживания изменений фильтров
const createFilterWatcher = (
    filterPath: string,
    handler: (values: string[]) => Promise<void>,
    description: string
) => {
  watch(() => props.filters[filterPath], async (newValues) => {
    if (!newValues?.length) return;

    await handleAsync(async () => {
      await handler(newValues);
      clearDependentFields(filterPath, props.filters);
    }, description);
  });
};

// Настройка watcher'ов
createFilterWatcher('vehicleType', store.handleVehicleTypeChange, 'обработка изменения типа ТС');
createFilterWatcher('vehicleKind', store.handleVehicleKindChange, 'обработка изменения вида ТС');
createFilterWatcher('vehicleSubKind',
    (subkinds) => store.loadBrands({ types: subkinds }), 'загрузка брендов');
createFilterWatcher('brand', store.loadModels, 'загрузка моделей');
createFilterWatcher('model', store.loadEquipments, 'загрузка комплектаций');

// Следим за изменениями в поисковых значениях для обновления фильтрации
for (const filterName of filterNames) {
  watch(() => searchValues[filterName], () => {
  }, { immediate: true });
}

// Экспортируем метод для очистки всех поисковых полей
const clearAllSearchFields = () => {
  searchService.clearAllSearches();
};

defineExpose({
  clearAllSearchFields
});
</script>

<style lang="sass">
.filters-grid
  margin-top: 10px
@import '../styles/filters'
</style>