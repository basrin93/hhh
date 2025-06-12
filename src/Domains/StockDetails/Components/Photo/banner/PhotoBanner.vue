<template>
  <div v-if="shouldShow" class="photo-banner mb-6">
    <div class="banner-content">
      <v-icon size="48" class="banner-icon">{{ icon }}</v-icon>
      <div class="banner-text">
        <div class="banner-title">{{ title }}</div>
        <div class="banner-description">{{ description }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import {computed} from 'vue'

interface Props {
  type: 'no-type' | 'error'
  errorMessage?: string
  show: boolean
}

const props = defineProps<Props>()

const shouldShow = computed(() => props.show)

const icon = computed(() => {
  switch (props.type) {
    case 'no-type': return 'mdi-help-circle-outline'
    case 'error': return 'mdi-alert-outline'
    default: return 'mdi-help-circle-outline'
  }
})

const title = computed(() => {
  switch (props.type) {
    case 'no-type': return 'Тип транспортного средства не определен'
    case 'error': return 'Ошибка загрузки'
    default: return ''
  }
})

const description = computed(() => {
  switch (props.type) {
    case 'no-type': return 'Для загрузки фотографий необходимо указать тип транспортного средства в основных данных'
    case 'error': return props.errorMessage || 'Произошла ошибка при загрузке данных'
    default: return ''
  }
})
</script>

<style lang="sass" scoped>
.photo-banner
  background: #FFFFFF
  border: 1px solid #232B34
  border-radius: 8px
  padding: 24px
  text-align: center

.banner-content
  display: flex
  flex-direction: column
  align-items: center
  gap: 16px

.banner-icon
  color: #232B34

.banner-text
  display: flex
  flex-direction: column
  align-items: center
  gap: 8px

.banner-title
  font-size: 20px
  font-weight: 600
  color: #232B34

.banner-description
  font-size: 16px
  color: #232B34
  max-width: 600px
  line-height: 1.4
</style>