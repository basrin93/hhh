<template>
  <div class="action-buttons">
    <!-- Кнопка редактирования -->
    <Button
        v-show="!isArchiveTab && !isEditMode"
        label="Редактировать"
        :icon="!canEdit ? 'mdi-lock' : 'mdi-pencil'"
        :class="{'disabled-button': !isEditFeatureEnabled || !canEdit}"
        :disabled="!isEditFeatureEnabled || !canEdit"
        @click="toggleEditMode"
    />

    <!-- Кнопка отмены редактирования -->
    <Button
        v-show="!isArchiveTab && isEditMode"
        label="Отмена редактирования"
        icon="mdi-close"
        color="error"
        @click="toggleEditMode"
    />

    <!-- Кнопка фильтров -->
    <Button
        id="filters-trigger"
        class="filter-button"
        :class="{'disabled-button': isEditMode}"
        label="Фильтры"
        icon="mdi-filter"
        :badge="activeFiltersCount"
        @click="openFilters"
        :disabled="isEditMode"
    />

    <!-- Кнопка параметров -->
    <Button
        label="Параметры"
        icon="mdi-cog"
        :class="{'disabled-button': isEditMode}"
        @click="openSettings"
        :disabled="isEditMode"
    />

    <!-- Кнопка скачивания Excel -->
    <Button
        label="Скачать Excel"
        icon="mdi-file-excel"
        :class="{'disabled-button': isEditMode}"
        @click="handleExcelDownload"
        :disabled="isEditMode"
    />

    <!-- Кнопка загрузки оценки -->
    <Button
        v-show="isValuationHistoryEnabled"
        label="Загрузить оценку"
        :icon="!canUploadValuation ? 'mdi-lock' : 'mdi-file-upload'"
        :class="{'disabled-button': isEditMode || !canUploadValuation}"
        @click="handlePriceImport"
        :disabled="isEditMode || !canUploadValuation"
    />

    <FilterDialog />
  </div>
</template>

<script setup lang="ts">
import Button from "@/components/ui/buttons/Button.vue";
import FilterDialog from "@/Domains/Stock/Components/DataTable/modals/filters/FilterDialog.vue";
import {useFeatures} from '@/composables/useFeatures';
import {usePermissions} from '@/composables/Permissions/usePermissions';
import {computed} from 'vue';

interface Props {
  activeFiltersCount?: number;
  isEditMode?: boolean;
  isArchiveTab?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  isEditMode: false,
  isArchiveTab: false
});

const emit = defineEmits<{
  (e: 'downloadExcel'): void;
  (e: 'openFilters'): void;
  (e: 'openSettings'): void;
  (e: 'uploadPrices'): void;
  (e: 'toggleEditMode'): void;
}>();

const { isEnabled } = useFeatures();
const { can } = usePermissions();

// Проверка прав доступа
const canEdit = computed(() => can('stock:edit'));
const canUploadValuation = computed(() => can('workplace:valuation:upload'));

const isValuationHistoryEnabled = isEnabled('VALUATION_HISTORY');
const isEditFeatureEnabled = isEnabled('EDIT_MODE');

function handleExcelDownload() {
  emit("downloadExcel");
}

function handlePriceImport() {
  emit("uploadPrices");
}

function openFilters() {
  emit("openFilters");
}

function openSettings() {
  emit("openSettings");
}

function toggleEditMode() {
  emit("toggleEditMode");
}
</script>

<style lang="sass" scoped>
.action-buttons
  @include flex(row, flex-end, center)
  gap: 8px

  :deep(.v-btn)
    height: 40px

.disabled-button
  opacity: 0.5
  cursor: not-allowed
</style>