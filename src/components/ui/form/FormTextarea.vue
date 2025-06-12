<template>
  <v-textarea
      v-model="value"
      :disabled="disabled"
      :placeholder="placeholder"
      :rows="rows"
      auto-grow
      dense
      outlined
      hide-details
      class="compact-textarea"
  />
</template>

<script setup lang="ts">
defineProps<{
  value?: string
  disabled?: boolean
  placeholder?: string
  rows?: number
}>()

defineEmits<{
  'update:value': [value: string]
}>()
</script>

<style lang="sass" scoped>
.compact-textarea
  :deep(.v-input__control)
    min-height: 32px

  :deep(.v-input__slot)
    min-height: 32px

  :deep(.v-textarea__slot)
    font-size: 12px
</style>