<template>
  <div class="feed-list" ref="feedList">
    <FeedItem
        v-for="(item, index) in store.feedItems"
        :key="item.uid"
        :item="item"
        :index="index"
        ref="feedItems"
    />

    <div v-if="store.hasMore" class="feed-load-more">
      <v-btn
          variant="text"
          block
          color="primary"
          :loading="store.isLoading"
          @click="loadMore"
      >
        Загрузить ещё
      </v-btn>
    </div>
    <div v-if="!store.hasMore && !store.isEmpty" class="feed-load-more">
      <v-btn
          variant="text"
          disabled
          block
          color="primary"
      >
        Событий больше нет
      </v-btn>
    </div>

    <div ref="infiniteScrollTrigger" class="infinite-scroll-trigger"></div>
  </div>
</template>

<script setup lang="ts">
import { inject, onBeforeUnmount, onMounted, ref, nextTick, watch } from 'vue';
import FeedItem from './FeedItem.vue';

const store = inject('feedStore');
const feedList = ref<HTMLElement | null>(null);
const feedItems = ref<any[]>([]);
const infiniteScrollTrigger = ref<HTMLElement | null>(null);
let observer: IntersectionObserver | null = null;
let scrollTimeout: number | null = null;

function loadMore() {
  store.loadMore();
}

onMounted(async () => {
  await nextTick();

  // Настройка обсервера для бесконечной прокрутки
  if (infiniteScrollTrigger.value) {
    observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && !store.isLoading && store.hasMore) {
        loadMore();
      }
    }, { threshold: 0.5 });

    observer.observe(infiniteScrollTrigger.value);
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
    observer = null;
  }
  
  if (scrollTimeout !== null) {
    window.clearTimeout(scrollTimeout);
    scrollTimeout = null;
  }
});
</script>

<style lang="sass" scoped>
.feed-list
  height: 100%
  overflow-y: auto
  padding: 16px
  @include thin-scrollbar

.feed-load-more
  padding: 16px 0
  text-align: center

.infinite-scroll-trigger
  height: 10px
  width: 100%
</style>