<template>
  <v-text-field
      v-model="value"
      :disabled="disabled"
      :placeholder="placeholder"
      dense
      outlined
      hide-details
      class="compact-input"
  />
</template>

<script setup lang="ts">


defineProps<{
  value?: string
  disabled?: boolean
  placeholder?: string
}>()

defineEmits<{
  'update:value': [value: string]
}>()
</script>

<style lang="sass" scoped>
.compact-input
  :deep(.v-input__control)
    min-height: 32px

  :deep(.v-input__slot)
    min-height: 32px

  :deep(.v-text-field__slot)
    font-size: 12px
</style>