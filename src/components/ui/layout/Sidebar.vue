<template>
  <v-navigation-drawer
      app
      permanent
      :mini-variant="isMini"
      class="sidebar"
      :class="{ 'mini-sidebar': isMini }"
      :style="{ zIndex: 1000 }"
  >
    <v-btn
        icon
        class="burger-btn"
        @click="toggleMini"
    >
      <v-icon>{{ isMini ? 'mdi-chevron-right' : 'mdi-chevron-left' }}</v-icon>
    </v-btn>

    <v-list>
      <v-list-item-group v-model="selectedItem" color="primary">
        <v-list-item
            v-for="(item, index) in visibleMenuItems"
            :key="index"
            link
            :class="{ active: isActive(item.route) }"
            @click="navigate(index, item.route)"
        >
          <v-tooltip v-if="isMini" right>
            <template #activator="{ on, attrs }">
              <v-list-item-icon v-bind="attrs" v-on="on">
                <v-icon>{{ item.icon }}</v-icon>
                <v-badge
                    v-if="item.route === '/feed' && unreadCount > 0"
                    :content="unreadCount"
                    color="error"
                    overlap
                ></v-badge>
              </v-list-item-icon>
            </template>
            <span>{{ item.title }}</span>
          </v-tooltip>

          <v-list-item-icon v-else>
            <v-icon>{{ item.icon }}</v-icon>
            <v-badge
                v-if="item.route === '/feed' && unreadCount > 0"
                :content="unreadCount"
                color="error"
                overlap
            ></v-badge>
          </v-list-item-icon>

          <v-list-item-content v-if="!isMini">
            <v-list-item-title>{{ item.title }}</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script setup lang="ts">
import { ref, watch, computed, getCurrentInstance, onMounted } from 'vue';
import { usePermissions } from '@/composables/Permissions/usePermissions';
import { useFeedStore } from '@/Domains/Feed/Stores/Feed/feedStore';

const { proxy } = getCurrentInstance();
const { can } = usePermissions();
const router = proxy.$router;
const feedStore = useFeedStore();

const isMini = ref(localStorage.getItem('sidebarMini') !== 'false');
const selectedItem = ref(0);

const menuItems = [
  { title: 'Главная', icon: 'mdi-home', route: '/car' },
  { title: 'Сток', icon: 'mdi-car-multiple', route: '/stock' },
  { title: 'Задачи', icon: 'mdi-clipboard-check-outline', route: '/tasks', permission: 'workplace:tasks:view' },
  { title: 'Отчёты', icon: 'mdi-chart-box-outline', route: '/reports', permission: 'workplace:reports:view' },
  { title: 'Лента событий', icon: 'mdi-bell-outline', route: '/feed' },
];

const visibleMenuItems = computed(() => {
  return menuItems.filter(item => {
    return !item.permission || can(item.permission);
  });
});

const unreadCount = computed(() => {
  return feedStore.unreadCount;
});

const currentPath = computed(() => proxy.$route.path);

function toggleMini() {
  isMini.value = !isMini.value;
  localStorage.setItem('sidebarMini', isMini.value.toString());
}

function navigate(index: number, routePath: string) {
  selectedItem.value = index;
  if (currentPath.value !== routePath) {
    router.push(routePath);
  }
}

function isActive(routePath: string) {
  return currentPath.value === routePath;
}

watch(
    () => currentPath.value,
    (newPath) => {
      const index = visibleMenuItems.value.findIndex((item) => item.route === newPath);
      if (index !== -1) {
        selectedItem.value = index;
      } else {
        selectedItem.value = null;
      }
    },
    { immediate: true }
);

onMounted(async () => {
  const storedMini = localStorage.getItem('sidebarMini');
  if (storedMini === null) {
    localStorage.setItem('sidebarMini', 'true');
  }
  await feedStore.getUnreadCount()
});
</script>

<style scoped lang="sass">
.sidebar
  z-index: 1000

.burger-btn
  margin: 10px

.mini-sidebar
  .v-list-item
    padding: 0
    cursor: pointer
</style>