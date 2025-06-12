<template>
  <div class="valuation-history-component">
    <div v-if="canAddValuation">
      <div class="d-flex mb-4 justify-space-between align-center">
        <h3 class="text-h5 font-weight-medium">История оценок</h3>
        <v-btn
            color="primary"
            :elevation="2"
            @click="showValuationDialog = true"
            :disabled="!canAddValuation"
            :class="{'disabled-button': !canAddValuation}"
        >
          <v-icon left class="mr-1">mdi-plus</v-icon>
          Добавить оценку
        </v-btn>
      </div>

      <!-- Таблица с историей оценок -->
      <v-card v-if="!isLoading" outlined class="table-container">
        <v-simple-table>
          <template v-slot:default>
            <thead>
            <tr>
              <th scope="col">Дата</th>
              <th scope="col">Оценка</th>
              <th scope="col">Нижняя граница рынка</th>
              <th scope="col">Причина</th>
              <th scope="col">Инициатор</th>
              <th scope="col">Комментарий</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="item in historyItems" :key="item.id || item.valuation_date">
              <td>{{ formatter.formatDate(item.valuation_date) }}</td>
              <td class="font-weight-bold green--text text--darken-1">{{ formatter.formatCurrency(item.valuation) }}</td>
              <td class="font-weight-bold blue--text text--darken-1">{{ formatter.formatCurrency(item.market_bottom) }}</td>
              <td>{{ formatter.formatText(item.reason?.name) }}</td>
              <td>{{ formatter.formatText(item.author?.name) }}</td>
              <td>{{ formatter.formatText(item.comment) }}</td>
            </tr>
            </tbody>
          </template>
        </v-simple-table>

        <div v-if="historyItems.length === 0" class="text-center grey--text pa-6">
          <div>Нет данных об оценках</div>
        </div>
      </v-card>

      <div v-else class="text-center pa-6">
        <v-progress-circular indeterminate color="primary"></v-progress-circular>
        <div class="mt-2">Загрузка данных...</div>
      </div>

      <!-- Диалог добавления оценки -->
      <v-dialog
          v-model="showValuationDialog"
          max-width="500"
          persistent
      >
        <v-card>
          <v-card-title class="primary white--text">
            Новая оценка
          </v-card-title>

          <v-card-text class="pt-4">
            <v-form ref="valuationForm" v-model="formValid">
              <v-text-field
                  v-model="formattedNumber.formattedValue"
                  label="Оценка"
                  required
                  @keypress="formattedNumber.filterNumericInput"
                  @paste="formattedNumber.handlePaste"
                  @input="formattedNumber.updateValue"
                  @focus="formattedNumber.setCursorToEnd"
                  type="text"
                  placeholder="Введите стоимость"
                  outlined
                  class="mb-2"
                  append-icon="mdi-currency-rub"
                  :rules="valNumberRules"
                  :hint="valNumberHint"
                  persistent-hint
              ></v-text-field>

              <v-select
                  v-model="selectedReasonValue"
                  :items="reasonItems"
                  item-text="name"
                  item-value="value"
                  label="Причина"
                  required
                  outlined
                  class="mb-2"
                  :rules="[v => !!v || 'Причина обязательна']"
              ></v-select>

              <v-textarea
                  v-model="valuationComment"
                  label="Комментарий"
                  placeholder="Введите комментарий (необязательно)"
                  rows="3"
                  outlined
                  :rules="valCommentRules"
                  :hint="valCommentHint"
                  persistent-hint
                  counter
                  maxlength="128"
              ></v-textarea>
            </v-form>
          </v-card-text>

          <v-divider></v-divider>

          <v-card-actions class="py-3">
            <v-spacer></v-spacer>
            <v-btn
                color="grey darken-1"
                text
                @click="closeValuationDialog"
                :disabled="isSubmitting"
            >
              Отменить
            </v-btn>
            <v-btn
                color="primary"
                :disabled="isSubmitting || !formValid"
                :loading="isSubmitting"
                @click="saveValuation"
            >
              Сохранить
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </div>

    <!-- Баннер "нет доступа" для наблюдателей -->
    <AccessRestricted
        v-else
        title="Доступ ограничен"
        message="У вас нет прав для просмотра истории оценок. Для получения доступа обратитесь к руководителю."
    />
  </div>
</template>

<script setup lang="ts">
import {computed, defineExpose, getCurrentInstance, onMounted, ref} from 'vue';
import ValuationService from '@/Domains/StockDetails/API/Valuation/ValuationService';
import {useFormattedNumber} from '@/composables/Main/useFormattedNumber';
import {useFormValidation} from '@/composables/Main/useFormValidation';
import {formatter} from '@/utils/FormatterService';
import {usePermissions} from '@/composables/Permissions/usePermissions';
import AccessRestricted from '@/components/ui/banners/AccessRestricted.vue';

const { proxy } = getCurrentInstance();
const { can } = usePermissions();

const canAddValuation = computed(() => can('card:valuation:add'));

const MAX_VALUATION_VALUE = 999999999;
const MAX_COMMENT_LENGTH = 128;

const formattedNumber = useFormattedNumber();
const formValidation = useFormValidation();

const valNumberRules = formValidation.createNumberValidationRules(MAX_VALUATION_VALUE);
const valCommentRules = formValidation.createTextValidationRules(MAX_COMMENT_LENGTH, false);

const valNumberHint = formValidation.getNumberValueHint(MAX_VALUATION_VALUE);
const valCommentHint = formValidation.getTextLengthHint(MAX_COMMENT_LENGTH);

const isLoading = ref(false);
const isSubmitting = ref(false);
const showValuationDialog = ref(false);
const formValid = ref(false);
const valuationForm = ref(null);

const reasonItems = ref([]);
const historyItems = ref([]);

const selectedReasonValue = ref(null);
const valuationComment = ref('');

const getItemUid = (): string => {
  return proxy.$route.query.uid as string || '';
};

const loadValuationHistory = async () => {
  if (!canAddValuation.value) return;

  const itemUid = getItemUid();
  if (!itemUid) return;

  isLoading.value = true;

  try {
    const response = await ValuationService.getValuationHistory(itemUid);

    if (response && response.items && Array.isArray(response.items)) {
      historyItems.value = response.items.sort((a, b) =>
          new Date(b.valuation_date).getTime() - new Date(a.valuation_date).getTime()
      );
    } else if (Array.isArray(response)) {
      historyItems.value = response.sort((a, b) =>
          new Date(b.valuation_date).getTime() - new Date(a.valuation_date).getTime()
      );
    } else {
      historyItems.value = [];
    }
  } catch (error) {
    historyItems.value = [];
  } finally {
    isLoading.value = false;
  }
};

const loadReasons = async () => {
  if (!canAddValuation.value) return;

  try {
    const response = await ValuationService.getValuationReasons();

    if (Array.isArray(response) && response.length > 0) {
      reasonItems.value = response;
    } else if (response && response.items && Array.isArray(response.items)) {
      reasonItems.value = response.items;
    } else {
      reasonItems.value = [
        { name: "Корректировка рыночной стоимости", value: "market_correction" },
        { name: "Первичная оценка", value: "initial_assessment" }
      ];
    }
  } catch (error) {
    reasonItems.value = [
      { name: "Корректировка рыночной стоимости", value: "market_correction" },
      { name: "Первичная оценка", value: "initial_assessment" }
    ];
  }
};

const saveValuation = async () => {
  if (!canAddValuation.value) return;

  const itemUid = getItemUid();
  if (!itemUid || !formValid.value) return;

  if (formattedNumber.numericValue.value > MAX_VALUATION_VALUE) {
    return;
  }

  if (valuationComment.value && valuationComment.value.length > MAX_COMMENT_LENGTH) {
    return;
  }

  isSubmitting.value = true;

  try {
    const selectedReason = reasonItems.value.find(r => r.value === selectedReasonValue.value);
    if (!selectedReason) {
      throw new Error('Не выбрана причина оценки');
    }

    const valuationData = {
      valuation: formattedNumber.numericValue.value,
      reason: {
        name: selectedReason.name,
        value: selectedReason.value
      },
      comment: valuationComment.value || undefined
    };

    await ValuationService.saveValuation(itemUid, valuationData);
    await loadValuationHistory();
    closeValuationDialog();
  } catch (error) {
    // Обработка ошибок
  } finally {
    isSubmitting.value = false;
  }
};

const closeValuationDialog = () => {
  showValuationDialog.value = false;
  formattedNumber.reset();
  selectedReasonValue.value = null;
  valuationComment.value = '';
};

const refreshData = () => {
  if (canAddValuation.value) {
    loadValuationHistory();
  }
};

defineExpose({
  refreshData
});

onMounted(() => {
  if (!canAddValuation.value) return;

  loadReasons();
  loadValuationHistory();
});
</script>

<style scoped>
.valuation-history-component {
  padding: 16px;
}

.table-container {
  max-height: 400px;
  overflow: auto;
  @include thin-scrollbar
}
</style>