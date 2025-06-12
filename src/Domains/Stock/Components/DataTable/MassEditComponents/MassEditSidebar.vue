<template>
  <div class="mass-edit-sidebar" :class="{ 'open': isOpen }">
    <div class="sidebar-header">
      <h2 class="header-title">
        Массовое редактирование ({{ itemsCount }})
      </h2>
      <v-btn icon @click="$emit('close')">
        <v-icon>mdi-close</v-icon>
      </v-btn>
    </div>

    <div class="sidebar-tabs">
      <v-btn
          variant="text"
          :class="{ 'active-tab': activeTab === 'fields' }"
          @click="$emit('set-tab', 'fields')"
          class="tab-button"
      >
        Выбор полей
      </v-btn>
      <v-btn
          variant="text"
          :class="{ 'active-tab': activeTab === 'values' }"
          @click="$emit('set-tab', 'values')"
          :disabled="!hasSelectedFields"
          class="tab-button"
      >
        Редактирование
      </v-btn>
    </div>

    <div class="sidebar-content">
      <!-- Вкладка выбора полей -->
      <div v-if="activeTab === 'fields'">
        <div v-if="massEditStore.isLoading" class="loading-container">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div class="field-list">
          <div v-for="field in massEditStore.fields" :key="field.code" class="field-item">
            <div class="checkbox-wrapper">
              <v-checkbox
                  v-model="massEditStore.selectedFieldCodes"
                  :value="field.code"
                  :label="field.value"
                  :disabled="itemsCount > 1 && !field.massChange"
                  hide-details
                  density="compact"
              />
            </div>
            <div v-if="itemsCount > 1 && !field.massChange" class="field-disabled-hint">
              <div class="custom-tooltip-wrapper">
                <v-icon
                    color="grey"
                    size="small"
                    @mouseenter="showTooltip = field.code"
                    @mouseleave="showTooltip = null"
                >
                  mdi-information-outline
                </v-icon>
                <div
                    v-show="showTooltip === field.code"
                    class="custom-tooltip"
                >
                  Изменение доступно только для одного объекта
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="actions-row">
          <v-btn
              color="primary"
              @click="$emit('set-tab', 'values')"
              :disabled="!hasSelectedFields"
              class="next-button"
          >
            Далее
            <v-icon right>mdi-chevron-right</v-icon>
          </v-btn>
        </div>
      </div>

      <!-- Вкладка редактирования значений -->
      <div v-if="activeTab === 'values'">
        <div class="back-button-container">
          <v-btn
              icon
              variant="text"
              @click="$emit('set-tab', 'fields')"
              class="back-button"
          >
            <v-icon>mdi-chevron-left</v-icon>
          </v-btn>
          <h3 class="values-title">Редактирование значений</h3>
        </div>

        <slot name="form-fields"></slot>
      </div>
    </div>

    <div class="sidebar-footer">
      <v-btn
          variant="outlined"
          @click="$emit('reset')"
          class="reset-button"
      >
        <v-icon left>mdi-refresh</v-icon>
        Сбросить
      </v-btn>

      <v-btn
          color="primary"
          @click="handleSave"
          :disabled="!canSave || isSaving || saveButtonDisabled"
          :loading="isSaving"
          class="save-button"
      >
        <v-icon left>mdi-content-save</v-icon>
        Сохранить
      </v-btn>
    </div>
  </div>
</template>

<script setup>
import {computed, inject, ref, watch} from 'vue';

const props = defineProps({
  isOpen: {
    type: Boolean,
    default: false
  },
  activeTab: {
    type: String,
    default: 'fields'
  },
  itemsCount: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits(['close', 'set-tab', 'reset', 'save']);

const showTooltip = ref(null);
const saveButtonDisabled = ref(false);
const massEditStore = inject('massEditStore');
const canSave = inject('canSave');
const isSaving = inject('isSaving');

const hasSelectedFields = computed(() => massEditStore.selectedFieldCodes.length > 0);

function handleSave() {
  if (saveButtonDisabled.value) return;
  saveButtonDisabled.value = true;
  emit('save');
}

watch(() => props.isOpen, (isOpen) => {
  if (isOpen) saveButtonDisabled.value = false;
});

watch(() => props.itemsCount, (newCount) => {
  if (newCount > 1) {
    massEditStore.selectedFieldCodes = massEditStore.selectedFieldCodes.filter(code => {
      const field = massEditStore.fields.find(f => f.code === code);
      return field && field.massChange;
    });
  }
}, {immediate: true});

</script>

<style lang="sass" scoped>
@import "../styles/massEditSidebar"

.field-item
  display: flex
  align-items: center
  margin-bottom: 8px

.checkbox-wrapper
  flex: 1

.field-disabled-hint
  margin-left: 8px
  display: flex
  align-items: center

.custom-tooltip-wrapper
  position: relative
  cursor: help

  .v-icon
    cursor: help
    pointer-events: auto
    z-index: 1

.custom-tooltip
  position: absolute
  right: 20px
  top: 50%
  transform: translateY(-50%)
  background-color: rgba(0, 0, 0, 0.8)
  color: white
  padding: 6px 10px
  border-radius: 4px
  font-size: 12px
  white-space: nowrap
  z-index: 1000
  pointer-events: none

  &::after
    content: ""
    position: absolute
    top: 50%
    right: -6px
    transform: translateY(-50%)
    border-width: 6px 0 6px 6px
    border-style: solid
    border-color: transparent transparent transparent rgba(0, 0, 0, 0.8)
</style>