<template>
  <v-dialog v-model="modelValue" max-width="600px" persistent>
    <v-card>
      <v-card-title class="headline">
        Импорт оценок
      </v-card-title>

      <v-card-text class="pa-4">
        <template v-if="isLoading">
          <div class="text-center my-4">
            <AlphaLoader />
            <div class="mt-3">Обработка файла...</div>
          </div>
        </template>

        <template v-else>
          <div class="result-message">
            Добавлена оценка {{ result.processed }} из {{ result.all }}
            <span v-if="result.warning > 0">
              , {{ result.warning }} из которых {{ pluralize(result.warning, ['добавлена', 'добавлены', 'добавлены']) }} с предупреждением
            </span>
          </div>

          <div v-if="result.warning > 0 || result.failed > 0" class="details-section mt-3">
            <v-expansion-panels>
              <v-expansion-panel>
                <div class="v-expansion-panel__header">
                  Подробнее
                </div>
                <div class="v-expansion-panel__body scrollable-content">
                  <div
                      v-for="(item, index) in result.report"
                      :key="index"
                      class="report-item my-2"
                  >
                    <div class="font-weight-medium">
                      <span v-if="item.messageType === 'ERROR'" class="error-text">Ошибка: </span>
                      <span v-else class="warning-text">Предупреждение: </span>
                      {{ item.message }}
                    </div>
                    <div class="pl-4 mt-1">
                      <span class="font-italic">(VIN: {{ item.items.map(i => i.vin).join(', ') }})</span>
                    </div>
                  </div>
                </div>
              </v-expansion-panel>
            </v-expansion-panels>
          </div>
        </template>
      </v-card-text>

      <v-card-actions>
        <v-spacer></v-spacer>
        <v-btn
            color="primary"
            text
            @click="closeDialog"
            :disabled="isLoading"
        >
          Закрыть
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>
<script setup lang="ts">
import {defineEmits, defineProps} from 'vue';
import type {PriceImportResponse} from '@/services/Stock/api/Components/Valuation/PriceImportService';
import AlphaLoader from '@/components/ui/Loaders/AlphaLoader.vue';

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true
  },
  isLoading: {
    type: Boolean,
    default: false
  },
  result: {
    type: Object as () => PriceImportResponse,
    default: () => ({
      all: 0,
      processed: 0,
      successed: 0,
      failed: 0,
      warning: 0,
      report: []
    })
  }
});

const emit = defineEmits(['update:modelValue', 'close']);

// Функция для правильного склонения слов
function pluralize(count: number, forms: [string, string, string]): string {
  const cases = [2, 0, 1, 1, 1, 2];
  return forms[(count % 100 > 4 && count % 100 < 20) ? 2 : cases[Math.min(count % 10, 5)]];
}

function closeDialog() {
  emit('close');
  emit('update:modelValue', false);
}
</script>

<style lang="sass" scoped>
.error-text
  color: $alfa_friendly_red

.warning-text
  color: #FB8C00

.result-message
  font-size: 16px
  line-height: 1.5

.details-section
  margin-top: 16px

/* Дополнительные стили для гибких панелей */
.v-expansion-panel__header
  cursor: pointer
  padding: 12px 16px
  min-height: 48px
  display: flex
  align-items: center
  position: relative
  border-bottom: thin solid rgba(0, 0, 0, 0.12)

.v-expansion-panel__body
  padding: 16px
  transition: max-height 0.3s cubic-bezier(0.25, 0.8, 0.5, 1)
  overflow: hidden

.scrollable-content
  max-height: 300px
  overflow-y: auto
  scrollbar-width: thin
  scrollbar-color: $alfa_friendly_background_medium $alfa_friendly_background_light

  &::-webkit-scrollbar
    width: 8px

  &::-webkit-scrollbar-track
    background: $alfa_friendly_background_light

  &::-webkit-scrollbar-thumb
    background-color: $alfa_friendly_background_medium
    border-radius: 4px
</style>