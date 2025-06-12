<template>
  <v-checkbox
      v-model="checked"
      :label="title"
      color="success"
      hide-details
      class="my-2"
  ></v-checkbox>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  title: {
    type: String,
    required: true
  },
  value: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['input'])

const checked = ref(props.value)

watch(checked, (newValue) => {
  emit('input', newValue)
})

watch(() => props.value, (newValue) => {
  checked.value = newValue
})
</script>