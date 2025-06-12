<template>
  <v-col :class="['controls-wrapper', {'collapsed': isCollapsed}]" cols="auto">
    <div class="collapse-button-wrapper">
      <v-btn
          icon
          variant="text"
          size="small"
          @click="$emit('toggle-panel')"
          class="collapse-btn"
      >
        <v-icon size="20">
          {{ isCollapsed ? 'mdi-chevron-right' : 'mdi-chevron-left' }}
        </v-icon>
      </v-btn>
    </div>

    <ProfileCard
        v-bind="characteristicsStore.profileInfo"
        :is-collapsed="isCollapsed"
    />

    <SidebarTabs
        :value="activeTab"
        @input="$emit('update:active-tab', $event)"
        :tabs="tabs"
        :is-collapsed="isCollapsed"
    />
  </v-col>
</template>
<script setup lang="ts">
import {getCurrentInstance, onMounted, onUnmounted} from 'vue'
import ProfileCard from '@/Domains/StockDetails/Components/ProfileCard.vue'
import SidebarTabs from '@/Domains/StockDetails/Components/SidebarTabs.vue'
import {useCharacteristicsStore} from '@/Domains/StockDetails/Stores/characteristics'
import SeizedPropertyStateService from '@/Domains/StockDetails/API/Main/SeizedPropertyShortState'

const characteristicsStore = useCharacteristicsStore()
const { proxy } = getCurrentInstance();
const route = proxy.$route;

interface Props {
  isCollapsed: boolean
  itemInfo?: Record<string, any>
  activeTab: number
  tabs: Array<any>
}

defineProps<Props>()
defineEmits(['toggle-panel', 'update:active-tab'])

onMounted(async () => {
  // Получаем параметры напрямую из query
  const uid = route.query.uid as string;
  const status = route.query.status as string;

  // Если есть UID объекта, загружаем данные
  if (uid) {
    try {
      console.log('Загрузка данных состояния объекта:', uid);
      const stateData = await SeizedPropertyStateService.fetchPropertyState(uid);

      // Если был передан код статуса, добавляем его в данные состояния
      if (status && !stateData.stateCode) {
        stateData.stateCode = status;
      }

      characteristicsStore.setPropertyState(stateData);
    } catch (error) {
      console.error('Ошибка загрузки данных:', error);
    }
  }
});

onUnmounted(() => {
  characteristicsStore.resetState();
});
</script>
<style lang="sass" scoped>
.controls-wrapper
  background-color: $alfa_friendly_white
  border-right: 1px solid $alfa_friendly_grey
  min-height: $content-height
  max-height: $content-height
  width: $panel-width
  transition: width 0.2s ease
  @include flex-col
  overflow: hidden

  &.collapsed
    width: $panel-collapsed-width

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

@media (max-width: 960px)
  .controls-wrapper
    position: fixed
    z-index: 100
    height: 100vh
    left: 0
    top: 0

    &.collapsed
      transform: translateX(-100%)
</style>