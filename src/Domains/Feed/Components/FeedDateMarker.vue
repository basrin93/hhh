<template>
  <div class="feed-date-marker">
    {{ formatters.formatDateHeader(date) }}
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';

const props = defineProps({
  date: {
    type: String,
    required: true
  }
});

const formatters = inject('formatters');
</script>

<style lang="sass" scoped>
.feed-date-marker
  text-align: center
  padding: 8px 0
  margin: 16px 0
  font-size: 14px
  font-weight: 500
  color: $alfa_friendly_background_medium
  position: relative

  &::before, &::after
    content: ""
    position: absolute
    top: 50%
    height: 1px
    width: calc(50% - 50px)
    background-color: $alfa_friendly_background_light

  &::before
    left: 0

  &::after
    right: 0
</style>