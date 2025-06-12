<template>
  <div class="photo-tab">
    <AlphaLoader v-if="photoManager.isLoading.value" />

    <v-snackbar v-model="showSnackbar" :timeout="3000" color="info" location="top">
      {{ snackbarMessage }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showSnackbar = false">Закрыть</v-btn>
      </template>
    </v-snackbar>

    <InProgress v-if="!isPhotoManagementEnabled" />

    <template v-else>
      <!-- Тулбар показываем всегда когда есть слоты -->
      <div v-if="hasPhotoSlots" class="property-editor-toolbar">
        <div class="edit-actions" v-if="isEditing">
          <v-btn
              variant="contained"
              prepend-icon="mdi-check"
              :loading="photoManager.isSaving.value"
              class="save-button"
              @click="savePhotos"
              style="color: white !important"
              color="#232B34"
          >Сохранить</v-btn>
          <v-btn
              variant="outlined"
              prepend-icon="mdi-close"
              class="cancel-button"
              @click="cancelEditing"
          >Отмена</v-btn>
        </div>
        <div v-else-if="canEditPhotos" class="toolbar-controls">
          <v-btn
              variant="outlined"
              prepend-icon="mdi-pencil-outline"
              @click="startEditing"
              :disabled="!canEditPhotos"
              :class="{'disabled-button': !canEditPhotos}"
          >
            Редактировать
          </v-btn>
        </div>
      </div>

      <!-- Баннер только когда нет типа ТС -->
      <PhotoBanner
          type="no-type"
          :show="!photoManager.isLoading.value && !hasPhotoSlots && !loadError"
      />

      <!-- Баннер ошибки -->
      <PhotoBanner
          type="error"
          :error-message="loadError"
          :show="!!loadError"
      />

      <!-- Блок обязательных изображений - показываем всегда когда есть слоты -->
      <v-card v-if="hasPhotoSlots && !loadError" class="mb-4">
        <v-card-title class="text-subtitle-1 font-weight-medium pa-4">
          Обязательные изображения
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <div class="photo-slots-grid">
            <PhotoSlot
                v-for="slot in photoManager.requiredPhotoSlots.value"
                :key="slot.order"
                :slot-data="slot"
                :is-editing="isEditing"
                :photo="photoManager.getPhotoForSlot(slot.order)"
                @file-change="handleFileChange($event, slot.order)"
                @set-main="handleSetMainPhoto(slot.order)"
                @delete="handleDeletePhoto(slot.order)"
            />
          </div>
        </v-card-text>
      </v-card>

      <!-- Блок дополнительных изображений - показываем всегда когда есть слоты -->
      <v-card v-if="hasPhotoSlots && photoManager.additionalPhotoSlots.value.length > 0 && !loadError" class="mb-4">
        <v-card-title class="text-subtitle-1 font-weight-medium pa-4">
          Дополнительные изображения
        </v-card-title>
        <v-card-text class="pa-4 pt-0">
          <div class="photo-slots-grid">
            <PhotoSlot
                v-for="slot in photoManager.additionalPhotoSlots.value"
                :key="slot.order"
                :slot-data="slot"
                :is-editing="isEditing"
                :photo="photoManager.getPhotoForSlot(slot.order)"
                @file-change="handleFileChange($event, slot.order)"
                @set-main="handleSetMainPhoto(slot.order)"
                @delete="handleDeletePhoto(slot.order)"
            />
          </div>
        </v-card-text>
      </v-card>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, defineAsyncComponent, getCurrentInstance, onMounted, provide, ref} from 'vue';
import {PhotoManager} from '@/Domains/StockDetails/Components/Photo/service/PhotoManager';
import {useFeatures} from '@/composables/useFeatures';
import {usePermissions} from '@/composables/Permissions/usePermissions';

const AlphaLoader = defineAsyncComponent(() => import('@/components/ui/Loaders/AlphaLoader.vue'));
const PhotoSlot = defineAsyncComponent(() => import('@/Domains/StockDetails/Components/Photo/PhotoSlot.vue'));
const InProgress = defineAsyncComponent(() => import('@/components/ui/banners/InProgress.vue'));
const PhotoBanner = defineAsyncComponent(() => import('./banner/PhotoBanner.vue'));

const { proxy } = getCurrentInstance();
const route = proxy.$route;

// Проверяем включен ли функционал управления фотографиями
const { isEnabled } = useFeatures();
const isPhotoManagementEnabled = isEnabled('PHOTO_MANAGEMENT').value;

// Добавляем проверку прав доступа на основе пермишенов
const { can } = usePermissions();
const canEditPhotos = computed(() => can('card:photos:edit'));

// Состояние и флаги UI
const isEditing = ref(false);
const showSnackbar = ref(false);
const snackbarMessage = ref('');
const loadError = ref('');

function getPropertyUidFromUrl() {
  return route.query.uid as string || '';
}

const propertyUid = getPropertyUidFromUrl();
const photoManager = new PhotoManager(propertyUid);

// Проверяем наличие слотов фотографий (есть ли тип ТС)
const hasPhotoSlots = computed(() => {
  return photoManager.photoSlotDefinitions.value.length > 0;
});

// Проверяем наличие реальных фотографий (не placeholder'ов)
const hasRealPhotos = computed(() => {
  return photoManager.photos.value.some(photo => photo.url !== null && photo.url !== undefined);
});

// Предоставляем экземпляр PhotoManager и права доступа дочерним компонентам
provide('photoManager', photoManager);
provide('canEditPhotos', canEditPhotos);

// Обработчики событий компонента
const handleFileChange = async (file: File, slotNumber: number) => {
  if (!canEditPhotos.value) return;

  const result = await photoManager.uploadPhoto(file, slotNumber);
  showSnackbar.value = true;
  snackbarMessage.value = result.message || '';
};

const handleSetMainPhoto = (slotNumber: number) => {
  if (!canEditPhotos.value) return;

  const result = photoManager.setMainPhoto(slotNumber);
  showSnackbar.value = true;
  snackbarMessage.value = result.message || '';
};

const handleDeletePhoto = (slotNumber: number) => {
  if (!canEditPhotos.value) return;

  const result = photoManager.deletePhoto(slotNumber);
  showSnackbar.value = true;
  snackbarMessage.value = result.message || '';
};

const startEditing = () => {
  if (canEditPhotos.value) {
    isEditing.value = true;
  }
};

const cancelEditing = async () => {
  isEditing.value = false;
  const result = await photoManager.loadData();
  if (!result.success) {
    showSnackbar.value = true;
    snackbarMessage.value = result.error || 'Ошибка при загрузке данных';
  }
};

const savePhotos = async () => {
  if (!canEditPhotos.value) return;

  const result = await photoManager.savePhotos();

  showSnackbar.value = true;
  snackbarMessage.value = result.message || '';

  if (result.success) {
    isEditing.value = false;
  }
};

const retryLoad = async () => {
  loadError.value = '';
  const result = await photoManager.loadData();
  if (!result.success) {
    loadError.value = result.error || 'Ошибка при загрузке данных';
  }
};

onMounted(async () => {
  if (isPhotoManagementEnabled) {
    const result = await photoManager.loadData();
    if (!result.success) {
      loadError.value = result.error || 'Ошибка при загрузке данных';
    }
  }
});
</script>

<style lang="sass" scoped>
@import 'styles/photo-styles'
@include photo-tab-styles
</style>