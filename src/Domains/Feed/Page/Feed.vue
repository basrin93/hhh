<template>
  <div class="feed-page-container">
    <component :is="FeedPageComponent">
      <div class="feed-page">
        <div class="feed-container">
          <FeedHeader />

          <div class="feed-wrapper">
            <v-progress-linear v-if="store.isLoading" indeterminate color="primary"></v-progress-linear>

            <div v-if="store.isEmpty && !store.isLoading" class="feed-empty">
              <v-icon size="64" color="grey-lighten-1">mdi-bell-off</v-icon>
              <p class="text-subtitle-1 text-grey">{{ getEmptyMessage }}</p>
            </div>

            <FeedList v-else />
          </div>
        </div>

      </div>
    </component>
  </div>
</template>

<script setup lang="ts">
import {computed, defineComponent, h, onMounted, provide, ref} from 'vue';
import {FeedEventType, useFeedStore} from '@/Domains/Feed/Stores/Feed/feedStore';
import FeedHeader from '@/Domains/Feed/Components/FeedHeader.vue';
import FeedList from '@/Domains/Feed/Components/FeedList.vue';
import {useFeedFormatters} from '@/Domains/StockDetails/Composables/useFeedFormatters';
import {useFeatures} from '@/composables/useFeatures';

// Создаем реальный компонент для случая, когда фича включена
const RealFeedComponent = defineComponent({
  setup(_, { slots }) {
    return () => h('div', { class: 'feed-real-component' }, slots.default?.());
  }
});

// Использование компонента InProgress в зависимости от состояния фичи
const { getComponentOrBanner } = useFeatures();
const FeedPageComponent = getComponentOrBanner('FEED_PAGE', RealFeedComponent);

const store = useFeedStore();
const selectedEventType = ref<number | null>(null);
const selectedEvent = ref(null);
const eventDetailsDialog = ref(false);

provide('feedStore', store);
provide('selectedEventType', selectedEventType);
provide('selectedEvent', selectedEvent);
provide('eventDetailsDialog', eventDetailsDialog);
provide('formatters', useFeedFormatters());

// Computed messages
const getEmptyMessage = computed(() => {
  if (store.isFiltered) {
    return 'Нет событий выбранного типа';
  }
  return 'В ленте нет событий';
});
provide('emptyMessage', getEmptyMessage);

const eventTypes = [
  { label: 'Все', value: null },
  { label: 'Создание ИИ', value: FeedEventType.SeizedPropertyCreated },
  { label: 'Оценка', value: FeedEventType.ValuationAdded },
  { label: 'Назначение ответственного', value: FeedEventType.ResponsibleAssigned },
  { label: 'Статус "Расторгнут, изъят"', value: FeedEventType.StatusChanged }
];
provide('eventTypes', eventTypes);

// Methods
function openEventDetails(event) {
  selectedEvent.value = event;
  eventDetailsDialog.value = true;

  if (!event.read) {
    store.markAsRead(event.uid);
  }
}
provide('openEventDetails', openEventDetails);

function filterByEventType(type: number | null) {
  try {
    store.filterByEventType(type);
  } catch (error) {
    console.log(error);
  }
}
provide('filterByEventType', filterByEventType);

onMounted(async () => {
  try {
      await store.loadFeed(true);
  } catch (error) {
    console.error('Ошибка при загрузке ленты событий:', error);
  }
});
</script>

<style lang="sass" scoped>
.feed-page-container
  width: 100%
  height: 100%

.feed-page
  padding: 24px
  height: calc(100vh - #{$header-height})
  overflow: hidden
  min-width: 100vh
  margin: 0 auto

.feed-container
  display: flex
  flex-direction: column
  height: 100%
  background: $alfa_friendly_background_ultra_light
  border-radius: 12px
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.05)

.feed-wrapper
  flex-grow: 1
  overflow: hidden
  position: relative

.feed-empty
  height: 100%
  @include flex-col(center, center)
  text-align: center
  padding: 32px
</style>