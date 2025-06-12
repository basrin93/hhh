<template>
  <v-app>
    <v-container fluid class="pa-0">
      <v-sheet class="layout-wrapper" elevation="4">
        <v-row no-gutters>
          <!-- Панель управления -->
          <DetailsControl
              :is-collapsed="store.isSidebarCollapsed"
              :item-info="store.itemInfo"
              :active-tab="store.activeTab"
              :tabs="tabs"
              @toggle-panel="store.toggleSidebar"
              @update:active-tab="store.setActiveTab"
          />

          <!-- Контент -->
          <v-col class="content-area">
            <v-sheet class="top-panel" elevation="1">
              <Breadcrumbs
                  :items="store.breadcrumbItems"
              />
            </v-sheet>

            <v-sheet class="dynamic-content" elevation="2" :key="store.activeTab">
              <v-fade-transition mode="out-in">
                <component
                    :is="store.currentComponent"
                    :key="store.activeTab"
                    @update:loading="store.setLoading"
                />
              </v-fade-transition>

              <v-overlay
                  v-model="store.isLoading"
                  class="align-center justify-center"
                  persistent
              >
                <v-progress-circular indeterminate color="primary" />
              </v-overlay>
            </v-sheet>
          </v-col>
        </v-row>
      </v-sheet>
    </v-container>
  </v-app>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue'
import type {Tab} from '@/Domains/StockDetails/API/Main/SeizedPropertySidebarService'
import sidebarService from '@/Domains/StockDetails/API/Main/SeizedPropertySidebarService'
import DetailsControl from '@/Domains/StockDetails/Components/DetailsControls/DetailsControl.vue'
import Breadcrumbs from '@/components/ui/Breadcrumbs.vue'
import {useLayoutStore} from '@/Domains/StockDetails/Stores/stockdetails'

const store = useLayoutStore()
const tabs = ref<Tab[]>([])

onMounted(async () => {
  try {
    //@ts-ignore
    tabs.value = await sidebarService.fetchSidebarTabs()
  } catch (error) {
    console.error('Ошибка при загрузке табов:', error)
  }
})
</script>

<style lang="sass" scoped>
// Основной layout
.layout-wrapper
  @include flex(row)
  min-height: $content-height
  max-height: $content-height_max
  border-radius: 16px
  overflow: hidden
  background-color: $alfa_friendly_background_ultra_light
  box-shadow: 0 6px 20px rgba($alfa_friendly_background_hard, 0.05)

// Левая панель
.tabs-wrapper
  @include flex-col
  background-color: $alfa_friendly_white
  border-right: 1px solid $alfa_friendly_grey
  min-height: $content-height
  max-height: $content-height
  width: $panel-width
  transition: width 0.2s ease
  overflow: hidden

  &.collapsed
    width: $panel-collapsed-width

// Кнопка сворачивания
.collapse-button-wrapper
  @include flex(row, flex-end, center)
  padding: 12px
  border-bottom: 1px solid $alfa_friendly_grey
  background-color: $alfa_friendly_background_light
  height: 48px

  .collapse-btn
    margin: 0
    transition: transform 0.2s ease

    &:hover
      background-color: rgba($alfa_friendly_background_hard, 0.04)

// Правая часть
.content-area
  @include flex-col
  padding: 24px
  flex: 1
  background-color: $alfa_friendly_background_light
  @include thin-scrollbar

.top-panel
  @include flex(row, space-between, center)
  background-color: $alfa_friendly_white
  border-radius: 8px
  padding: 10px
  margin-bottom: 24px

.dynamic-content
  background-color: $alfa_friendly_white
  border-radius: 12px
  padding: 24px
  flex: 1
  position: relative
  min-height: calc(100vh - 48px)
  @include thin-scrollbar

// Адаптивность
@media (max-width: 960px)
  .tabs-wrapper
    position: fixed
    z-index: 100
    height: 100vh
    left: 0
    top: 0

    &.collapsed
      transform: translateX(-100%)

  .content-area
    padding: 16px

  .top-panel
    @include flex-col
    gap: 16px
</style>