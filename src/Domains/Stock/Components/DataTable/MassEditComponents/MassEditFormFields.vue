<template>
  <div class="fields-form">
    <div v-if="massEditStore.selectedFieldCodes.includes('status')" class="form-field">
      <h4 class="field-label">Статус</h4>
      <v-select
          v-model="massEditStore.formState.status"
          :items="massEditStore.statusOptions"
          item-title="name"
          item-value="code"
          placeholder="Выберите статус"
          outlined
          dense
          :loading="massEditStore.isStatusLoading"
          return-object
      >
        <template v-slot:selection="{ item }">
          {{ item.name }}
          <span v-if="!item.isAvailableForAll" class="partial-available">
            (доступен не для всех записей)
          </span>
        </template>
        <template v-slot:item="{ item }">
          <v-list-item-title>
            {{ item.name }}
            <span v-if="!item.isAvailableForAll" class="partial-available">
              (доступен не для всех записей)
            </span>
          </v-list-item-title>
        </template>
      </v-select>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('responsible_user')" class="form-field">
      <h4 class="field-label">Ответственный</h4>
      <v-select
          v-model="massEditStore.formState.responsible_user"
          :items="filteredUsers"
          item-title="name"
          item-value="uid"
          placeholder="Выберите ответственного"
          outlined
          dense
          class="user-select"
          :loading="massEditStore.isUsersLoading"
          @click="loadUsersOnClick"
          return-object
      >
        <template v-slot:prepend-item>
          <SelectSearchField
              filter-name="responsible_user"
          />
        </template>
        <template v-slot:selection="{ item }">
          <div class="selection-content">
            {{ item.name }}
            <span v-if="item.city" class="city-label">
              ({{ item.city }})
            </span>
          </div>
        </template>
        <template v-slot:item="{ item }">
          <div class="item-content">
            <v-list-item-title class="user-name">
              {{ item.name }}
            </v-list-item-title>
            <v-list-item-subtitle v-if="item.city" class="user-city">
              {{ item.city }}
            </v-list-item-subtitle>
          </div>
        </template>
      </v-select>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('keys_count')" class="form-field">
      <h4 class="field-label">Количество ключей</h4>
      <v-select
          v-model="massEditStore.formState.keys_count"
          :items="massEditStore.keysCountOptions"
          item-title="text"
          item-value="value"
          placeholder="Выберите количество ключей"
          outlined
          dense
          :loading="massEditStore.isKeysCountLoading"
          @click="loadKeysCountOnClick"
      ></v-select>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('owners_count')" class="form-field">
      <h4 class="field-label">Количество владельцев</h4>
      <v-text-field
          v-model.number="massEditStore.formState.owners_count"
          placeholder="Введите количество владельцев"
          outlined
          dense
          type="number"
          min="0"
          :rules="ownersCountRules"
          @keypress="filterNumericInput"
          @input="validatePositiveNumber($event, 'owners_count')"
          @keydown="preventNegativeValues"
      ></v-text-field>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('mileage')" class="form-field">
      <h4 class="field-label">Пробег (км)</h4>
      <v-text-field
          v-model.number="massEditStore.formState.mileage"
          placeholder="Введите пробег"
          outlined
          dense
          type="number"
          min="0"
          :rules="positiveNumericRules"
          @keypress="filterNumericInput"
          @input="validatePositiveNumber($event, 'mileage')"
          @keydown="preventNegativeValues"
      ></v-text-field>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('engine_hours')" class="form-field">
      <h4 class="field-label">Наработка (м/ч)</h4>
      <v-text-field
          v-model.number="massEditStore.formState.engine_hours"
          placeholder="Введите наработку"
          outlined
          dense
          type="number"
          min="0"
          :rules="positiveNumericRules"
          @keypress="filterNumericInput"
          @input="validatePositiveNumber($event, 'engine_hours')"
          @keydown="preventNegativeValues"
      ></v-text-field>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('realization_cost')" class="form-field">
      <h4 class="field-label">Цена реализации</h4>
      <v-text-field
          v-model.number="massEditStore.formState.realization_cost"
          placeholder="Введите цену реализации"
          outlined
          dense
          type="number"
          min="0"
          :rules="positiveNumericRules"
          @keypress="filterNumericInput"
          @input="validatePositiveNumber($event, 'realization_cost')"
          @keydown="preventNegativeValues"
      ></v-text-field>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('restrictions')" class="form-field">
      <h4 class="field-label">Ограничения</h4>
      <v-select
          v-model="massEditStore.formState.restrictions"
          :items="massEditStore.restrictionOptions"
          item-title="text"
          item-value="value"
          placeholder="Есть ограничения?"
          outlined
          dense
      ></v-select>
      <v-alert
          type="warning"
          dense
          text
          class="mt-2"
      >
        При сохранении в выбранных записях будет установлено значение
        {{ massEditStore.formState.restrictions === true ? '"Да"' : massEditStore.formState.restrictions === false ? '"Нет"' : 'выбранное вами' }}
      </v-alert>
    </div>
  

    <div v-if="massEditStore.selectedFieldCodes.includes('Avito')" class="form-field">
      <h4 class="field-label">Авито</h4>
      <v-text-field
          v-model.number="massEditStore.formState.Avito"
          placeholder="Ссылка на объявление"
          outlined
          dense
          type="link"
      ></v-text-field>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('Drom')" class="form-field">
      <h4 class="field-label">Дром</h4>
      <v-text-field
          v-model.number="massEditStore.formState.Drom"
          placeholder="Ссылка на объявление"
          outlined
          dense
          type="link"
      ></v-text-field>
    </div>

    <div v-if="massEditStore.selectedFieldCodes.includes('Alfaleasing')" class="form-field">
      <h4 class="field-label">Альфа-лизинг</h4>
      <v-text-field
          v-model.number="massEditStore.formState.Alfaleasing"
          placeholder="Ссылка на объявление"
          outlined
          dense
          type="link"
      ></v-text-field>
    </div>
  </div>
</template>

<script setup>
import {computed, inject} from 'vue';
import SelectSearchField from '@/components/ui/Searchbar/SelectSearch.vue';

// Инжектим все необходимые данные и методы из родительского компонента
const massEditStore = inject('massEditStore');
const numericRules = inject('numericRules');
const ownersCountRules = inject('ownersCountRules');
const filteredUsers = inject('getFilteredUsers');
const loadUsersOnClick = inject('loadUsersOnClick');
const loadKeysCountOnClick = inject('loadKeysCountOnClick');
const filterNumericInput = inject('filterNumericInput');

// Правила для валидации положительных чисел
const positiveNumericRules = computed(() => [
  ...numericRules,
  (value) => {
    if (value === null || value === undefined || value === '') return true;
    return value >= 0 ? true : 'Значение должно быть положительным числом';
  }
]);

// Функция валидации положительных чисел при вводе
const validatePositiveNumber = (event, fieldName) => {
  const numericValue = parseFloat(event.target.value);
  if (numericValue < 0) {
    massEditStore.formState[fieldName] = 0;
  }
};

const preventNegativeValues = (event) => {
  if ((event.target.value === '0' || event.target.value === 0) && event.key === 'ArrowDown') {
    event.preventDefault();
  }
};
</script>

<style lang="sass" scoped>
@import "../styles/massEditSidebar"
</style>