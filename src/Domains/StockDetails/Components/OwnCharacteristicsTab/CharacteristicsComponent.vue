<template>
  <div class="table-content">
    <div class="sections-wrapper">
      <div
          v-for="(section, sectionIndex) in characteristics"
          :key="sectionIndex"
          class="section-block"
          :class="{
          'is-active': activeSection === sectionIndex,
          'is-collapsed': collapsedSections.includes(sectionIndex)
        }"
      >
        <div
            class="section-header"
            @click="toggleSection(sectionIndex)"
        >
          <div class="section-marker"></div>
          <h3 class="section-title">{{ section.title }}</h3>
          <div class="collapse-indicator">
            <svg
                class="chevron-icon"
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
              <path
                  d="M4 6L8 10L12 6"
                  stroke="currentColor"
                  stroke-width="1.5"
                  stroke-linecap="round"
                  stroke-linejoin="round"
              />
            </svg>
          </div>
        </div>

        <Transition name="collapse">
          <div
              v-show="!collapsedSections.includes(sectionIndex)"
              class="section-content"
          >
            <div class="items-wrapper">
              <TransitionGroup
                  name="items"
                  tag="div"
                  class="items-grid"
              >
                <div
                    v-for="(item, itemIndex) in section.items"
                    :key="itemIndex"
                    class="item-row"
                    :class="{
                    'is-editing': isEditing,
                    'is-active': isActiveField(sectionIndex, itemIndex)
                  }"
                >
                  <div class="item-content">
                    <label
                        :for="`input-${sectionIndex}-${itemIndex}`"
                        class="item-label"
                    >
                      {{ item.title }}
                    </label>
                    <div class="item-value">
                      <InputComponent
                          v-model="item.value"
                          :is-editing="isEditing"
                          :id="`input-${sectionIndex}-${itemIndex}`"
                          @blur="onValidateField(item)"
                          @focus="onFocusField(sectionIndex, itemIndex)"
                      />
                    </div>
                  </div>
                </div>
              </TransitionGroup>
            </div>
          </div>
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import InputComponent from '@/components/ui/inputs/InputComponent.vue'

interface CharacteristicItem {
  title: string
  value: string | number
}

interface CharacteristicSection {
  title: string
  items: CharacteristicItem[]
}

interface Props {
  characteristics: CharacteristicSection[]
  isEditing: boolean
}

const props = withDefaults(defineProps<Props>(), {
  isEditing: false
})

const emit = defineEmits<{
  'validate-field': [item: CharacteristicItem]
}>()

const activeSection = ref<number | null>(null)
const activeField = ref<{ section: number; item: number } | null>(null)
const collapsedSections = ref<number[]>([])

const isActiveField = (sectionIndex: number, itemIndex: number): boolean => {
  return activeField.value?.section === sectionIndex &&
      activeField.value?.item === itemIndex
}

const toggleSection = (sectionIndex: number) => {
  const index = collapsedSections.value.indexOf(sectionIndex)
  if (index === -1) {
    collapsedSections.value.push(sectionIndex)
  } else {
    collapsedSections.value.splice(index, 1)
  }
}

const onValidateField = (item: CharacteristicItem) => {
  emit('validate-field', item)
  activeField.value = null
}

const onFocusField = (sectionIndex: number, itemIndex: number) => {
  // При фокусе на поле автоматически разворачиваем секцию
  const index = collapsedSections.value.indexOf(sectionIndex)
  if (index !== -1) {
    collapsedSections.value.splice(index, 1)
  }

  activeSection.value = sectionIndex
  activeField.value = { section: sectionIndex, item: itemIndex }
}
</script>

<style lang="sass" scoped>
.sections-wrapper
  @include thin-scrollbar
  height: 100%
  overflow-y: auto
  padding: 24px

.section-block
  margin-bottom: 32px
  background: $alfa_friendly_background_ultra_light
  border: 1px solid $alfa_friendly_background_light
  box-shadow: -1px 1px 24px 0px rgba(34, 60, 80, 0.26)
  border-radius: 12px
  padding: 20px

  &:last-child
    margin-bottom: 0

  &.is-active
    .section-marker
      background: $alfa_primary-blue

    .section-title
      color: $alfa_primary-blue

  &.is-collapsed
    .chevron-icon
      transform: rotate(-90deg)

    .section-header:hover
      background: $alfa_friendly_background_light
      border-radius: 8px

.section-header
  @include flex(row, flex-start, center)
  margin-bottom: 16px
  gap: 12px
  padding: 8px
  margin: -8px
  margin-bottom: 8px
  cursor: pointer
  user-select: none
  transition: background-color 0.2s ease

  &:hover
    .collapse-indicator
      background: $alfa_friendly_background_light
      color: $alfa_primary-blue

.section-marker
  width: 4px
  height: 24px
  background: $alfa_friendly_background_medium
  border-radius: 2px
  transition: background 0.2s ease

.section-title
  font-size: 18px
  font-weight: 500
  color: $alfa_friendly_background_hard
  transition: color 0.2s ease
  flex-grow: 1

.collapse-indicator
  padding: 6px
  border-radius: 6px
  background: $alfa_friendly_background_light
  color: $alfa_friendly_background_hard
  transition: all 0.2s ease

  .chevron-icon
    transition: transform 0.2s ease

.section-content
  padding-left: 16px

.items-grid
  display: grid
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))
  gap: 16px

.item-row
  position: relative
  background: white
  border: 1px solid $alfa_friendly_background_light
  border-radius: 8px
  transition: border-color 0.2s ease

  &:hover
    border-color: $alfa_friendly_background_medium

  &.is-active
    border-color: $alfa_primary-blue
    box-shadow: 0 0 0 1px $alfa_primary-blue

    .item-label
      color: $alfa_primary-blue

.item-content
  padding: 12px

.item-label
  display: block
  font-size: 13px
  font-weight: 500
  color: $alfa_friendly_background_hard
  margin-bottom: 8px
  transition: color 0.2s ease

.item-value
  :deep(input)
    height: 32px
    padding: 4px 12px
    font-size: 13px
    width: 100%
    border-radius: 4px
    border: 1px solid $alfa_friendly_background_light
    transition: border-color 0.2s ease
    background: white

    &:focus
      border-color: $alfa_primary-blue
      box-shadow: 0 0 0 2px rgba($alfa_friendly_background_light, 0.5)

    &:disabled
      background: $alfa_friendly_background_light
      color: $alfa_friendly_background_hard
      border-color: transparent

// Упрощенная анимация сворачивания
.collapse-enter-active,
.collapse-leave-active
  transition: all 0.2s ease
  overflow: hidden

.collapse-enter-from,
.collapse-leave-to
  opacity: 0
  max-height: 0
</style>