<template>
  <div class="realization-tab">
    <div v-if="isInitializing" class="initialization-loader">
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </div>

    <!-- Если режим редактирования выключен, показываем общую заглушку для всего компонента -->
    <InProgress
        v-else-if="!isEditModeEnabled"
        message="Раздел находится в разработке"
        icon="mdi-pencil-off-outline"
        class="mt-4"
    />

    <!-- Когда режим редактирования включен, отображаем полный функционал компонента -->
    <template v-else>
      <PropertyEditorToolbar
          :is-editing="isEditing"
          :is-saving="isSaving"
          :is-form-valid="isFormValid"
          @edit="startEditing"
          @save="saveForm"
          @cancel="cancelEditing"
      />

      <v-card class="mt-4">
        <v-card-title class="pa-4 subtitle-1">
          Данные о реализации
        </v-card-title>

        <v-card-text v-if="isLoading">
          <v-progress-linear indeterminate color="primary"></v-progress-linear>
          <div class="text-center py-4">Загрузка данных...</div>
        </v-card-text>

        <v-card-text v-else-if="hasError" class="text-center py-4 error--text">
          Ошибка загрузки данных
        </v-card-text>

        <v-card-text v-else>
          <!-- Используем v-simple-table для обоих режимов -->
          <v-simple-table dense @mousedown="!isEditing && handleReadOnlyFieldClick">
            <template v-slot:default>
              <thead>
              <tr>
                <th>Параметр</th>
                <th>Значение</th>
              </tr>
              </thead>
              <tbody>
              <tr>
                <td>Дата реализации</td>
                <td>
                  <!-- Режим просмотра для даты -->
                  <template v-if="!isEditing">
                    {{ formattedDate || 'Не указана' }}
                  </template>
                  <!-- Режим редактирования для даты -->
                  <v-form v-else ref="formRef" v-model="formValid">
                    <v-menu
                        v-model="dateMenu"
                        :close-on-content-click="false"
                        transition="scale-transition"
                        offset-y
                        bottom
                    >
                      <template v-slot:activator="{ on, attrs }">
                        <v-text-field
                            v-model="formattedDate"
                            prepend-icon="mdi-calendar"
                            v-bind="attrs"
                            v-on="on"
                            dense
                            hide-details
                            placeholder="ДД.ММ.ГГГГ"
                            @input="handleSimpleDateInput"
                        ></v-text-field>
                      </template>
                      <v-date-picker
                          v-model="formState.realizationDate"
                          @input="dateMenu = false"
                      ></v-date-picker>
                    </v-menu>
                  </v-form>
                </td>
              </tr>
              <tr>
                <td>Цена реализации</td>
                <td>
                  <!-- Режим просмотра для цены -->
                  <template v-if="!isEditing">
                    {{ formState.realizationPrice ? formatPrice(formState.realizationPrice) : 'Не указана' }}
                  </template>
                  <!-- Режим редактирования для цены -->
                  <v-form v-else>
                    <v-text-field
                        v-model="displayPrice"
                        type="text"
                        dense
                        hide-details
                        :rules="priceRules"
                        @keypress="priceFormatter.filterNumericInput"
                        @paste="handlePricePaste"
                        @focus="priceFormatter.setCursorToEnd"
                        @input="handlePriceInput"
                        placeholder="Цена в рублях"
                    ></v-text-field>
                  </v-form>
                </td>
              </tr>
              </tbody>
            </template>
          </v-simple-table>
        </v-card-text>
      </v-card>

      <v-snackbar
          v-model="showEditHint"
          :timeout="3000"
          color="info"
          top
      >
        Чтобы редактировать данные, нажмите кнопку "Редактировать"
        <template v-slot:action="{ attrs }">
          <v-btn
              color="white"
              text
              v-bind="attrs"
              @click="startEditing"
          >
            Редактировать
          </v-btn>
          <v-btn
              color="white"
              text
              v-bind="attrs"
              @click="showEditHint = false"
          >
            Закрыть
          </v-btn>
        </template>
      </v-snackbar>
    </template>
  </div>
</template>

<script setup lang="ts">
import {computed, getCurrentInstance, onMounted, ref, watch} from 'vue'
import PropertyEditorToolbar from '@/components/ui/PropertyEditorToolbar.vue'
import {usePropertyDetailStore} from '@/Domains/StockDetails/Stores/PropertyDetailStore'
import RealizationService from '@/Domains/StockDetails/API/Realization/RealizationService'
import {useAuthenticatedRequest} from '@/composables/Auth/useAuthenticatedRequest'
import {useFeatures} from '@/composables/useFeatures'
import {useFormattedNumber} from '@/composables/Main/useFormattedNumber'
import InProgress from '@/components/ui/banners/InProgress.vue'

const { proxy } = getCurrentInstance();
const route = proxy.$route;

const { isEnabled } = useFeatures();
const isEditModeEnabled = isEnabled('EDIT_MODE').value;

const apiClient = useAuthenticatedRequest({
  baseURL: window.SERVICE_ENVS?.API_URL || ''
});

const formRef = ref(null)
const formValid = ref(true)
const isEditing = ref(false)
const isSaving = ref(false)
const showEditHint = ref(false)
const dateMenu = ref(false)
const isInitializing = ref(true)
const displayPrice = ref('')

const propertyDetailStore = usePropertyDetailStore()

const formState = ref({
  realizationDate: null as string | null,
  realizationPrice: '' as string | null
})

const originalData = ref({
  realizationDate: null as string | null,
  realizationPrice: '' as string | null
})

// Форматирование цены для отображения
const formatPrice = (price: string | null): string => {
  if (!price) return 'Не указана';
  const numericValue = price.replace(/\D/g, '');
  const formatted = numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  return `${formatted} руб.`;
};

// Инициализируем форматтер для цены
const priceFormatter = useFormattedNumber('');

// Обработчик изменения цены
const handlePriceInput = (value: string) => {
  priceFormatter.updateValue(value);
  displayPrice.value = priceFormatter.formattedValue.value;
  formState.value.realizationPrice = priceFormatter.rawValue.value;
};

// Обработчик вставки для цены
const handlePricePaste = (event: ClipboardEvent) => {
  event.preventDefault();
  const pastedText = event.clipboardData?.getData('text') || '';
  
  // Извлекаем только цифры из вставленного текста
  const numericValue = pastedText.replace(/[^\d]/g, '');
  
  if (numericValue) {
    // Используем существующий форматтер
    priceFormatter.updateValue(numericValue);
    displayPrice.value = priceFormatter.formattedValue.value;
    formState.value.realizationPrice = priceFormatter.rawValue.value;
  }
};

const itemId = computed(() => route.query.uid as string || '')
const isLoading = computed(() => propertyDetailStore.getLoadingStatus(itemId.value))
const hasError = computed(() => !!propertyDetailStore.getError(itemId.value))
const propertyDetail = computed(() => propertyDetailStore.getPropertyDetail(itemId.value))
const isFormValid = computed(() => formValid.value)

const formattedDate = computed(() => {
  if (!formState.value.realizationDate) return ''

  const date = new Date(formState.value.realizationDate)
  return date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric'
  })
})

const priceRules = [
  (v: string) => {
    if (!v) return true
    // Валидация уже выполнена в форматтере, так что просто возвращаем true
    return true
  }
]

// Обработчик ввода даты в формате ДД.ММ.ГГГГ, ДД.ММ.ГГ, ДД/ММ/ГГГГ, ДД/ММ/ГГ
const handleSimpleDateInput = (value: string) => {
  if (!value) {
    formState.value.realizationDate = null
    return
  }

  // Единый regex для всех форматов с поддержкой . и /
  const dateRegex = /^(\d{1,2})[./](\d{1,2})[./](\d{2,4})$/
  const match = value.match(dateRegex)
  
  if (!match) return
  
  let [, day, month, yearStr] = match
  let year = parseInt(yearStr)
  
  // Преобразование 2-значного года в 4-значный
  if (year < 100) {
    year = year <= 30 ? 2000 + year : 1900 + year
  }
  
  const dayNum = parseInt(day)
  const monthNum = parseInt(month)
  
  // Проверка валидности даты
  if (monthNum >= 1 && monthNum <= 12 && dayNum >= 1 && dayNum <= 31) {
    const testDate = new Date(year, monthNum - 1, dayNum)
    if (testDate.getFullYear() === year && 
        testDate.getMonth() === monthNum - 1 && 
        testDate.getDate() === dayNum) {
      formState.value.realizationDate = `${year}-${monthNum.toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`
    }
  }
}

// Запрос данных напрямую через API
const fetchPropertyDataDirectly = async (id: string) => {
  try {
    if (!id) return null;
    return await apiClient.makeRequest(`v1/seized-property-items/${id}`, {
      method: 'GET'
    });
  } catch (error) {
    console.error('Ошибка при запросе данных:', error);
    return null;
  }
};

// Обновление формы данными
const updateFormData = (data: any) => {
  if (!data) return;

  formState.value = {
    realizationDate: data.realization_date || null,
    realizationPrice: data.realization_cost?.toString() || ''
  };

  // Обновляем форматтер для цены
  priceFormatter.updateValue(formState.value.realizationPrice);
  displayPrice.value = priceFormatter.formattedValue.value;

  originalData.value = { ...formState.value };
};

const loadData = async () => {
  try {
    if (!itemId.value) return;

    // Если режим редактирования выключен, не загружаем данные
    if (!isEditModeEnabled) {
      return;
    }

    const data = await fetchPropertyDataDirectly(itemId.value);

    if (data) {
      updateFormData(data);
    } else {
      await propertyDetailStore.fetchPropertyDetail(itemId.value);
      if (propertyDetail.value) {
        updateFormData(propertyDetail.value);
      }
    }
  } finally {
    isInitializing.value = false;
  }
};
const handleReadOnlyFieldClick = () => {
  if (!isEditing.value && isEditModeEnabled) {
    showEditHint.value = true
  }
};

const startEditing = () => {
  if (!isEditModeEnabled) return;

  isEditing.value = true
  showEditHint.value = false
};

const cancelEditing = () => {
  isEditing.value = false
  formState.value = { ...originalData.value }
  // Обновляем форматтер и дисплей при отмене редактирования
  priceFormatter.updateValue(formState.value.realizationPrice || '');
  displayPrice.value = priceFormatter.formattedValue.value;
};

const saveForm = async () => {
  if (!isEditModeEnabled || !formRef.value || !formRef.value.validate()) return;

  try {
    isSaving.value = true

    const updateData = {
      realization_cost: priceFormatter.numericValue.value || null,
      realization_date: formState.value.realizationDate
    }

    // Сохраняем данные
    await RealizationService.updateRealizationData(itemId.value, updateData)

    // Запрашиваем свежие данные
    const freshData = await fetchPropertyDataDirectly(itemId.value);

    if (freshData) {
      updateFormData(freshData);
    }

    propertyDetailStore.fetchPropertyDetail(itemId.value, true);

    isEditing.value = false;
  } catch (error) {
    console.error('Ошибка при сохранении:', error);
  } finally {
    isSaving.value = false;
  }
};

watch(itemId, (newId) => {
  if (newId) {
    isInitializing.value = true;
    loadData();
  }
}, { immediate: true });

onMounted(() => {
  if (itemId.value) {
    loadData();
  } else {
    isInitializing.value = false;
  }
});
</script>

<style scoped>
.realization-tab {
  padding: 16px;
  position: relative;
  min-height: 200px;
}

.initialization-loader {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  z-index: 10;
}

.v-menu__content{
  min-width: auto !important;
}
</style>