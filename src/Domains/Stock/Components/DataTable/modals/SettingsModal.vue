<template>
  <v-dialog v-model="internalDialogState" max-width="800px">
    <v-card>
      <v-card-title class="d-flex align-center py-2 px-4">
        <v-icon class="mr-2">mdi-cog-outline</v-icon>
        Настройка отображения колонок
      </v-card-title>

      <v-divider></v-divider>

      <v-card-text class="py-4">
        <v-container fluid>
          <v-row dense>
            <!-- Группа обязательных колонок -->
            <template v-if="hasRequiredColumns">
              <v-col cols="12" class="pb-0">
                <div class="text-subtitle-2 grey--text">Обязательные колонки</div>
              </v-col>
              <v-col
                  v-for="header in requiredColumns"
                  :key="header.text"
                  cols="12"
                  sm="6"
                  md="4"
                  class="py-1"
              >
                <v-checkbox
                    v-model="header.visible"
                    :label="header.text"
                    disabled
                    dense
                    hide-details
                    class="mt-0"
                ></v-checkbox>
              </v-col>
              <v-col cols="12">
                <v-divider class="my-2"></v-divider>
              </v-col>
            </template>

            <!-- Группа настраиваемых колонок -->
            <v-col cols="12" class="pb-0">
              <div class="text-subtitle-2 grey--text">Настраиваемые колонки</div>
            </v-col>
            <v-col
                v-for="header in optionalColumns"
                :key="header.text"
                cols="12"
                sm="6"
                md="4"
                class="py-1"
            >
              <v-checkbox
                  v-model="header.visible"
                  :label="header.text"
                  dense
                  hide-details
                  class="mt-0"
              ></v-checkbox>
            </v-col>
          </v-row>
        </v-container>
      </v-card-text>

      <v-divider></v-divider>

      <v-card-actions class="py-2 px-4">
        <v-btn
            text
            @click="selectAll"
            :disabled="allSelected"
            class="text-body-2 font-weight-medium"
            color="primary"
        >
          <v-icon left size="18">mdi-check-all</v-icon>
          Выбрать все колонки
        </v-btn>
        <v-btn
            text
            @click="deselectAll"
            class="text-body-2 font-weight-medium mr-2"
        >
          <v-icon left size="18">mdi-close-box-multiple-outline</v-icon>
          Скрыть все колонки
        </v-btn>
        <v-spacer></v-spacer>
        <v-btn
            text
            @click="resetToDefault"
            class="mr-2"
            color="error"
        >
          Сбросить
        </v-btn>
        <v-btn
            text
            @click="cancelChanges"
            class="mr-2"
        >
          Отмена
        </v-btn>
        <v-btn
            color="primary"
            @click="applyChanges"
        >
          Применить
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
</template>

<script setup lang="ts">
import {computed, onMounted, ref, watch} from 'vue';
import {Header} from '@/types';
import {localStorageUtils} from '@/utils/modal/settingsStorage';

const props = defineProps<{
  headers: Header[];
  isDialogOpen: boolean;
}>();

const emit = defineEmits<{
  (e: 'update:isDialogOpen', value: boolean): void;
  (e: 'applySettings', headers: Header[]): void;
}>();

const localHeaders = ref<Header[]>([]);
const defaultHeaders = ref<Header[]>([]);

onMounted(() => {
  // Сохраняем исходное состояние как дефолтное
  defaultHeaders.value = JSON.parse(JSON.stringify(props.headers));

  // Применяем сохранённые настройки при первой загрузке
  const storedHeaders = localStorageUtils.applyStoredSettings(props.headers);
  localHeaders.value = storedHeaders;

  // Сразу применяем сохранённые настройки
  emit('applySettings', storedHeaders);
});

// Разделяем колонки на обязательные и опциональные
const requiredColumns = computed(() =>
    localHeaders.value.filter(header => header.required)
);

const optionalColumns = computed(() =>
    localHeaders.value.filter(header => !header.required)
);

const hasRequiredColumns = computed(() =>
    requiredColumns.value.length > 0
);

// Проверка состояния выбора
const allSelected = computed(() =>
    optionalColumns.value.every(header => header.visible)
);

function selectAll() {
  optionalColumns.value.forEach(header => {
    header.visible = true;
  });
}

function deselectAll() {
  optionalColumns.value.forEach(header => {
    header.visible = false;
  });
}

watch(
    () => props.headers,
    (newHeaders) => {
      const storedHeaders = localStorageUtils.applyStoredSettings(newHeaders);
      localHeaders.value = JSON.parse(JSON.stringify(storedHeaders));
    }
);

const internalDialogState = computed<boolean>({
  get() {
    return props.isDialogOpen;
  },
  set(value: boolean) {
    emit('update:isDialogOpen', value);
  },
});

function applyChanges() {
  localStorageUtils.saveColumnsSettings(localHeaders.value);

  // Применяем изменения
  emit('applySettings', localHeaders.value);
  emit('update:isDialogOpen', false);
  window.location.reload();
}

function cancelChanges() {
  // Восстанавливаем последние сохранённые настройки
  const storedHeaders = localStorageUtils.applyStoredSettings(props.headers);
  localHeaders.value = JSON.parse(JSON.stringify(storedHeaders));
  emit('update:isDialogOpen', false);
}

function resetToDefault() {
  // Сбрасываем к исходным настройкам
  localHeaders.value = JSON.parse(JSON.stringify(defaultHeaders.value));
  localStorageUtils.saveColumnsSettings(defaultHeaders.value);
  emit('applySettings', defaultHeaders.value);
  emit('update:isDialogOpen', false);
}
</script>

<style scoped lang="sass">
.v-card-title
  border-bottom: 1px solid rgba(0, 0, 0, 0.12)

:deep(.v-input--checkbox)
  margin-top: 0
  padding-top: 0
</style>