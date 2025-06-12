<template>
  <div class="characteristic-card">
    <div class="card-content">
      <div class="card-label">{{ label }}</div>
      <div class="card-value" :class="valueClass">
        <v-select
            v-if="isStatus && canEditStatus"
            v-model="selectedValue"
            :items="store.availableStatuses"
            variant="plain"
            density="compact"
            hide-details
            class="status-select"
            @change="handleStatusChange"
        >
          <template #selection="{ item }">
            <StatusBadge :label="item" v-if="showStatusBadge" />
            <span class="value-text" v-else>{{ item }}</span>
          </template>
          <template #item="{ item }">
            <div class="d-flex align-center">
              <v-icon
                  v-if="selectedValue === item"
                  color="primary"
                  size="small"
                  class="mr-2"
              >
                mdi-check
              </v-icon>
              <StatusBadge :label="item" :use-dynamic-styles="true" />
            </div>
          </template>
        </v-select>

        <v-select
            v-else-if="isResponsible && canEditResponsible"
            v-model="responsibleValue"
            :items="filteredUsers"
            item-title="employee_display"
            return-object
            variant="plain"
            density="compact"
            hide-details
            class="responsible-select"
            @update:model-value="handleResponsibleChange"
        >
          <template #selection="{ item }">
            <span class="value-text text-truncate">{{ getResponsibleDisplayText(item) }}</span>
          </template>
          <template #prepend-item>
            <SelectSearchField
                filter-name="responsible"
            />
          </template>
          <template #item="{ item }">
            <div class="d-flex align-center">
              <v-icon
                  v-if="isCurrentResponsible(item)"
                  color="primary"
                  size="small"
                  class="mr-2"
              >
                mdi-check
              </v-icon>
              <span class="ml-2" :class="{ 'ml-8': !isCurrentResponsible(item) }">
                {{ getResponsibleDisplayText(item) }}
              </span>
            </div>
          </template>
          <template #prepend-inner v-if="!responsibleValue">
            <span class="value-text">Не&nbsp;указан</span>
          </template>
        </v-select>

        <StatusBadge v-else-if="isStatusDisplay" :label="value" :use-dynamic-styles="true" />
        <StatusBadge v-else-if="isStatus && !canEditStatus" :label="value" :use-dynamic-styles="true" />
        <span v-else-if="isResponsible && !canEditResponsible" class="value-text">{{ responsibleDisplayText }}</span>
        <span v-else class="value-text">{{ value }}</span>
      </div>
    </div>

    <!-- Диалог подтверждения изменения статуса -->
    <v-dialog v-model="showConfirmDialog" max-width="400" @click:outside="cancelStatusChange">
      <v-card>
        <v-card-title class="text-h6">
          Подтверждение изменения статуса
        </v-card-title>
        <v-card-text>
          Вы действительно хотите изменить статус на "{{ pendingStatus }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelStatusChange">
            Отмена
          </v-btn>
          <v-btn color="primary" variant="text" @click="confirmStatusChange">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Диалог подтверждения изменения ответственного -->
    <v-dialog v-model="showResponsibleDialog" max-width="400" @click:outside="cancelResponsibleChange">
      <v-card>
        <v-card-title class="text-h6">
          Подтверждение изменения <br/> ответственного
        </v-card-title>
        <v-card-text>
          Вы действительно хотите изменить ответственного на "{{ getResponsibleDisplayText(pendingResponsible) }}"?
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey" variant="text" @click="cancelResponsibleChange">
            Отмена
          </v-btn>
          <v-btn color="primary" variant="text" @click="confirmResponsibleChange">
            Подтвердить
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <!-- Снэкбары -->
    <v-snackbar
        v-model="showSuccessSnackbar"
        color="success"
        timeout="3000"
    >
      Статус успешно изменен на "{{ selectedValue }}"
    </v-snackbar>

    <v-snackbar
        v-model="showResponsibleSuccessSnackbar"
        color="success"
        timeout="3000"
    >
      Ответственный успешно изменен на "{{ getResponsibleDisplayText(responsibleValue) }}"
    </v-snackbar>

    <v-snackbar
        v-model="showErrorSnackbar"
        color="error"
        timeout="5000"
    >
      {{ errorMessage }}
    </v-snackbar>
  </div>
</template>

<script setup lang="ts">
import {computed, onMounted, provide, ref, watch} from 'vue'
import {useCharacteristicsStore} from '@/Domains/StockDetails/Stores/characteristics'
import {useStockStore} from '@/Domains/Stock/Stores/stockStore'
import StatusBadge from '@/Domains/Stock/Components/StatusBadge.vue'
import {usePermissions} from '@/composables/Permissions/usePermissions'
import {SelectSearchService} from '@/components/ui/Searchbar/SelectSearchService'
import SelectSearchField from '@/components/ui/Searchbar/SelectSearch.vue'

interface Props {
  label: string
  value: string | any
}

interface User {
  uid: string
  employee_display?: string | null
  employeeDisplay?: string | null
  first_name?: string
  last_name?: string
  location?: {
    city: string | null
    timezone: string | null
  }
}

interface ResponsibleData {
  uid: string
  first_name?: string
  last_name?: string
  employee_display?: string
}

const props = defineProps<Props>()
const emit = defineEmits(['update:value'])

// Stores и composables
const store = useCharacteristicsStore()
const stockStore = useStockStore()
const { can } = usePermissions()

// Permissions
const canEditStatus = computed(() => can('stock:edit'))
const canEditResponsible = computed(() => can('stock:edit'))

// State для статуса
const currentStatusValue = ref(props.value)
const showConfirmDialog = ref(false)
const showSuccessSnackbar = ref(false)
const pendingStatus = ref('')
const showStatusBadge = ref(true)

// State для ответственного
const responsibleValue = ref<User | null>(null)
const originalResponsible = ref<User | null>(null)
const showResponsibleDialog = ref(false)
const showResponsibleSuccessSnackbar = ref(false)
const pendingResponsible = ref<User | null>(null)

// Сервис поиска для ответственных
const responsibleSearchService = new SelectSearchService(['responsible'])
const responsibleSearchValues = responsibleSearchService.getSearchValues()

// Предоставляем сервис поиска дочерним компонентам
provide('searchService', responsibleSearchService)
provide('searchValues', responsibleSearchValues)

// Общий state для ошибок
const showErrorSnackbar = ref(false)
const errorMessage = ref('Произошла ошибка при изменении статуса')
const isLoading = ref(false)

// Computed properties
const isStatus = computed(() => props.label === 'Статус')
const isResponsible = computed(() => props.label === 'Ответственный')
const isStatusDisplay = computed(() => props.label.toLowerCase().includes('статус') && !isStatus.value)

const selectedValue = computed({
  get: () => currentStatusValue.value,
  set: (newValue) => {
    if (isStatus.value && canEditStatus.value) {
      pendingStatus.value = newValue
      showConfirmDialog.value = true
    }
  }
})

const valueClass = computed(() => {
  const classes = ['value-container']

  if (isStatusDisplay.value) return classes

  if (isStatus.value) {
    const statusClassMap = {
      'Расторгнут, изъят': 'value-success',
      'Расторгнут, не изъят': 'value-danger'
    }

    const statusClass = statusClassMap[currentStatusValue.value as keyof typeof statusClassMap]
    if (statusClass) classes.push(statusClass)
  }

  return classes
})

const responsibleDisplayText = computed(() => {
  if (responsibleValue.value) {
    return getResponsibleDisplayText(responsibleValue.value)
  }

  if (typeof props.value === 'object' && props.value) {
    return getResponsibleDisplayText(props.value)
  }

  return typeof props.value === 'string' ? props.value : 'Не указан'
})

const filteredUsers = computed(() => {
  const users = store.users || []

  // Преобразуем пользователей в формат для поиска
  const usersForSearch = users.map(user => ({
    ...user,
    text: getResponsibleDisplayText(user),
    value: user.uid
  }))

  // Фильтруем через сервис поиска
  const filtered = responsibleSearchService.filterItems(usersForSearch, 'responsible')

  // Возвращаем оригинальные объекты пользователей
  return filtered.map(item => users.find(user => user.uid === item.value)).filter(Boolean)
})

// Утилиты
const getResponsibleDisplayText = (item: User | ResponsibleData | null): string => {
  if (!item) return 'Не указан'

  if (item.employee_display) return item.employee_display
  if ('employeeDisplay' in item && item.employeeDisplay) return item.employeeDisplay
  if (item.first_name && item.last_name) return `${item.last_name} ${item.first_name.charAt(0)}.`

  return 'Не указан'
}

const findUserByValue = (value: string | ResponsibleData | any): User | null => {
  if (!value || !store.users.length) return null

  if (typeof value === 'object' && value.uid) {
    const foundUser = store.users.find(user => user.uid === value.uid)
    if (foundUser) return foundUser

    return {
      uid: value.uid,
      employee_display: value.employee_display,
      first_name: value.first_name,
      last_name: value.last_name
    } as User
  }

  if (typeof value === 'string') {
    return store.users.find(user =>
        getResponsibleDisplayText(user) === value ||
        user.employee_display === value ||
        user.employeeDisplay === value
    ) || null
  }

  return null
}

const isCurrentResponsible = (item: User): boolean => {
  return responsibleValue.value?.uid === item.uid
}

const showError = (message: string) => {
  errorMessage.value = message
  showErrorSnackbar.value = true
}

const refreshStockData = async () => {
  if (stockStore.isInitialized) {
    await stockStore.refreshWithCurrentState()
  }
}

// Обработчики событий
const handleStatusChange = (newValue: string) => {
  if (!canEditStatus.value || !newValue) return

  pendingStatus.value = newValue
  showConfirmDialog.value = true
}

const handleResponsibleChange = (newValue: User) => {
  if (!canEditResponsible.value || !newValue?.uid) return
  if (originalResponsible.value?.uid === newValue.uid) return

  pendingResponsible.value = newValue
  showResponsibleDialog.value = true
}

const cancelStatusChange = () => {
  showConfirmDialog.value = false
  currentStatusValue.value = props.value
}

const cancelResponsibleChange = () => {
  showResponsibleDialog.value = false
  responsibleValue.value = originalResponsible.value
}

const confirmStatusChange = async () => {
  if (!canEditStatus.value) return

  try {
    await store.updateStatusCode(pendingStatus.value)
    currentStatusValue.value = pendingStatus.value
    emit('update:value', pendingStatus.value)
    await refreshStockData()

    showConfirmDialog.value = false
    showSuccessSnackbar.value = true
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Произошла ошибка при изменении статуса'
    showError(message)
    currentStatusValue.value = props.value
  }
}

const confirmResponsibleChange = async () => {
  if (!canEditResponsible.value || !pendingResponsible.value) return

  try {
    await store.updateResponsible(pendingResponsible.value)
    originalResponsible.value = pendingResponsible.value
    await refreshStockData()

    showResponsibleDialog.value = false
    showResponsibleSuccessSnackbar.value = true
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Произошла ошибка при изменении ответственного'
    showError(message)
    responsibleValue.value = originalResponsible.value
  }
}

const initializeResponsible = async () => {
  if (!isResponsible.value) return

  isLoading.value = true
  try {
    await store.loadUsers()
    const currentUser = findUserByValue(props.value)
    responsibleValue.value = currentUser
    originalResponsible.value = currentUser
  } finally {
    isLoading.value = false
  }
}

// Watchers
watch(() => props.value, (newValue) => {
  currentStatusValue.value = newValue

  if (isResponsible.value) {
    const currentUser = findUserByValue(newValue)
    if (currentUser && (!responsibleValue.value || currentUser.uid !== responsibleValue.value.uid)) {
      responsibleValue.value = currentUser
      originalResponsible.value = currentUser
    }
  }
}, { deep: true })

watch(() => store.users, () => {
  if (isResponsible.value && store.users.length > 0) {
    const currentUser = findUserByValue(props.value)
    if (currentUser) {
      responsibleValue.value = currentUser
      originalResponsible.value = currentUser
    }
  }
}, { deep: true })

watch(responsibleValue, (newValue, oldValue) => {
  if (canEditResponsible.value && newValue && (!oldValue || newValue.uid !== oldValue.uid)) {
    handleResponsibleChange(newValue)
  }
})

onMounted(() => {
  initializeResponsible()
})
</script>

<style lang="sass" scoped>
.characteristic-card
  background: $alfa_friendly_white
  border: 1px solid $alfa_friendly_background_light
  border-radius: 8px
  padding: 12px

  .card-content
    display: flex
    flex-direction: column
    justify-content: space-between
    gap: 6px
    height: 100%

  .card-label
    font-size: 13px
    color: $alfa_friendly_background_hard
    font-weight: 600
    text-transform: uppercase
    background: $alfa_friendly_background_light
    padding: 4px 0
    border-radius: 4px
    display: inline-block

  .card-value
    @include flex-col
    gap: 4px

    .value-text
      font-size: 14px
      color: $alfa_friendly_background_hard
      font-weight: 500
      line-height: 1.4
      text-wrap-style: balance

    .text-truncate
      white-space: nowrap
      overflow: hidden
      text-overflow: ellipsis
      max-width: 100%
      display: block

    &.value-success
      :deep(.v-field)
        background: transparent !important
      .value-text, :deep(.v-select__selection)
        background: $alfa_friendly_succes
        color: $alfa_friendly_white
        padding: 6px 10px
        border-radius: 6px
        font-weight: 500

    &.value-danger
      :deep(.v-field)
        background: transparent !important
      .value-text, :deep(.v-select__selection)
        background: $alfa_friendly_red
        color: $alfa_friendly_white
        padding: 6px 10px
        border-radius: 6px
        font-weight: 500

.status-select,
.responsible-select
  :deep(.v-field)
    padding: 0
    border: none
    background: transparent
    box-shadow: none

  :deep(.v-field__input)
    padding: 0
    min-height: unset

  :deep(.v-field__append-inner)
    padding: 0
    margin-left: 8px

.v-text-field
  padding: 0
  margin: 0

:deep(.v-input__slot:before)
  display: none

.v-list
  width: 35vw
  height: 100%
</style>