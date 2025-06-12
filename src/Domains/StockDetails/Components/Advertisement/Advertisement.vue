<template>
  <component :is="AdvertisementComponent">
    <v-card class="publication-status" elevation="2">
      <PropertyEditorToolbar
          :is-editing="isEditing"
          :is-saving="isSaving"
          @edit="startEditing"
          @save="saveForm"
          @cancel="cancelEditing"
      />

      <v-card-title class="d-flex justify-space-between align-center">
        <div class="d-flex align-center">
          <h2 class="text-h6 font-weight-medium">Статус публикации объявления</h2>
          <v-chip class="ml-4" color="success" size="small">{{ publishedCount }} опубликовано</v-chip>
        </div>
        <v-btn variant="text" icon size="small" @click="refreshStatuses">
          <v-icon>mdi-refresh</v-icon>
        </v-btn>
      </v-card-title>

      <v-card-text>
        <div class="platforms-grid">
          <div
              v-for="(item, index) in classifiedAds"
              :key="index"
              class="platform-item"
              :class="getStatusClass(item.status.code)"
          >
            <div class="platform-main">
              <div class="platform-info">
                <v-icon class="platform-icon" :color="getPlatformColor(item.classified.value)">
                  {{ getPlatformIcon(item.classified.value) }}
                </v-icon>
                <div>
                  <div class="platform-name">{{ item.classified.value }}</div>
                  <div class="platform-status">
                    <v-icon size="14" :color="getIconColor(item.status.code)">
                      {{ getIconName(item.status.code) }}
                    </v-icon>
                    <span class="ml-1">{{ item.status.value }}</span>
                  </div>
                </div>
              </div>

              <div class="platform-actions">
                <v-btn
                    v-if="item.link && !isEditing"
                    :href="item.link"
                    target="_blank"
                    variant="text"
                    size="small"
                    icon
                >
                  <v-icon>mdi-open-in-new</v-icon>
                </v-btn>
              </div>
            </div>

            <div v-if="isEditing && item.editable" class="platform-edit">
              <v-text-field
                  v-model="item.link"
                  label="Ссылка"
                  density="comfortable"
                  variant="outlined"
                  type="url"
                  :rules="[v => getIsUrlValid(v) || 'Неверный URL']"
                  prepend-inner-icon="mdi-link"
              />
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </component>
</template>

<script setup lang="ts">
import {computed, defineComponent, h, onMounted, ref} from 'vue';
import AdvertisementService from '@/Domains/StockDetails/API/AdvertisementTab/AdvertisementService';
import type {ClassifiedAd} from '@/types';
import PropertyEditorToolbar from '@/components/ui/PropertyEditorToolbar.vue'
import {useFeatures} from '@/composables/useFeatures';

const isEditing = ref(false)
const isSaving = ref(false)

// Создаем реальный компонент для случая, когда фича включена
const RealAdvertisementComponent = defineComponent({
  setup(_, { slots }) {
    return () => h('div', { class: 'advertisement-real-component' }, slots.default?.());
  }
});

// Использование компонента InProgress в зависимости от состояния фичи
const { getComponentOrBanner } = useFeatures();
const AdvertisementComponent = getComponentOrBanner('ADVERTISEMENT', RealAdvertisementComponent);

const props = defineProps<{
  itemUid: string;
  classifiedAds: ClassifiedAd[];
}>();

const classifiedAds = ref<ClassifiedAd[]>([])
const URL_REGEX = /^https?:\/\/.+/i;

const getClassifiedAds = async () => {
  classifiedAds.value = await AdvertisementService.getClassifiedAds(props.classifiedAds, props.itemUid)
}

onMounted(() => {
  getClassifiedAds();
});

const publishedCount = computed(() =>
    classifiedAds.value.filter(item => item.status.code?.toLowerCase() === "published").length
);

const getPlatformIcon = (platform: string): string => {
  const icons: Record<string, string> = {
    'Авито': 'mdi-cart-outline',
    'auto.ru': 'mdi-car',
    'Drom': 'mdi-car-sports'
  };
  return icons[platform] || 'mdi-web';
};

const getPlatformColor = (platform: string): string => {
  const colors: Record<string, string> = {
    'Авито': '#00A046',
    'auto.ru': '#FF4542',
    'Dром': '#0066CC'
  };
  return colors[platform] || '#666';
};

const getStatusClass = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "published": return "status-published";
    case "publicationprocess":
    case "moderation": return "status-pending";
    case "rejected":
    case "expired":
    case "blocked": return "status-error";
    default: return "";
  }
};

const getIconName = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "published": return "mdi-check-circle";
    case "publicationprocess":
    case "moderation": return "mdi-clock-outline";
    case "rejected":
    case "expired":
    case "blocked": return "mdi-alert-circle";
    default: return "mdi-information";
  }
};

const getIconColor = (status: string): string => {
  switch (status?.toLowerCase()) {
    case "published": return "success";
    case "publicationprocess":
    case "moderation": return "warning";
    case "rejected":
    case "expired":
    case "blocked": return "error";
    default: return "grey";
  }
};

const refreshStatuses = async () => {
  await getClassifiedAds();
};

const startEditing = () => {
  isEditing.value = true;
};

const saveForm = async () => {
  try {
    isSaving.value = true;
    await AdvertisementService.save(classifiedAds.value, props.itemUid);
    isEditing.value = false;
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
  } finally {
    isSaving.value = false;
  }
};

const cancelEditing = () => {
  isEditing.value = false;
  getClassifiedAds();
};

const getIsUrlValid = (value: string) => !!value && URL_REGEX.test(value);
</script>

<style scoped lang="sass">
.publication-status
  border-radius: 8px

.platforms-grid
  display: grid
  gap: 12px

.platform-item
  border: 1px solid #e0e0e0
  border-radius: 8px
  padding: 16px
  transition: all 0.2s ease

  &.status-published
    border-left: 4px solid #4CAF50

  &.status-pending
    border-left: 4px solid #FF9800

  &.status-error
    border-left: 4px solid #f44336

.platform-main
  display: flex
  justify-content: space-between
  align-items: center

.platform-info
  display: flex
  align-items: center
  gap: 12px

.platform-icon
  font-size: 24px

.platform-name
  font-weight: 500
  margin-bottom: 4px

.platform-status
  display: flex
  align-items: center
  font-size: 14px
  color: #666

.platform-edit
  margin-top: 16px
  padding-top: 16px
  border-top: 1px solid #e0e0e0
</style>