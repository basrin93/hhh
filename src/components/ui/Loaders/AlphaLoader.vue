<template>
  <div class="alpha-loader">
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 100 100"
        class="alpha-loader__svg"
    >
      <!-- Статичный контур -->
      <path
          d="M20,95 L80,95 M20,80 L50,20 C50,20 50,20 50,20 L80,80 M35,65 L65,65"
          fill="none"
          :stroke="backgroundStrokeColor"
          stroke-width="8"
          stroke-linecap="round"
          stroke-linejoin="round"
      />

      <!-- Анимированное заполнение -->
      <path
          d="M20,95 L80,95 M20,80 L50,20 C50,20 50,20 50,20 L80,80 M35,65 L65,65"
          fill="none"
          :stroke="animatedStrokeColor"
          stroke-width="8"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="alpha-loader__animated-path"
      />
    </svg>
  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue'

export default defineComponent({
  name: 'AlphaLoader',
  props: {
    backgroundColor: {
      type: String,
      default: '#fff'
    },
    backgroundStrokeColor: {
      type: String,
      default: '#E9EEF4'
    },
    animatedStrokeColor: {
      type: String,
      default: '#FF5C5C'
    }
  }
})
</script>

<style lang="sass" scoped>
.alpha-loader
  @include flex-center
  width: 100%
  height: 256px // эквивалент h-64
  background-color: v-bind(backgroundColor)

  &__svg
    width: 128px // эквивалент w-32
    height: 128px // эквивалент h-32

  &__animated-path
    stroke-dasharray: 300
    animation: drawPath 3s ease-in-out infinite

@keyframes drawPath
  0%
    stroke-dashoffset: 300
  100%
    stroke-dashoffset: 0
</style>