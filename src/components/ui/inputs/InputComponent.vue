<template>
  <v-text-field
      :value="value"
      @input="$emit('input', $event)"
      density="compact"
      variant="outlined"
      hide-details
      :disabled="!isEditing"
      class="value-field"
      :class="{ 'editing': isEditing }"
      @blur="$emit('blur')"
  />
</template>

<script>
export default {
  name: 'InputComponent',
  props: {
    value: {
      type: [String, Number],

    },
    isEditing: {
      type: Boolean,
      default: false
    }
  }
}
</script>

<style lang="sass" scoped>
:deep(input)
  padding-left: 10px
  padding-bottom: 10px

.value-field
  border: 1px solid
  border-radius: 4px

  &:not(.editing)
    border: none
    .v-field
      background: transparent

    .v-field__input
      color: #111827

    .v-field__outline
      display: none



      &:hover
        background: $alfa_friendly_background_light

    .v-field__outline
      display: none
</style>