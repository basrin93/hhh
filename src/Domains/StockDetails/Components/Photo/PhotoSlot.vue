<template>
  <div class="photo-slot" :class="{ 'photo-slot--editing': isEditing }">
    <!-- Заголовок слота -->
    <div class="photo-slot__header">
      <span class="photo-slot__number">{{ slotData.order }}</span>
      <span class="photo-slot__description">{{ slotData.description }}</span>
    </div>

    <div class="photo-slot__content">
      <!-- Если есть фото для этого слота -->
      <template v-if="photo && photo.url">
        <div class="photo-slot__image-container">
          <img
              :src="getPhotoUrl(photo.url)"
              :alt="photo.name || slotData.description"
              class="photo-slot__image"
          />

          <!-- Кнопки управления в режиме редактирования -->
          <template v-if="isEditing">
            <v-btn
                icon
                variant="flat"
                color="primary"
                size="small"
                class="photo-slot__main-btn"
                :class="{ 'photo-slot__main-btn--active': photo.is_main }"
                @click="$emit('set-main')"
            >
              <v-icon>mdi-star</v-icon>
            </v-btn>

            <v-btn
                icon
                variant="flat"
                color="error"
                size="small"
                class="photo-slot__delete-btn"
                @click="$emit('delete')"
            >
              <v-icon>mdi-delete</v-icon>
            </v-btn>
          </template>

          <!-- Индикатор главного фото (не в режиме редактирования) -->
          <div v-else-if="photo.is_main" class="photo-slot__main-indicator">
            <v-icon color="amber-darken-2">mdi-star</v-icon>
          </div>
        </div>
      </template>

      <!-- Пустой слот с возможностью загрузки в режиме редактирования -->
      <template v-else-if="isEditing">
        <div class="photo-slot__upload">
          <input
              type="file"
              class="photo-slot__file-input"
              :id="`file-input-${slotData.order}`"
              accept="image/*"
              @change="handleFileChange"
          />
          <v-btn
              variant="outlined"
              color="primary"
              size="small"
              prepend-icon="mdi-upload"
              @click="openFileDialog"
          >
            Выберите файл
          </v-btn>
        </div>
      </template>

      <!-- Пустой слот в режиме просмотра -->
      <template v-else>
        <div class="photo-slot__empty">
          <v-icon size="large" color="grey-lighten-1">mdi-image-off</v-icon>
          <span>Нет фото</span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import {defineEmits, defineProps, inject} from 'vue';
import {PhotoManager} from '@/Domains/StockDetails/Components/Photo/service/PhotoManager';

interface PhotoSlotProps {
  slotData: {
    order: number;
    description: string;
    is_required: boolean;
    url?: string | null;
  };
  isEditing: boolean;
  photo: {
    slot_number: number;
    name: string | null;
    url: string | null;
    is_main: boolean | null;
  } | null;
}

const props = defineProps<PhotoSlotProps>();
const emit = defineEmits(['file-change', 'set-main', 'delete']);

// Получаем экземпляр PhotoManager через инъекцию
const photoManager = inject<PhotoManager>('photoManager');
const minioHost = window['SERVICE_ENVS'].MINIO_HOST;

// Функция для обработки URL изображения с учетом возможного отсутствия PhotoManager
function getPhotoUrl(url: string | null): string | null {
  if (photoManager) {
    return photoManager.getProperImageUrl(url);
  } else {
    // Резервная логика для случая, когда photoManager не доступен
    if (!url) return null;

    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }

    if (url.startsWith('s3://')) {
      return url.replace('s3://', minioHost);
    }

    return url;
  }
}

// Открытие диалога выбора файла
function openFileDialog() {
  const fileInput = document.getElementById(`file-input-${props.slotData.order}`);
  if (fileInput) {
    fileInput.click();
  }
}

// Обработка выбора файла
function handleFileChange(event: Event) {
  const input = event.target as HTMLInputElement;
  if (input.files && input.files.length > 0) {
    emit('file-change', input.files[0]);
    input.value = '';
  }
}
</script>

<style lang="sass" scoped>
@import 'styles/photo-styles'
@include photo-slot-styles
</style>