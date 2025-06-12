<template>
  <div class="filter-group additional-filters-section">
    <div class="filters-grid">
      <!-- Первая колонка: фильтры типов -->
      <div class="filter-group">
        <div class="filter-group-title">Параметры двигателя</div>
        <v-select
            v-for="filter in engineFilters"
            :key="filter.name"
            v-model="filterValues[filter.name]"
            :items="searchService.filterItems(filterItems[`${filter.name}Items`] || [], filter.name)"
            :label="filter.label"
            multiple
            chips
            closable-chips
            clearable
            density="comfortable"
            class="mb-2"
            hide-details
            :loading="isLoading[filter.loadingKey]"
            @update:model-value="(val) => handleFilterChange(filter.name, val)"
            @click:clear="() => handleClear(filter.name)"
            item-title="text"
            item-value="value"
        >
          <template v-slot:prepend-item>
            <SelectSearchField
                :filter-name="filter.name"
            />
          </template>
        </v-select>
      </div>

      <!-- Вторая колонка: тип привода и топливо -->
      <div class="filter-group">
        <div class="filter-group-title">Технические параметры</div>
        <v-select
            v-for="filter in technicalFilters"
            :key="filter.name"
            v-model="filterValues[filter.name]"
            :items="searchService.filterItems(filterItems[`${filter.name}Items`] || [], filter.name)"
            :label="filter.label"
            multiple
            chips
            closable-chips
            clearable
            density="comfortable"
            :class="{ 'mb-2': !filter.isLast }"
            hide-details
            :loading="isLoading[filter.loadingKey]"
            @update:model-value="(val) => handleFilterChange(filter.name, val)"
            @click:clear="() => handleClear(filter.name)"
            item-title="text"
            item-value="value"
        >
          <template v-slot:prepend-item>
            <SelectSearchField
                :filter-name="filter.name"
            />
          </template>
        </v-select>
      </div>

      <!-- Третья колонка: ответственные и другие параметры -->
      <div class="filter-group">
        <div class="filter-group-title">Ответственные лица и локация</div>
        <v-select
            v-for="filter in responsibleFilters"
            :key="filter.name"
            v-model="filterValues[filter.name]"
            :items="searchService.filterItems(filterItems[`${filter.name}Items`] || [], filter.name)"
            :label="filter.label"
            multiple
            chips
            closable-chips
            clearable
            density="comfortable"
            :class="{ 'mb-2': !filter.isLast }"
            hide-details
            :loading="isLoading[filter.loadingKey]"
            @update:model-value="(val) => handleFilterChange(filter.name, val)"
            @click:clear="() => handleClear(filter.name)"
            item-title="text"
            item-value="value"
        >
          <template v-slot:prepend-item>
            <SelectSearchField
                :filter-name="filter.name"
            />
          </template>
        </v-select>
        <div class="custom-text-field">
          <label class="field-label">Город</label>
          <div class="input-wrapper">
            <input
                v-model="filterValues.region"
                type="text"
                class="text-input"
                placeholder="Введите город"
                @input="(e) => handleRegionChange(e.target.value)"
            />
            <button
                v-if="filterValues.region"
                @click="() => handleTextFieldClear('region')"
                class="clear-btn"
                type="button"
            >
              ×
            </button>
          </div>
        </div>
        <div class="custom-text-field">
          <label class="field-label">Адрес стоянки</label>
          <div class="input-wrapper">
            <input
                v-model="filterValues.address"
                type="text"
                class="text-input"
                placeholder="Введите адрес"
                @input="(e) => handleAddressChange(e.target.value)"
            />
            <button
                v-if="filterValues.address"
                @click="() => handleTextFieldClear('address')"
                class="clear-btn"
                type="button"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, provide, reactive, watch} from 'vue';
import {useAdditionalFilters} from '@/composables/Filters/useAdditionalFilters';
import {SelectSearchService} from '@/components/ui/Searchbar/SelectSearchService';
import SelectSearchField from '@/components/ui/Searchbar/SelectSearch.vue';

const props = defineProps({
  filters: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:filter', 'validation-changed', 'clear-filter']);

// Список фильтров
const filterNames = [
  'wheelFormula', 'transmissionType', 'driveUnit', 'fuelType',
  'keysCount', 'responsible', 'lessor', 'lessee', 'engineType'
];

// Инициализация сервиса поиска
const searchService = new SelectSearchService(filterNames);
const searchValues = searchService.getSearchValues();

// Предоставляем сервис поиска дочерним компонентам
provide('searchService', searchService);
provide('searchValues', searchValues);

// Используем композабл для фильтров
const {
  isLoading,
  engineTypeItems,
  wheelFormulaItems,
  transmissionTypeItems,
  driveUnitItems,
  responsibleItems,
  lessorItems,
  lesseeItems,
  keysCountItems,
  fuelTypeItems,
  engineType,
  wheelFormula,
  transmissionType,
  driveUnit,
  responsible,
  lessor,
  lessee,
  keysCount,
  fuelType,
  region,
  address,
  loadFilterData,
  applyAdditionalFilters,
  resetAdditionalFilters,
  countActiveFilters
} = useAdditionalFilters(props.filters, emit);

// Значения фильтров
const filterValues = reactive({
  engineType,
  wheelFormula,
  transmissionType,
  driveUnit,
  responsible,
  lessor,
  lessee,
  keysCount,
  fuelType,
  region,
  address
});

// Элементы для фильтров
const filterItems = reactive({
  engineTypeItems,
  wheelFormulaItems,
  transmissionTypeItems,
  driveUnitItems,
  responsibleItems,
  lessorItems,
  lesseeItems,
  keysCountItems,
  fuelTypeItems
});

// Группы фильтров
const engineFilters = computed(() => [
  { name: 'wheelFormula', label: 'Колесная формула', loadingKey: 'wheelFormulas' },
  { name: 'transmissionType', label: 'Тип коробки передач', loadingKey: 'transmissionTypes', isLast: true }
]);

const technicalFilters = computed(() => [
  { name: 'driveUnit', label: 'Привод', loadingKey: 'driveUnits' },
  { name: 'fuelType', label: 'Тип двигателя', loadingKey: 'fuelTypes' },
  { name: 'keysCount', label: 'Кол-во ключей', loadingKey: 'keysCount', isLast: true }
]);

const responsibleFilters = computed(() => [
  { name: 'responsible', label: 'Ответственный', loadingKey: 'responsibles' },
  { name: 'lessor', label: 'Лизингодатель', loadingKey: 'lessors' },
  { name: 'lessee', label: 'Лизингополучатель', loadingKey: 'lessees', isLast: true }
]);

// Обработчик изменения фильтра
const handleFilterChange = (filterName: string, value: any) => {
  (filterValues as any)[filterName] = value;
  (props.filters as any)[filterName] = value;
  emit('update:filter', filterName, value);
};

// Обработчик изменения фильтра регион
const handleRegionChange = (value: string) => {
  region.value = value;
  filterValues.region = value;
  props.filters.region = value;
  emit('update:filter', 'region', value);
};

// Обработчик изменения адреса стоянки
const handleAddressChange = (value: string) => {
  address.value = value;
  filterValues.address = value;
  props.filters.address = value;
  emit('update:filter', 'address', value);
};

// Обработчик очистки для селектов
const handleClear = (filterName: string) => {
  (filterValues as any)[filterName] = [];
  (props.filters as any)[filterName] = [];
  searchService.clearSearch(filterName);
  emit('clear-filter', filterName);
};

// Отдельный обработчик очистки для текстовых полей
const handleTextFieldClear = (fieldName: 'region' | 'address') => {
  if (fieldName === 'region') {
    region.value = '';
    filterValues.region = '';
    props.filters.region = '';
    emit('update:filter', 'region', '');
  } else if (fieldName === 'address') {
    address.value = '';
    filterValues.address = '';
    props.filters.address = '';
    emit('update:filter', 'address', '');
  }
  emit('clear-filter', fieldName);
};

// Переопределяем методы сброса и применения фильтров
const overriddenResetAdditionalFilters = () => {
  Object.keys(filterValues).forEach(key => {
    if (key === 'region' || key === 'address') {
      (filterValues as any)[key] = '';
      (props.filters as any)[key] = '';
    } else {
      (filterValues as any)[key] = [];
      (props.filters as any)[key] = [];
    }
  });
  searchService.clearAllSearches();
  resetAdditionalFilters();

  Object.keys(filterValues).forEach(key => {
    if (key === 'region' || key === 'address') {
      emit('update:filter', key, '');
    } else {
      emit('update:filter', key, []);
    }
  });
};

const overriddenApplyAdditionalFilters = () => {
  Object.keys(filterValues).forEach(key => {
    (props.filters as any)[key] = (filterValues as any)[key];
    emit('update:filter', key, (filterValues as any)[key]);
  });
  applyAdditionalFilters();
};

// Синхронизация при изменении внешних фильтров
watch(() => props.filters, (newFilters) => {
  if (newFilters) {
    Object.keys(filterValues).forEach(key => {
      if (newFilters[key] !== undefined) {
        if (key === 'region' || key === 'address') {
          filterValues[key] = newFilters[key] || '';
        } else {
          filterValues[key] = newFilters[key] || [];
        }
      }
    });
  }
}, { deep: true });

onMounted(() => {
  loadFilterData();

  Object.keys(filterValues).forEach(key => {
    if (props.filters[key] !== undefined) {
      if (key === 'region' || key === 'address') {
        filterValues[key] = props.filters[key] || '';
      } else {
        filterValues[key] = props.filters[key] || [];
      }
    }
  });
});

// Экспортируем методы
defineExpose({
  applyAdditionalFilters: overriddenApplyAdditionalFilters,
  resetAdditionalFilters: overriddenResetAdditionalFilters,
  countActiveFilters: () => {
    const baseCount = countActiveFilters();
    return baseCount;
  }
});
</script>
<style lang="sass" scoped>
@import '../styles/filters'

</style>