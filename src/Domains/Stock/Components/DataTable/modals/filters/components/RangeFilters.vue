<template>
  <div class="range-filters-section" v-if="isEnabled">
    <div class="range-filters-wrapper">
      <div v-for="field in fieldConfigs" :key="field.name" class="range-filter-item">
        <div class="range-filter-label">{{ field.label }}</div>
        <div class="range-inputs-container">
          <!-- Поле "от/с" -->
          <v-text-field
              v-model="inputRefs[field.name].min.value"
              :type="field.type"
              :label="field.minLabel"
              density="comfortable"
              :error-messages="errorRefs[field.name].min.value"
              :error="!!errorRefs[field.name].min.value"
              class="range-input"
              :min="field.minValue"
              :max="field.name === 'dateOfSeizure' ? formattedCurrentDate : undefined"
              :maxlength="field.maxLength"
              @keypress="field.type !== 'date' ? filterNumericInput : undefined"
              @update:model-value="value => updateRangeInput(field.name, 'min', value)"
          />
          <!-- Поле "до/по" -->
          <v-text-field
              v-model="inputRefs[field.name].max.value"
              :type="field.type"
              :label="field.maxLabel"
              density="comfortable"
              :error-messages="errorRefs[field.name].max.value"
              :error="!!errorRefs[field.name].max.value"
              class="range-input"
              :min="getMinValueForMax(field)"
              :max="field.name === 'dateOfSeizure' ? formattedCurrentDate : undefined"
              :maxlength="field.maxLength"
              @keypress="field.type !== 'date' ? filterNumericInput : undefined"
              @update:model-value="value => updateRangeInput(field.name, 'max', value)"
          />
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import {onMounted, watch} from 'vue';
import {useRangeFilters} from '@/composables/Filters/useRangeFilters';
import {useFilterValidation} from '@/composables/Filters/useFilterValidation';

const props = defineProps({
  filters: {
    type: Object,
    required: true
  },
  isEnabled: {
    type: Boolean,
    default: true
  }
});

const emit = defineEmits(['update:filter', 'validation-changed']);

const { filterNumericInput, formattedCurrentDate } = useFilterValidation();

// Создаем адаптированный emit для корректной синхронизации с родительским компонентом
const adaptedEmit = (event, name, value) => {
  if (event === 'update:filter') {
    props.filters[name] = value;
    emit(event, name, value);
  } else {
    emit(event, name, value);
  }
};

// Получаем все необходимые объекты и функции из композабла
const rangeFilters = useRangeFilters(props.filters, adaptedEmit);

// Получаем конфигурацию полей
const fieldConfigs = rangeFilters.fieldConfigs;

// Создаем удобные объекты для доступа к полям
const inputRefs = {};
const errorRefs = {};

// Заполняем объекты ссылками на поля
fieldConfigs.forEach(field => {
  inputRefs[field.name] = {
    min: rangeFilters[`${field.name}MinInput`],
    max: rangeFilters[`${field.name}MaxInput`]
  };

  errorRefs[field.name] = {
    min: rangeFilters[`${field.name}MinError`],
    max: rangeFilters[`${field.name}MaxError`]
  };
});

// Вспомогательная функция для определения минимального значения для поля "max"
function getMinValueForMax(field) {
  if (field.name === 'dateOfSeizure') {
    return inputRefs[field.name].min.value || field.minValue;
  }

  if (field.type === 'number') {
    return inputRefs[field.name].min.value || 0;
  }

  return undefined;
}

// Единый обработчик изменения значения поля
const updateRangeInput = (fieldName, boundType, value) => {
  // Устанавливаем значение
  inputRefs[fieldName][boundType].value = value;

  // Валидируем поле
  rangeFilters.validateField(fieldName, boundType);

  // Если нет ошибки, обновляем props.filters
  if (!errorRefs[fieldName][boundType].value) {
    const propKey = `${fieldName}${boundType === 'min' ? 'Min' : 'Max'}`;

    // Для дат просто присваиваем значение, для чисел преобразуем в Number
    const fieldConfig = fieldConfigs.find(f => f.name === fieldName);
    props.filters[propKey] = fieldConfig.type === 'date'
        ? (value || null)
        : (value ? parseInt(value, 10) : null);
  }
};

// Наблюдаем за изменениями ошибок валидации и уведомляем родителя
watch(() => rangeFilters.hasValidationErrors.value, (hasErrors) => {
  emit('validation-changed', hasErrors);
});

onMounted(() => {
  if (props.isEnabled) {
    rangeFilters.syncInputValues();
    // Сразу сообщаем родителю о состоянии валидации
    emit('validation-changed', rangeFilters.hasValidationErrors.value);
  }
});

// Экспортируем методы композабла
defineExpose({
  applyRangeFilters: rangeFilters.applyRangeFilters,
  resetRangeFilters: rangeFilters.resetRangeFilters,
  countActiveRangeFilters: rangeFilters.countActiveRangeFilters,
  hasValidationErrors: rangeFilters.hasValidationErrors
});
</script>
<style lang="sass">
@import '../styles/filters'
</style>