<template>
  <div class="leasing-agreements-tab">
    <div v-if="isLoading" class="loading-container">
      <v-progress-circular indeterminate color="primary" />
    </div>
    <v-card v-else class="agreements-card">
      <v-card-title class="py-3 px-4 d-flex align-center title-container">
        <div class="d-flex align-center">
          <v-icon size="20" class="mr-2" color="primary">mdi-file-document-outline</v-icon>
          <span>Договора лизинга</span>
          <v-chip
              v-if="agreements.length > 0"
              size="small"
              color="primary"
              variant="outlined"
              class="ml-2"
          >
            {{ agreements.length }}
          </v-chip>
        </div>
      </v-card-title>
      <v-divider></v-divider>
      <v-card-text class="pa-0">
        <div v-if="agreements.length === 0" class="no-data">
          <v-icon size="32" color="grey-lighten-1" class="mb-2">mdi-file-document-off-outline</v-icon>
          <p>Нет данных о договорах лизинга</p>
        </div>
        <div v-else class="table-wrapper">
          <v-data-table
              :headers="headers"
              :items="agreements"
              :items-per-page="10"
              class="leasing-table"
              :footer-props="{
                itemsPerPageText: 'Показать по',
                itemsPerPageOptions: [5, 10, 15, 20]
              }"
              density="comfortable"
          >
            <!-- Кастомные ячейки для форматирования -->
            <template v-slot:item.number="{ item }">
              <div class="font-weight-medium text-primary">{{ item.number }}</div>
            </template>

            <template v-slot:item.purchase_price="{ item }">
              <div class="text-right">{{ formatter.formatCurrency(item.purchase_price) }}</div>
            </template>

            <template v-slot:item.termination_date="{ item }">
              {{ formatter.formatDate(item.termination_date, false) }}
            </template>

            <template v-slot:item.seizure_date="{ item }">
              {{ formatter.formatDate(item.seizure_date, false) }}
            </template>
          </v-data-table>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup lang="ts">
import {onMounted, ref, watch} from 'vue';
import LeasingAgreementsService, {
  LeasingAgreement
} from '@/Domains/StockDetails/API/LeasingMainTab/LeasingAgreementsService';
import {formatter} from '@/utils/FormatterService';

const props = defineProps<{
  itemUid: string;
}>();

const isLoading = ref(true);
const agreements = ref<LeasingAgreement[]>([]);

// Определение заголовков таблицы
const headers = [
  { text: 'Номер договора', value: 'number', width: '150px', sortable: true },
  { text: 'Лизингополучатель', value: 'lessee.name', width: '180px' },
  { text: 'ИНН ЛП', value: 'lessee.inn', width: '120px' },
  { text: 'Лизингодатель', value: 'lessor.name', width: '180px' },
  { text: 'ИНН ЛД', value: 'lessor.inn', width: '120px' },
  { text: 'Поставщик', value: 'supplier.name', width: '180px' },
  { text: 'ИНН П', value: 'supplier.inn', width: '120px' },
  { text: 'Стоимость по ДКП', value: 'purchase_price', width: '150px', sortable: true, align: 'end' },
  { text: 'Дата расторжения', value: 'termination_date', width: '150px' },
  { text: 'Дата изъятия', value: 'seizure_date', width: '150px' }
];

const fetchAgreements = async () => {
  if (!props.itemUid) return;

  try {
    isLoading.value = true;
    const result = await LeasingAgreementsService.fetchLeasingAgreements(props.itemUid);
    console.log('Обработанные данные о договорах:', result);
    agreements.value = result;
  } catch (error) {
    console.error('Ошибка при загрузке договоров лизинга:', error);
    agreements.value = [];
  } finally {
    isLoading.value = false;
  }
};

onMounted(() => {
  console.log('LeasingAgreementsTab смонтирован, itemUid:', props.itemUid);
  fetchAgreements();
});

watch(() => props.itemUid, (newUid) => {
  console.log('itemUid изменился:', newUid);
  if (newUid) {
    fetchAgreements();
  }
});
</script>

<style scoped lang="sass">
.leasing-agreements-tab
  width: 100%

.loading-container
  display: flex
  justify-content: center
  align-items: center
  min-height: 200px

.no-data
  display: flex
  flex-direction: column
  justify-content: center
  align-items: center
  min-height: 160px
  color: $alfa_friendly_background_medium

.title-container
  display: flex
  justify-content: space-between
  align-items: center

.table-wrapper
  overflow-x: auto
  @include thin-scrollbar

.agreements-card
  background-color: $alfa_friendly_background_ultra_light
  box-shadow: none
  border-radius: 8px
  border: 1px solid rgba(0, 0, 0, 0.05)

:deep(.v-data-table)
  background-color: transparent

  .v-data-table__wrapper
    @include thin-scrollbar

  th
    font-weight: 500
    background-color: $alfa_friendly_background_light
    white-space: nowrap
    padding: 10px 16px
    font-size: 13px
    color: rgba(0, 0, 0, 0.7)
    border-bottom: 1px solid rgba(0, 0, 0, 0.08)

  td
    padding: 8px 16px
    font-size: 13px
    border-bottom: 1px solid rgba(0, 0, 0, 0.05)

  tr:hover
    background-color: rgba(25, 118, 210, 0.04)

  .v-data-footer
    border-top: 1px solid $alfa_friendly_background_light
    justify-content: flex-end
    padding: 8px 16px

    .v-data-footer__select
      margin-right: 16px

    .v-data-footer__pagination
      margin: 0 16px

  .v-data-table-header
    th
      user-select: none
</style>