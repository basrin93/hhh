<template>
  <div>
    <div v-if="selectedItems.length > 0" class="selected-count-bar">
      <div class="selected-count">Выбрано: {{ selectedItems.length }}</div>
      <v-btn
          color="primary"
          variant="tonal"
          @click="toggleSidebar"
          class="action-button"
          density="comfortable"
          :disabled="!canEdit"
          :class="{'disabled-button': !canEdit}"
      >
        <v-icon left>mdi-pencil-outline</v-icon>
        Редактировать
      </v-btn>
    </div>

    <MassEditSidebar
        :is-open="sidebarOpen"
        :active-tab="activeTab"
        :items-count="selectedItems.length"
        @close="closeSidebar"
        @set-tab="setActiveTab"
        @reset="resetForm"
        @save="saveChanges"
    >
      <template #form-fields>
        <MassEditFormFields />
      </template>
    </MassEditSidebar>

    <v-dialog v-model="showResultDialog" max-width="600">
      <v-card>
        <v-card-title class="pb-2">
          Результат массового редактирования
        </v-card-title>
        <v-card-text>
          <MassEditResultReport :result="editResult" />
        </v-card-text>
        <v-card-actions class="pt-0">
          <v-spacer></v-spacer>
          <v-btn
              color="primary"
              variant="tonal"
              @click="closeResultDialog"
          >
            Закрыть
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<script setup lang="ts">
import {computed, nextTick, provide, ref, watch} from 'vue';
import {useMassEditStore} from '@/Domains/Stock/Stores/massEditStore';
import EditableFieldsService from '@/Domains/Stock/API/EditableFieldsService';
import {SelectSearchService} from '@/components/ui/Searchbar/SelectSearchService';
import {usePermissions} from '@/composables/Permissions/usePermissions';
import MassEditResultReport from '@/Domains/Stock/Components/DataTable/MassEditComponents/MassEditResultReport.vue';
import MassEditSidebar from '@/Domains/Stock/Components/DataTable/MassEditComponents/MassEditSidebar.vue';
import MassEditFormFields from '@/Domains/Stock/Components/DataTable/MassEditComponents/MassEditFormFields.vue';

const props = defineProps({
  selectedItems: {
    type: Array,
    default: () => []
  },
  selectedStatuses: {
    type: Array,
    default: () => []
  }
});

const emit = defineEmits(['save', 'cancel']);
const massEditStore = useMassEditStore();
const filterNames = ['responsible_user'];
const searchService = new SelectSearchService(filterNames);
const searchValues = searchService.getSearchValues();
const { can } = usePermissions();

// Проверка прав доступа на редактирование
const canEdit = computed(() => can('stock:edit'));

const sidebarOpen = ref(false);
const activeTab = ref('fields');
const isSaving = ref(false);
const showResultDialog = ref(false);
const editResult = ref({
  all: 0,
  successed: 0,
  failed: 0,
  report: []
});

// Базовые правила валидации для переиспользования
const numericRules = [
  (value) => {
    if (value === null || value === undefined || value === '') return true;
    const strValue = String(value);
    const onlyDigits = /^[0-9]+$/.test(strValue);
    if (!onlyDigits) return 'Допускаются только цифры';
    if (strValue.length > 1 && strValue.startsWith('0')) {
      return 'Некорректный формат данных';
    }
    return true;
  }
];

const mileageRules = [
  ...numericRules,
  (value) => {
    if (value === null || value === undefined || value === '') return true;
    if (value && parseInt(String(value), 10) >= 1000000) {
      return 'Введен пробег больше 1 млн. км, проверьте значение';
    }
    return true;
  }
];

const ownersCountRules = [
  v => v === null || v === undefined || v === '' || (Number.isInteger(Number(v)) && v >= 0 && v <= 99) || 'Введите целое число от 0 до 99'
];

const canSave = computed(() => {
  return massEditStore.selectedFieldCodes.some(code =>
      massEditStore.formState[code] !== null &&
      massEditStore.formState[code] !== undefined
  );
});

const getFilteredUsers = computed(() => {
  const searchQuery = searchValues.responsible_user?.toLowerCase() || '';

  if (!searchQuery || !massEditStore.userOptions?.length) {
    return massEditStore.userOptions || [];
  }

  return massEditStore.userOptions.filter(user => {
    const nameMatch = (user.name || '').toLowerCase().includes(searchQuery);
    const cityMatch = user.city ? user.city.toLowerCase().includes(searchQuery) : false;
    return nameMatch || cityMatch;
  });
});

// Предоставляем все необходимые данные и методы дочерним компонентам
provide('searchService', searchService);
provide('searchValues', searchValues);
provide('massEditStore', massEditStore);
provide('selectedStatuses', props.selectedStatuses);
provide('numericRules', numericRules);
provide('mileageRules', mileageRules);
provide('ownersCountRules', ownersCountRules);
provide('getFilteredUsers', getFilteredUsers);
provide('canSave', canSave);
provide('isSaving', isSaving);
provide('loadUsersOnClick', loadUsersOnClick);
provide('loadKeysCountOnClick', loadKeysCountOnClick);
provide('filterNumericInput', filterNumericInput);
provide('canEdit', canEdit);

watch(sidebarOpen, async (isOpen) => {
  if (isOpen && massEditStore.fields.length === 0) {
    await massEditStore.loadFields();
  }
});

watch(activeTab, async (newTab) => {
  if (newTab === 'values') {
    if (massEditStore.selectedFieldCodes.includes('status')) {
      await massEditStore.loadStatusOptions(props.selectedStatuses);
    }
  }
});

for (const filterName of filterNames) {
  watch(() => searchValues[filterName], () => {}, { immediate: true });
}

function toggleSidebar() {
  if (!canEdit.value) return;
  sidebarOpen.value = !sidebarOpen.value;
}

function closeSidebar() {
  sidebarOpen.value = false;
  massEditStore.resetForm();
  activeTab.value = 'fields';
  searchService.clearAllSearches();
}

function setActiveTab(tab) {
  activeTab.value = tab;
}

function resetForm() {
  massEditStore.resetForm();
  activeTab.value = 'fields';
  searchService.clearAllSearches();
}

function filterNumericInput(e) {
  const char = String.fromCharCode(e.keyCode || e.charCode);
  if (!/^[0-9]$/.test(char)) {
    e.preventDefault();
  }
}

async function closeResultDialog() {
  showResultDialog.value = false;

  await nextTick();

  // Исправлено: проверяем, что хотя бы одна запись была успешно обработана
  if (editResult.value.successed > 0) {
    massEditStore.resetForm();
    closeSidebar();
    emit('save');
  }
}

async function saveChanges() {
  if (!canEdit.value) return;

  const preparedItems = props.selectedItems.map(item => {
    const rows = [];

    for (const fieldCode of massEditStore.selectedFieldCodes) {
      const value = massEditStore.formState[fieldCode];

      if (value !== null && value !== undefined) {
        if (fieldCode === 'status') {
          const statusCode = typeof value === 'object' && value?.code ? value.code : value;
          rows.push({
            code: fieldCode,
            change: statusCode
          });
        } else if (fieldCode === 'responsible_user') {
          const userUid = typeof value === 'object' && value?.uid ? value.uid : value;
          rows.push({
            code: fieldCode,
            change: userUid
          });
        } else {
          rows.push({
            code: fieldCode,
            change: String(value)
          });
        }
      }
    }

    return {
      uid: item.uid,
      rows
    };
  });

  try {
    isSaving.value = true;

    // Очищаем предыдущий результат
    editResult.value = {
      all: 0,
      successed: 0,
      failed: 0,
      report: []
    };

    const response = await EditableFieldsService.saveMassChanges(preparedItems);
    editResult.value = response;
    showResultDialog.value = true;
  } catch (error) {
    console.error('Ошибка сохранения:', error);

    // Показываем диалог с ошибкой
    editResult.value = {
      all: props.selectedItems.length,
      successed: 0,
      failed: props.selectedItems.length,
      report: [{
        message: 'Произошла ошибка при сохранении',
        rows: []
      }]
    };
    showResultDialog.value = true;
  } finally {
    isSaving.value = false;
  }
}

function loadUsersOnClick() {
  if (massEditStore.userOptions.length === 0) {
    massEditStore.loadUsers();
  }
}

function loadKeysCountOnClick() {
  if (massEditStore.keysCountOptions.length === 0) {
    massEditStore.loadKeysCount();
  }
}
</script>

<style lang="sass" scoped>
@import "../../styles/massEditSidebar"

.disabled-button
  opacity: 0.5
  cursor: not-allowed
</style>