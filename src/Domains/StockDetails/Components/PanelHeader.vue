<template>
  <div class="panel-header">
    <div class="header-content">
      <div class="characteristics-row">
        <CharacteristicCard
            v-for="(item, index) in quickInfo"
            :key="index"
            :label="item.label"
            :value="item.value"
            @update:value="(newValue) => updateItem(index, newValue)"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import CharacteristicCard from './CharacteristicCard.vue'

interface QuickInfoItem {
  label: string
  value: string
}

interface Props {
  quickInfo: QuickInfoItem[]
}

const props = defineProps<Props>()
const emit = defineEmits(['update:quickInfo'])

const updateItem = (index: number, newValue: string) => {
  const newQuickInfo = [...props.quickInfo]
  newQuickInfo[index] = { ...newQuickInfo[index], value: newValue }
  emit('update:quickInfo', newQuickInfo)
}
</script>

<style lang="sass" scoped>
.panel-header
  padding: 12px 0
  border-bottom: 1px solid $alfa_friendly_background_light
  background: $alfa_friendly_white

.header-content
  @include flex(row, space-between, flex-start)
  gap: 6px
  overflow: hidden

.characteristics-row
  @include flex(row, flex-start, stretch)
  gap: 8px
  flex-wrap: nowrap
  overflow-x: auto
  overflow-y: hidden!important
  width: 100%
  @include thin-scrollbar
  padding-bottom: 4px

  > *
    min-width: 180px
    max-width: 220px
    height: 100px
    flex-shrink: 0

.edit-actions
  @include flex(row)
  gap: 8px
  flex-shrink: 0

  :deep(.v-btn)
    background: #E9EEF4
    font-weight: 600
    font-size: 14px
</style>