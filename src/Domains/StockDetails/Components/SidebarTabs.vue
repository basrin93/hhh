<template>
  <div class="tabs-list" :class="{'collapsed': isCollapsed}">
    <div
        v-for="tab in tabs"
        :key="tab.id"
        @click="updateValue(tab.id)"
        :class="[
        'tab-item',
        { 'tab-item--active': tab.id === value },
        { 'tab-item--collapsed': isCollapsed }
      ]"
    >
      <template v-if="isCollapsed">
        <v-tooltip right>
          <template #activator="{ on, attrs }">
            <v-icon
                class="tab-icon"
                v-bind="attrs"
                v-on="on"
                :class="{ 'tab-icon--active': tab.id === value }"
            >{{ tab.icon }}</v-icon>
          </template>
          {{ tab.name }}
        </v-tooltip>
      </template>
      <template v-else>
        <v-icon
            class="tab-icon"
            :class="['mr-2', { 'tab-icon--active': tab.id === value }]"
        >{{ tab.icon }}</v-icon>
        <span class="tab-text">{{ tab.name }}</span>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Tab {
  id: number
  name: string
  icon: string
}

interface Props {
  tabs: Tab[]
  value: number
  isCollapsed: boolean
}

const props = defineProps<Props>()
const emit = defineEmits<{
  (e: 'input', value: number): void
}>()

const updateValue = (newValue: number) => {
  emit('input', newValue)
}
</script>

<style lang="sass" scoped>
=transition($props: all)
  transition: $props 0.2s ease

=flex-center
  display: flex
  align-items: center

.tabs-list
  padding: 12px
  flex: 1
  overflow-y: auto
  @include thin-scrollbar
  scrollbar-color: $alfa_friendly_background_medium $alfa_friendly_background_light

.tab-item
  +flex-center
  padding: 12px 16px
  margin-bottom: 4px
  border-radius: 8px
  cursor: pointer
  color: $alfa_friendly_background_hard
  +transition

  &:hover:not(.tab-item--active)
    background-color: rgba($alfa_friendly_background_hard, 0.04)
    .tab-icon
      color: $alfa_friendly_background_hard

  &--active
    background-color: $alfa_friendly_background_hard
    color: $alfa_friendly_white
    .tab-icon
      color: $alfa_friendly_white

  &--collapsed
    padding: 12px 0
    justify-content: center
    width: 100%
    position: relative
    background-color: transparent

    &:hover
      background-color: transparent
      .tab-icon
        border-color: $alfa_friendly_background_hard

    &.tab-item--active
      background-color: transparent
      .tab-icon
        color: $alfa_friendly_background_hard
        border-color: $alfa_friendly_background_hard

    .tab-icon
      margin: 0
      padding: 8px
      border: 1px solid transparent
      border-radius: 4px
      +transition(all)

.tab-icon
  font-size: 24px
  flex-shrink: 0
  +transition
  color: $alfa_friendly_background_hard

  &--active
    color: $alfa_friendly_white

.tab-text
  font-size: 0.95rem
  font-weight: 500
  margin-left: 12px
  +transition
</style>