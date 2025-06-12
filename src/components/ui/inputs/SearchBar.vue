<template>
  <v-text-field
      v-model="value"
      :label="label"
      outlined
      dense
      class="flex-grow-1 input__search"
  >
    <template #append>
      <v-progress-circular
          v-if="loading"
          indeterminate
          size="20"
          width="2"
          color="primary"
      />
      <v-icon
          v-else-if="searchApplied"
          @click="resetSearch"
          class="clickable"
          title="Сбросить"
      >
        mdi-close-circle
      </v-icon>
      <v-icon v-else>
        mdi-magnify
      </v-icon>
    </template>
  </v-text-field>
</template>

<script setup lang="ts">
import { computed } from 'vue';

interface Props {
  value?: string;
  label?: string;
  loading?: boolean;
}

const props = defineProps<Props>();

const emit = defineEmits<{
  (e: 'input', value: string): void;
  (e: 'resetSearch'): void;
}>();

const value = computed<string>({
  get() {
    return props.value ?? '';
  },
  set(val: string) {
    emit('input', val);
  },
});

const label = props.label ?? 'Поиск (ДЛ, VIN, Гос.номер)';
const searchApplied = computed(() => value.value.trim().length > 0);

function resetSearch() {
  value.value = '';
  emit('resetSearch');
}
</script>

<style lang="sass" scoped>
:deep(.v-text-field__details)
  display: none
</style>