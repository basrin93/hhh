<!-- FormSelect.vue -->
<template>
  <v-select
      :model-value="modelValue"
      v-bind="$attrs"
      :items="items"
      :disabled="disabled"
      dense
      outlined
      hide-details
      class="compact-select"
      @update:model-value="$emit('update:modelValue', $event)"
  />
</template>

<script setup lang="ts">
import {watch, onMounted} from "vue";

interface SelectItem {
  text: string
  value: string | number
}

const props = defineProps<{
  modelValue?: any
  items?: SelectItem[]
  disabled?: boolean
}>()

const emit = defineEmits<{
  'update:modelValue': [value: any]
}>()

// Добавляем watch для отслеживания изменений
watch(() => props.modelValue, (newVal) => {
  console.log('FormSelect: значение изменилось:', {
    новое: newVal,
    доступныеЗначения: props.items
  })
})

// Добавляем лог при монтировании
onMounted(() => {
  console.log('FormSelect: инициализация:', {
    текущееЗначение: props.modelValue,
    доступныеЗначения: props.items,
    disabled: props.disabled
  })
})
</script>

<style lang="sass" scoped>
.compact-select
  :deep(.v-input__control)
    min-height: 32px

  :deep(.v-input__slot)
    min-height: 32px

  :deep(.v-select__slot)
    font-size: 12px
</style>