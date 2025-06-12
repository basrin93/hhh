<template>
  <div class="feed-header">
    <h1 class="feed-title">Лента событий</h1>
    <div class="feed-filters">
      <v-chip-group v-model="selectedEventType" mandatory>
        <v-chip
            v-for="eventType in eventTypes"
            :key="eventType.value"
            :value="eventType.value"
            filter
            :color="getChipColor(eventType.value)"
            :prepend-icon="getChipIcon(eventType.value)"
            @click="handleChipClick(eventType.value)"
        >
          {{ eventType.label }}
        </v-chip>
      </v-chip-group>
    </div>
    <div v-if="store.unreadCount > 0" class="feed-filters">
      <v-chip-group>
        <v-chip
            :color="primary"
            @click="readAll()"
        >
          Прочитать всё
        </v-chip>
      </v-chip-group>
    </div>
  </div>
</template>

<script setup lang="ts">
import { inject } from 'vue';
import { FeedEventType } from '@/Domains/Feed/Stores/Feed/feedStore';
const store = inject('feedStore');

const selectedEventType = inject('selectedEventType');
const eventTypes = inject('eventTypes');
const filterByEventType = inject('filterByEventType');

function getChipColor(value: number | null): string {
  if (value === null) return 'grey';

  const colors = {
    [FeedEventType.SeizedPropertyCreated]: 'success',
    [FeedEventType.ValuationAdded]: 'info',
    [FeedEventType.ResponsibleAssigned]: 'primary',
    [FeedEventType.StatusChanged]: 'error'
  };

  return colors[value] || 'grey';
}

function getChipIcon(value: number | null): string {
  if (value === null) return 'mdi-filter-variant';

  const icons = {
    [FeedEventType.SeizedPropertyCreated]: 'mdi-plus-circle',
    [FeedEventType.ValuationAdded]: 'mdi-currency-usd',
    [FeedEventType.ResponsibleAssigned]: 'mdi-account-plus',
    [FeedEventType.StatusChanged]: 'mdi-lock'
  };

  return icons[value] || 'mdi-bell';
}

function readAll() {
  store.readAll();
}

function handleChipClick(type: number | null) {
  selectedEventType.value = type;
  filterByEventType(type);
}
</script>

<style lang="sass" scoped>
.feed-header
  padding: 16px 24px
  border-bottom: 1px solid $alfa_friendly_background_light

.feed-title
  font-size: 24px
  font-weight: 500
  margin-bottom: 16px

.feed-filters
  @include flex(row, flex-start, center)
  gap: 8px
  overflow-x: auto
  padding-bottom: 8px
  @include thin-scrollbar
</style>