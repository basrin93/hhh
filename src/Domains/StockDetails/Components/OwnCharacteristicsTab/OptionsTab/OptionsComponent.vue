<template>
  <div class="table-content">
    <v-snackbar
        v-model="showEditHint"
        :timeout="3000"
        color="info"
        location="top"
    >
      Чтобы редактировать данные, нажмите кнопку "Редактировать"
      <template v-slot:actions>
        <v-btn
            v-if="canEditStock"
            color="white"
            variant="text"
            @click="startEditing"
        >
          Редактировать
        </v-btn>
        <v-btn
            color="white"
            variant="text"
            @click="showEditHint = false"
        >
          Закрыть
        </v-btn>
      </template>
    </v-snackbar>

    <PropertyEditorToolbar
        v-if="hasVehicleType"
        :is-editing="isEditing"
        :is-saving="optionsStore.isSaving"
        :is-form-valid="isFormValid"
        @edit="startEditing"
        @save="saveForm"
        @cancel="cancelEditing"
    />

    <v-form ref="formRef" v-model="formValid">
      <v-card v-if="hasVehicleType && optionsStore.getOptions.length && tabsList.length > 0">
        <v-tabs
            v-model="activeTabIndex"
            color="primary"
            align-tabs="start"
            :mandatory="true"
            :selected-class="'v-tab--selected'"
        >
          <v-tab
              v-for="(tab, index) in tabsList"
              :key="index"
              :value="index"
          >
            {{ tab.title }}
          </v-tab>
        </v-tabs>

        <v-card-text>
          <div v-for="(tab, index) in tabsList" :key="tab.id">
            <div v-show="activeTabIndex === index" class="section-block">
              <div class="section-items-grid">
                <div
                    v-for="item in groupedOptions[tab.id]"
                    :key="item.option_sysname"
                    :class="{'full-width-row': item.option_sysname === 'description', 'compact-row': item.option_sysname !== 'description'}"
                >
                  <div class="compact-label">
                    {{ item.option_name }}
                    <span v-if="item.is_required" class="required-field">*</span>
                  </div>

                  <div
                      :class="{'full-width-value': item.option_sysname === 'description', 'compact-value': item.option_sysname !== 'description'}"
                      @mousedown="!isEditing && handleReadOnlyFieldClick()"
                  >
                    <v-select
                        v-if="item.option_sysname === 'color'"
                        v-model="formState[item.option_sysname]"
                        :items="colorItems"
                        :disabled="!isEditing"
                        density="comfortable"
                        item-title="text"
                        item-value="value"
                        :error="isFieldInvalid(item)"
                        :error-messages="getErrorMessage(item)"
                        @update:model-value="(value) => handleFieldUpdate(item.option_sysname, value)"
                    >
                      <template #prepend-inner>
                        <div
                            class="color-preview mr-2"
                            :style="{
                                  backgroundColor: getFirstColorCode(optionsStore.getColorOptions.find(c => c.uid === formState[item.option_sysname])?.code),
                                  width: '20px',
                                  height: '20px',
                                  borderRadius: '4px',
                                  border: '1px solid #ddd'
                                }"
                        />
                      </template>
                    </v-select>

                    <v-select
                        v-else-if="isArrayType(item.input_type) && item.option_values.length"
                        v-model="formState[item.option_sysname]"
                        :items="formatSelectItems(item.option_values)"
                        :disabled="!isEditing"
                        density="comfortable"
                        item-title="text"
                        item-value="value"
                        :key="`select-${item.option_sysname}-${formState[item.option_sysname]}`"
                        :error="isFieldInvalid(item)"
                        :error-messages="getErrorMessage(item)"
                        @update:model-value="(value) => handleFieldUpdate(item.option_sysname, value)"
                    />

                    <v-checkbox
                        v-else-if="item.input_type === 'bool'"
                        v-model="formState[item.option_sysname]"
                        :disabled="!isEditing"
                        density="comfortable"
                        hide-details
                        @update:model-value="(value) => handleFieldUpdate(item.option_sysname, value)"
                    />

                    <v-text-field
                        v-else-if="item.option_sysname === 'owners_count'"
                        v-model="formState[item.option_sysname]"
                        type="text"
                        maxlength="2"
                        :disabled="!isEditing"
                        density="comfortable"
                        :placeholder="getPlaceholderText('Количество владельцев', 'Введите число (макс. 99)')"
                        :rules="numericRules"
                        :error="isFieldInvalid(item)"
                        :error-messages="getErrorMessage(item)"
                        @update:model-value="(value) => handleFieldUpdate(item.option_sysname, value)"
                        @keypress="filterNumericInput"
                    />

                    <v-text-field
                        v-else-if="item.option_sysname === 'mileage'"
                        v-model="formState[item.option_sysname]"
                        type="text"
                        maxlength="8"
                        :disabled="!isEditing"
                        density="comfortable"
                        :placeholder="getPlaceholderText('Пробег', 'Введите пробег (макс. 99 999 999)')"
                        :rules="numericRules"
                        :error="isFieldInvalid(item)"
                        :hint="formState[item.option_sysname] && parseInt(formState[item.option_sysname], 10) > 1000000 ? mileageHint : ''"
                        :persistent-hint="showMileageWarning"
                        :error-messages="getErrorMessage(item)"
                        @update:model-value="(value) => handleMileageUpdate(item.option_sysname, value)"
                        @keypress="filterNumericInput"
                    />

                    <v-text-field
                        v-else-if="item.option_sysname === 'engine_hours'"
                        v-model="formState[item.option_sysname]"
                        type="text"
                        maxlength="8"
                        :disabled="!isEditing"
                        density="comfortable"
                        :placeholder="getPlaceholderText('Наработка', 'Введите наработку (макс. 99 999 999)')"
                        :rules="numericRules"
                        :error="isFieldInvalid(item)"
                        :hint="formState[item.option_sysname] && parseInt(formState[item.option_sysname], 10) > 100000 ? engineHoursHint : ''"
                        :persistent-hint="showEngineHoursWarning"
                        :error-messages="getErrorMessage(item)"
                        @update:model-value="(value) => handleEngineHoursUpdate(item.option_sysname, value)"
                        @keypress="filterNumericInput"
                    />

                    <v-text-field
                        v-else-if="item.input_type === 'int'"
                        v-model="formState[item.option_sysname]"
                        type="text"
                        :disabled="!isEditing"
                        density="comfortable"
                        :placeholder="getPlaceholderText('Число', 'Введите число')"
                        :rules="numericRules"
                        :error="isFieldInvalid(item)"
                        :error-messages="getErrorMessage(item)"
                        @update:model-value="(value) => handleFieldUpdate(item.option_sysname, value)"
                        @keypress="filterNumericInput"
                    />

                    <v-textarea
                        v-else-if="item.option_sysname === 'description'"
                        v-model="formState[item.option_sysname]"
                        :disabled="!isEditing"
                        :counter="10000"
                        maxlength="10000"
                        :placeholder="getPlaceholderText('Описание', 'Введите описание (макс. 10000 символов)')"
                        :rows="3"
                        density="comfortable"
                        :error="isFieldInvalid(item)"
                        :error-messages="getErrorMessage(item)"
                        @update:model-value="(value) => handleFieldUpdate(item.option_sysname, value)"
                    />

                    <v-text-field
                        v-else
                        v-model="formState[item.option_sysname]"
                        :disabled="!isEditing"
                        density="comfortable"
                        :placeholder="getPlaceholderText('Значение', 'Введите значение')"
                        :error="isFieldInvalid(item)"
                        :error-messages="getErrorMessage(item)"
                        @update:model-value="(value) => handleFieldUpdate(item.option_sysname, value)"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </v-card-text>
      </v-card>

      <!-- Заглушка когда нет типа ТС -->
      <v-card v-else class="empty-state-card">
        <v-card-text class="text-center pa-8">
          <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-car-off</v-icon>
          <div class="text-h6 mb-2">Опции недоступны</div>
          <div class="text-body-2 text-grey">Укажите тип транспортного средства для отображения доступных опций</div>
        </v-card-text>
      </v-card>
    </v-form>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, PropType, ref, watch} from 'vue'
import PropertyEditorToolbar from '@/components/ui/PropertyEditorToolbar.vue'
import type {CategoryOption} from '@/types/options'
import {useOptionsStore} from '@/Domains/StockDetails/Stores/options'
import {usePropertyOptions} from '@/composables/Options/usePropertyOptions'
import {usePermissions} from '@/composables/Permissions/usePermissions'
import {vehicleType} from '@/Domains/StockDetails/API/Main/SeizedPropertyDetailService'

const props = defineProps({
  options: {
    type: Array as PropType<CategoryOption[]>,
    required: true
  }
})

const optionsStore = useOptionsStore();
const { can } = usePermissions();
const canEditStock = computed(() => can('stock:edit'));

const showEditHint = ref(false);
const formRef = ref(null);
const formValid = ref(true);
const showMileageWarning = ref(false);
const showEngineHoursWarning = ref(false);

const mileageHint = "Введен пробег больше 1 млн. км, проверьте значение";
const engineHoursHint = "Введена наработка больше 100 тыс. м.ч., проверьте значение";

// Используем реактивное состояние из сервиса
const hasVehicleType = computed(() => vehicleType.value !== null);

const getPlaceholderText = (neutralText: string, editableText: string) => {
  return canEditStock.value ? editableText : neutralText;
};

const handleMileageUpdate = (field, value) => {
  handleFieldUpdate(field, value);
  showMileageWarning.value = value && parseInt(value, 10) > 1000000;
};

const handleEngineHoursUpdate = (field, value) => {
  handleFieldUpdate(field, value);
  showEngineHoursWarning.value = value && parseInt(value, 10) > 100000;
};

const {
  formState,
  isEditing,
  activeTabIndex,
  tabsList,
  groupedOptions,
  colorItems,
  getFirstColorCode,
  initializeForm,
  handleFieldUpdate,
  isFieldInvalid,
  getErrorMessage,
  startEditing,
  cancelEditing,
  saveChanges,
  isArrayType,
  formatSelectItems
} = usePropertyOptions(props.options);

const hasErrors = computed(() => {
  if (!hasVehicleType.value) return false;

  for (const tabId in groupedOptions.value) {
    const options = groupedOptions.value[tabId] || [];
    for (const item of options) {
      if (isFieldInvalid(item)) {
        return true;
      }
    }
  }
  return false;
});

const isFormValid = computed(() => {
  return formValid.value && !hasErrors.value;
});

const saveForm = () => {
  if (!canEditStock.value) return;

  if (formRef.value) {
    const isValid = formRef.value.validate();
    if (isValid && !hasErrors.value) {
      saveChanges();
    }
  }
};

const numericRules = [
  (value) => {
    if (!value) return true;
    const onlyDigits = /^[0-9]+$/.test(value);
    if (!onlyDigits) return 'Допускаются только цифры';
    if (value.length > 1 && value.startsWith('0')) {
      return 'Некорректный формат данных';
    }
    return true;
  }
];

const filterNumericInput = (e: KeyboardEvent) => {
  const char = String.fromCharCode(e.keyCode || e.charCode);
  if (!/^[0-9]$/.test(char)) {
    e.preventDefault();
  }
};

const handleReadOnlyFieldClick = () => {
  if (!isEditing.value && canEditStock.value) {
    showEditHint.value = true;
  }
};

watch(() => props.options, () => {
  if (hasVehicleType.value) {
    initializeForm();
  }
}, {deep: true});

onMounted(() => {
  if (hasVehicleType.value) {
    initializeForm();
  }
});

const origStartEditing = startEditing;
const origCancelEditing = cancelEditing;

startEditing = () => {
  if (!canEditStock.value) return;
  origStartEditing();
};

cancelEditing = () => {
  origCancelEditing();
};
</script>

<style scoped lang="sass">
.section-block
  padding: 1rem 0
  min-height: 300px

.section-items-grid
  display: grid
  grid-template-columns: minmax(180px, 2fr) 3fr
  grid-auto-rows: minmax(48px, auto)
  align-items: flex-start
  gap: 1rem
  padding: 0.25rem
  border-radius: 4px
  transition: background-color 0.2s ease

.full-width-row
  grid-column: 1 / -1
  display: grid
  grid-template-columns: 6fr
  gap: 1rem
  width: 100%
  order: 1

.empty-state-card
  min-height: 300px
  display: flex
  align-items: center

:deep(.v-tabs)
  position: sticky
  top: -15px
  z-index: 7
  background: #FFFFFF
  border-bottom: 1px solid #E9EEF4
  padding: 8px 16px 0

:deep(.v-tab)
  padding: 12px 20px
  border-radius: 8px 8px 0 0
  background: transparent
  color: #707376!important
  font-weight: 500
  text-transform: none
  letter-spacing: 0
  transition: all 0.2s ease
  border-top: 1px solid $alfa_friendly_background_medium
  border-left: 1px solid $alfa_friendly_background_medium
  border-right: 1px solid $alfa_friendly_background_medium
  margin: 0 2px 0 4px

  &:hover
    background: rgba(25, 118, 210, 0.08)
    color: #1976d2

.v-tab--active
  color: $alfa_friendly_background_hard!important

:deep(.v-card-text)
  min-height: 400px
  position: relative

:deep(.v-card-text > div)
  position: absolute
  width: 100%
  top: 0
  left: 0
  height: 100%

.v-text-field .v-messages__message
  color: orange !important
</style>