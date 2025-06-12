<template>
  <div
      class="feed-item"
      :class="{ 'feed-item--unread': !item.read }"
      :data-item-id="item.uid"
      :data-read="item.read ? 'true' : 'false'"
      @click="handleClick"
  >
    <FeedDateMarker
        v-if="shouldShowDateMarker(item, index)"
        :date="item.created_at"
    />

    <v-card class="feed-card">
      <div class="feed-card-header">
        <v-avatar :color="store.getEventTypeStyle(item.event_type).color" size="36">
          <v-icon color="white">{{ store.getEventTypeStyle(item.event_type).icon }}</v-icon>
        </v-avatar>

        <div class="feed-card-title-container">
          <div class="feed-card-title">{{ item.title }}</div>
          <div class="feed-card-subtitle">
            <v-chip
                size="x-small"
                :color="store.getEventTypeStyle(item.event_type).color"
                class="mr-2"
            >
              {{ store.getEventTypeLabel(item.event_type) }}
            </v-chip>
            <span class="feed-card-time">{{ formatters.formatDateTime(item.created_at) }}</span>
          </div>
        </div>

        <div class="feed-card-status">
          <v-icon
              size="small"
              :color="item.read ? '$alfa_friendly_succes' : 'grey'"
              class="mr-1"
          >
            {{ item.read ? 'mdi-check-all' : 'mdi-check' }}
          </v-icon>
          <span class="feed-card-read-status">
            {{ item.read ? 'Прочитано' : 'Непрочитано' }}
          </span>
        </div>
      </div>

      <div class="feed-card-content">
        <div class="content-layout">
          <div class="description-section">
            <div
                class="feed-description"
                :class="{ 'feed-description--clickable': hasPropertyData, 'feed-description--loading': isNavigating }"
                @click.stop="handleDescriptionClick"
            >
              <v-icon v-if="hasPropertyData && !isNavigating" size="small" class="mr-1">mdi-open-in-new</v-icon>
              <v-progress-circular v-if="isNavigating" size="16" width="2" indeterminate class="mr-1"/>
              {{ item.description }}
            </div>
          </div>

          <div v-if="eventPayload" class="payload-section">
            <div class="payload-grid">
              <div v-for="(value, key) in eventPayload" :key="key" class="payload-item">
                <span class="payload-label">{{ formatters.formatPayloadKey(key) }}</span>
                <span class="payload-value">{{ formatters.formatPayloadValue(value) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import {computed, inject, nextTick, ref, watch} from 'vue';
import {isSameDay} from 'date-fns';
import FeedDateMarker from './FeedDateMarker.vue';
import {useTableRowClick} from '@/composables/useTableRowClick';

const props = defineProps({
  item: {
    type: Object,
    required: true
  },
  index: {
    type: Number,
    required: true
  }
});

const store = inject('feedStore');
const formatters = inject('formatters');
const { navigateToProperty } = useTableRowClick();

const isRead = computed(() => props.item && props.item.read);
const isNavigating = ref(false);

const eventPayload = computed(() => {
  if (!props.item || !props.item.payload) {
    return null;
  }
  try {
    const payload = typeof props.item.payload === 'string'
        ? JSON.parse(props.item.payload)
        : props.item.payload;

    return payload;
  } catch (e) {
    return null;
  }
});

const hasPropertyData = computed(() => {
  return props.item?.entity_uid;
});

function shouldShowDateMarker(item, index) {
  if (index === 0) return true;

  const currentDate = new Date(item.created_at);
  const prevDate = new Date(store.feedItems[index - 1].created_at);

  return !isSameDay(currentDate, prevDate);
}

function handleClick() {
  if (props.item && !props.item.read) {
    console.log(`Click on item ${props.item.uid}, marking as read`);
    store.markAsRead(props.item.uid);
  }
}

async function handleDescriptionClick(event) {
  if (!hasPropertyData.value || isNavigating.value) return;

  const selection = window.getSelection();
  const selectedText = selection ? selection.toString().trim() : '';

  if (selectedText.length > 0) {
    event.stopPropagation();
    return;
  }

  await navigateToProperty(
      props.item.entity_uid,
      event,
      (loading) => { isNavigating.value = loading; }
  );
}

watch(() => isRead.value, (newValue) => {
  if (newValue) {
    nextTick(() => {
      const element = document.querySelector(`[data-item-id="${props.item.uid}"]`);
      if (element) {
        element.setAttribute('data-read', 'true');
        element.classList.remove('feed-item--unread');
      }
    });
  }
}, { immediate: true });

</script>

<style lang="sass" scoped>
.feed-item
  margin-bottom: 16px
  animation: fadeIn 0.3s ease
  position: relative

  &--unread
    .feed-card
    border-left: 4px solid $alfa_primary-blue
    background-color: rgba(25, 118, 210, 0.03)

.feed-card
  transition: transform 0.2s, box-shadow 0.2s

  &:hover
    transform: translateY(-1px)
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1)

.feed-card-header
  @include flex(row, space-between, center)
  padding: 16px

.feed-card-title-container
  flex-grow: 1
  margin-left: 16px

.feed-card-title
  font-weight: 500
  font-size: 16px
  line-height: 1.2
  margin-bottom: 4px

.feed-card-subtitle
  @include flex(row, flex-start, center)
  font-size: 12px
  color: $alfa_friendly_background_medium

.feed-card-time
  font-size: 12px

.feed-card-actions
  display: flex
  align-items: center

.feed-card-status
  display: flex
  align-items: center
  font-size: 12px
  color: $alfa_friendly_background_medium

.feed-card-read-status
  font-size: 12px

.feed-card-content
  padding: 0 16px 16px

.content-layout
  display: flex
  gap: 20px
  flex-direction: column

.description-section
  flex: 1
  min-width: 0

.feed-description
  font-size: 14px
  color: rgba(0, 0, 0, 0.7)
  margin-bottom: 0
  display: flex
  align-items: center

  &--clickable
    cursor: pointer
    color: $alfa_primary-blue
    text-decoration: underline

  &--loading
    cursor: wait

.payload-section
  flex-shrink: 0
  background: $alfa_friendly_background_light
  border-radius: 6px
  padding: 12px

.payload-grid
  display: flex
  flex-direction: column
  gap: 6px

.payload-item
  display: flex
  justify-content: space-between
  font-size: 12px
  line-height: 1.3

.payload-label
  font-weight: 500
  color: rgba(0, 0, 0, 0.6)
  margin-right: 8px

.payload-value
  color: rgba(0, 0, 0, 0.8)
  text-align: right
  word-break: break-word

@keyframes fadeIn
  from
    opacity: 0
    transform: translateY(10px)
  to
    opacity: 1
    transform: translateY(0)
</style>