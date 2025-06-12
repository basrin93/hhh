<template>
  <v-container fluid>
    <v-card>
      <TabsComponent
          :activeTab.sync="stockStore.activeTab"
          :tabs="stockStore.tabs"
          :count="stockStore.count"
          @tab-changed="stockStore.handleTabChange"
      />

      <v-card-title class="card-title">
        <SearchBar
            :value="stockStore.search"
            :loading="stockStore.isSearchLoading"
            @input="stockStore.onSearchInput"
            label="Поиск (ДЛ, VIN, Гос.номер, № Лота)"
            @resetSearch="stockStore.resetSearch"
        />
        <div class="toolbar-container">
          <ToolbarButtons
              :active-filters-count="filterDialogRef?.activeFiltersCount"
              :is-archive-tab="stockStore.currentStatusGroup === 'Archive'"
              :is-edit-mode="isEditMode"
              @downloadExcel="stockStore.handleExcelDownload"
              @openSettings="stockStore.openSettings"
              @openFilters="stockStore.openFilters"
              @uploadPrices="stockStore.handlePriceImport"
              @toggleEditMode="toggleEditMode"
          />
          <FilterDialog
              ref="filterDialogRef"
              :key="`filter-dialog-${stockStore.currentStatusGroup}`"
              :group="stockStore.currentStatusGroup"
          />
        </div>
      </v-card-title>
      <DataTable
          :headers="stockStore.visibleHeaders"
          :items="stockStore.formattedItems"
          :total-count="stockStore.count"
          :loading="stockStore.isLoading"
          :search-loading="stockStore.isSearchLoading"
          :sort-by="stockStore.sortBy"
          :sort-desc="stockStore.sortDesc"
          :search="stockStore.search"
          :footer-props="stockStore.footerProps"
          :is-edit-mode="isEditMode"
          @update:page="stockStore.handlePageChange"
          @update:items-per-page="stockStore.handleItemsPerPageChange"
          @update:sort="stockStore.handleSortChange"
          @save="handleSaveChanges"
          @cancel="cancelEditMode"
      />
      <SettingsModal
          :headers="stockStore.headers"
          :isDialogOpen.sync="stockStore.settingsDialog"
          @applySettings="stockStore.applySettings"
      />
      <ImportResultDialog
          :model-value="stockStore.showImportDialog"
          @update:model-value="stockStore.showImportDialog = $event"
          :is-loading="stockStore.isImportLoading"
          :result="stockStore.importResult"
          @close="stockStore.handleImportDialogClose"
      />
    </v-card>
  </v-container>
</template>

<script setup lang="ts">
import {onMounted, ref} from 'vue';
import {useStockStore} from '@/Domains/Stock/Stores/stockStore';

import TabsComponent from '@/components/ui/tabs/TabsComponent.vue';
import SearchBar from '@/components/ui/inputs/SearchBar.vue';
import ToolbarButtons from '@/Domains/Stock/Components/ToolbarButtons.vue';
import DataTable from '@/Domains/Stock/Components/DataTable/DataTable.vue';
import SettingsModal from '@/Domains/Stock/Components/DataTable/modals/SettingsModal.vue';
import FilterDialog from "@/Domains/Stock/Components/DataTable/modals/filters/FilterDialog.vue";
import ImportResultDialog from "@/Domains/Stock/Components/DataTable/modals/ImportResultDialog.vue";

const stockStore = useStockStore();
const filterDialogRef = ref(null);
const isEditMode = ref(false);

// Функции режима редактирования
async function toggleEditMode() {
  if (isEditMode.value) {
    cancelEditMode();
    return;
  }

  isEditMode.value = true;
}

function cancelEditMode() {
  isEditMode.value = false;
}

async function handleSaveChanges() {
  try {
    stockStore.isLoading = true;

    await stockStore.fetchData();

    isEditMode.value = false;
  } catch (error) {
    console.error('Ошибка при сохранении массовых изменений:', error);
  } finally {
    stockStore.isLoading = false;
  }
}

onMounted(async () => {
  try {
    await stockStore.initialize();
  } catch (error) {
    console.error('📄 TableView - ошибка инициализации:', error);
  }
});
</script>
<style lang="sass" scoped>
.improved-table
  .v-data-table
    border-collapse: collapse

:deep(td)
  text-wrap: nowrap

.toolbar-container
  position: relative

th
  background: $alfa_friendly_background_light
  font-weight: bold
  font-size: 14px
  border-bottom: 2px solid $alfa_friendly_grey

td
  font-size: 14px
  border-bottom: 1px solid $alfa_friendly_grey
  padding: 8px
  tr:hover
  background: rgba($alfa_friendly_background_light, 0.5)

td.numeric
  text-align: right

:deep(th), :deep(td)
  border: thin solid rgba($alfa_friendly_background_hard, 0.12)
  cursor: pointer

:deep(.input__search .v-input__slot)
  width: 400px
  margin: 0
  max-height: 36px

.card-title
  @include flex(row, space-between, center)

button
  margin-bottom: 14px

:deep(.v-data-table__wrapper)
  height: calc(100vh - #{$header-height} - 269px)
  @include thin-scrollbar

.action-buttons
  @include flex(row)
  gap: 10px
</style>