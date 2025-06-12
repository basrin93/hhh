<template>
  <div class="status-badge" :class="statusClass" :style="useDynamicStyles ? badgeStyle : {}">
    <span class="status-text">{{ label }}</span>
    <div class="status-indicator" v-if="showIndicator"></div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { useStatusStyles } from '@/composables/useStatusStyles';

const props = defineProps({
  label: {
    type: String,
    required: true
  },
  showIndicator: {
    type: Boolean,
    default: false
  },
  useDynamicStyles: {
    type: Boolean,
    default: true
  }
});

// Локальная копия label для реактивности
const statusLabel = ref(props.label);

// Получаем стили статуса из композабла
const { statusClass, badgeStyle } = useStatusStyles(statusLabel);

// Обновляем локальную копию при изменении входного свойства
watch(() => props.label, (newLabel) => {
  statusLabel.value = newLabel;
});
</script>

<style scoped lang="sass">
// Стили будут применены только если useDynamicStyles=false
.status-badge
  display: inline-flex
  align-items: center
  padding: 6px 12px
  border-radius: 16px
  font-size: 13px
  font-weight: 500
  position: relative
  overflow: hidden

  .status-text
    position: relative
    z-index: 1

  .status-indicator
    width: 8px
    height: 8px
    border-radius: 50%
    margin-left: 8px

.status-not-seized
  background-color: rgba(232, 208, 185, 0.2)
  color: darken($alfa_friendly_brow, 35%)
  border: 1px solid $alfa_friendly_brow
  .status-indicator
    background-color: $alfa_friendly_brow

.status-seized
  background-color: rgba(120, 121, 207, 0.2)
  color: darken($alfa_friendly_indigo, 30%)
  border: 1px solid $alfa_friendly_indigo
  .status-indicator
    background-color: $alfa_friendly_indigo

.status-impossible
  background-color: rgba(255, 92, 92, 0.15)
  color: darken($alfa_friendly_red, 25%)
  border: 1px solid $alfa_friendly_red
  .status-indicator
    background-color: $alfa_friendly_red

.status-sold
  background-color: rgba(76, 175, 80, 0.15)
  color: darken($alfa_friendly_succes, 25%)
  border: 1px solid $alfa_friendly_succes
  .status-indicator
    background-color: $alfa_friendly_succes

.status-evaluated
  background-color: rgba(67, 208, 196, 0.15)
  color: darken($alfa_friendly_turquoise, 30%)
  border: 1px solid $alfa_friendly_turquoise
  .status-indicator
    background-color: $alfa_friendly_turquoise

.status-preparing
  background-color: rgba(126, 179, 255, 0.15)
  color: darken($alfa_friendly_blue, 35%)
  border: 1px solid $alfa_friendly_blue
  .status-indicator
    background-color: $alfa_friendly_blue

.status-on-sale
  background-color: rgba(25, 118, 210, 0.15)
  color: darken($alfa_primary-blue, 15%)
  border: 1px solid $alfa_primary-blue
  .status-indicator
    background-color: $alfa_primary-blue

.status-reserved
  background-color: rgba(254, 233, 132, 0.25)
  color: darken($alfa_friendly_yellow, 45%)
  border: 1px solid $alfa_friendly_yellow
  .status-indicator
    background-color: $alfa_friendly_yellow

.status-default
  background-color: rgba(173, 178, 189, 0.15)
  color: $alfa_friendly_background_hard
  border: 1px solid $alfa_friendly_background_medium
  .status-indicator
    background-color: $alfa_friendly_background_medium
</style>