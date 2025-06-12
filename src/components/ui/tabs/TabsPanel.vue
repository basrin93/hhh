<template>
  <div class="tabs-container">
    <v-tabs
        v-model="localValue"
        color="primary"
        align-tabs="start"
        class="custom-tabs"
        height="36"
    >
      <v-tab
          v-for="(tab, index) in tabs"
          :key="index"
          :value="index"
          class="custom-tab"
      >
        <v-icon
            v-if="tab.icon"
            :icon="tab.icon"
            size="18"
            class="me-2"
        />
        {{ tab.title }}
      </v-tab>
    </v-tabs>

    <v-window
        v-model="localValue"
        class="tabs-window"
    >
      <v-window-item
          v-for="(tab, index) in tabs"
          :key="index"
          :value="index"
      >
        <alpha-loader v-if="loading" />
        <template v-else>
          <slot
              :name="'panel-' + index"
              :tab="tab"
          />
        </template>
      </v-window-item>
    </v-window>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import AlphaLoader from '@/components/ui/Loaders/AlphaLoader.vue'

interface Tab {
  title: string
  icon?: string
}

interface Props {
  modelValue?: number
  tabs: Tab[]
  loading?: boolean
  saveTabId?: string // Оставляем для обратной совместимости, но не используем
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: 0,
  loading: false,
  saveTabId: ''
})

const emit = defineEmits<{
  'update:modelValue': [value: number]
}>()

const localValue = ref(props.modelValue)

// Смотрим за изменениями modelValue извне
watch(() => props.modelValue, (newValue) => {
  localValue.value = newValue;
})

// Отправляем изменения наверх
watch(localValue, (newValue) => {
  emit('update:modelValue', newValue);
})
</script>

<style lang="sass" scoped>
.tabs-container
  width: 100%
  display: grid

:deep(.custom-tabs)
  background-color: $alfa_friendly_background_light
  border-radius: 8px 8px 0 0

:deep(.v-tab)
  text-transform: none
  letter-spacing: normal
  font-weight: 400
  border-radius: 8px 8px 0 0
  min-width: 100px
  font-size: 15px
  border-top: 1px solid $alfa_friendly_background_medium
  border-left: 1px solid $alfa_friendly_background_medium
  border-right: 1px solid $alfa_friendly_background_medium
  margin-right: 2px
  transition: all 0.2s ease

  &:hover
    background-color: $alfa_friendly_light_blue
    transform: translateY(-2px)

    &:hover
      transform: none

.tabs-window
  padding: 16px
  background-color: $alfa_friendly_background_ultra_light
  border: 1px solid $alfa_friendly_background_medium
  border-top: none
  border-radius: 0 0 8px 8px
  @include thin-scrollbar
</style>