<template>
  <div>
    <v-list-item>
      <v-text-field
          v-model="localSearchValue"
          label="Поиск..."
          density="compact"
          hide-details
          single-line
          clearable
          prepend-inner-icon="mdi-magnify"
      ></v-text-field>
    </v-list-item>
    <v-divider class="mt-2"></v-divider>
  </div>
</template>

<script setup lang="ts">
import {inject, onMounted, ref, watch} from 'vue';

const props = defineProps({
  filterName: {
    type: String,
    required: true
  }
});

// Инжектим сервис поиска из родительского компонента
const searchService = inject('searchService');
const searchValues = inject('searchValues');

// Локальное значение для v-model
const localSearchValue = ref('');

// Устанавливаем начальное значение из сервиса
onMounted(() => {
  if (searchValues && props.filterName) {
    localSearchValue.value = searchValues[props.filterName] || '';
  }
});

// Когда локальное значение изменяется, обновляем значение в сервисе
watch(localSearchValue, (newValue) => {
  if (searchService && props.filterName) {
    searchValues[props.filterName] = newValue;
  }
}, { immediate: true });

// Следим за изменениями в сервисе
watch(() => searchValues[props.filterName], (newValue) => {
  if (newValue !== localSearchValue.value) {
    localSearchValue.value = newValue || '';
  }
}, { immediate: true });
</script>