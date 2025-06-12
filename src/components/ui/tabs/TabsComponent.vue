<template>
  <div class="modern-tabs">
    <div class="tabs-container">
      <button
          v-for="(tab, index) in tabs"
          :key="tab.name"
          class="tab-button"
          :class="{ 'active': activeTab === index }"
          @click="handleClick(index, tab)"
      >
        <div class="tab-content">
          <span class="tab-label">{{ tab.label }}</span>
          <span class="counter">({{ tab.count }})</span>
        </div>
        <div v-if="activeTab === index" class="active-indicator"></div>
      </button>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, PropType } from "vue";

interface Tab {
  name: string;
  label: string;
  count?: number;
}

export default defineComponent({
  name: "ModernTabsComponent",
  props: {
    activeTab: {
      type: Number,
      required: true,
    },
    tabs: {
      type: Array as PropType<Tab[]>,
      required: true,
    },
    count: {
      type: Number,
      required: true,
    },
  },
  emits: ["update:activeTab", "tab-changed"],

  methods: {
    handleClick(index: number, tab: Tab) {
      this.$emit("update:activeTab", index);
      this.$emit("tab-changed", tab.name);
    }
  }
});
</script>


<style lang="sass" scoped>
.modern-tabs
  width: 100%
  background-color: $alfa_friendly_background_hard
  height: $header-height
  @include flex(row, flex-start, stretch)
  position: relative
  border-bottom: 1px solid rgba($alfa_friendly_background_medium, 0.12)

.tabs-container
  @include flex(row, flex-start, stretch)
  height: 100%

.tab-button
  @include flex(row, center, center)
  background: transparent
  border: none
  padding: 0 24px
  cursor: pointer
  transition: all 0.15s ease
  color: rgba($alfa_friendly_white, 0.7)
  position: relative
  height: 100%
  min-width: 100px

  &:hover:not(.active)
    color: $alfa_friendly_white
    background: rgba($alfa_friendly_white, 0.04)

  &.active
    color: $alfa_friendly_white
    background: rgba($alfa_friendly_white, 0.08)

.tab-content
  @include flex(row, center, center)
  gap: 4px
  font-weight: 400

.tab-label
  font-weight: inherit

.counter
  color: rgba($alfa_friendly_white, 0.7)
  font-weight: 400

.active-indicator
  position: absolute
  bottom: 0
  left: 0
  width: 100%
  height: 2px
  background: $alfa_primary-blue
  transform-origin: center
  animation: slideIn 0.2s ease-out

@keyframes slideIn
  from
    transform: scaleX(0)
  to
    transform: scaleX(1)
</style>