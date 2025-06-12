<template>
  <div>
    <v-alert
        :type="result.failed > 0 ? 'warning' : 'success'"
        :value="true"
        outlined
    >
      <div>
        <div>Обработано: <b>{{ result.all }}</b></div>
        <div>Успешно: <b>{{ result.successed }}</b></div>
        <div>Ошибок: <b>{{ result.failed }}</b></div>
      </div>
    </v-alert>

    <div v-if="groupedErrors.length > 0" class="mt-4">
      <h4 class="mb-3">Отчет об ошибках:</h4>

      <v-expansion-panels>
        <v-expansion-panel
            v-for="(group, index) in groupedErrors"
            :key="index"
            class="mb-2 error-panel"
        >
          <v-expansion-panel-header>
            <div class="d-flex align-center">
              <v-icon color="error" small class="mr-2">mdi-alert-circle</v-icon>
              <span class="font-weight-medium">{{ group.errorMessage }}</span>
              <v-chip x-small class="ml-2" color="grey lighten-3">{{ group.items.length }}</v-chip>
            </div>
          </v-expansion-panel-header>
          <v-expansion-panel-content>
            <div class="table-container">
              <v-simple-table dense class="error-vehicles-table">
                <template v-slot:default>
                  <thead>
                  <tr>
                    <th>VIN</th>
                    <th>Ссылка</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr v-for="item in group.items" :key="item.uid">
                    <td>{{ item.vin }}</td>
                    <td>
                      <a :href="getItemUrl(item.vin, item.uid)" target="_blank" class="vehicle-link">
                        Открыть
                      </a>
                    </td>
                  </tr>
                  </tbody>
                </template>
              </v-simple-table>
            </div>
          </v-expansion-panel-content>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, defineProps } from 'vue'

interface ErrorRow {
  code?: string
  message: string
}

interface ReportItem {
  uid: string
  vin: string
  message?: string
  rows?: ErrorRow[]
}

interface ResultProps {
  all: number
  processed?: number
  successed: number
  failed: number
  warning?: number
  report: ReportItem[]
}

const props = defineProps({
  result: {
    type: Object as () => ResultProps,
    required: true,
    default: () => ({
      all: 0,
      processed: 0,
      successed: 0,
      failed: 0,
      warning: 0,
      report: []
    })
  }
})

interface GroupedError {
  errorMessage: string
  items: {
    uid: string
    vin: string
  }[]
}

const groupedErrors = computed<GroupedError[]>(() => {
  if (!props.result.report || !props.result.report.length) {
    return []
  }

  const groups: Record<string, GroupedError> = {}

  props.result.report.forEach(item => {
    if (!item.rows || !item.rows.length) return

    const errorMessage = item.rows[0].message
    const key = errorMessage

    if (!groups[key]) {
      groups[key] = {
        errorMessage,
        items: []
      }
    }

    groups[key].items.push({
      uid: item.uid,
      vin: item.vin
    })
  })

  return Object.values(groups).sort((a, b) => b.items.length - a.items.length)
})

const getItemUrl = (vin: string, uid: string): string => {
  const baseUrl = window.location.origin
  return `${baseUrl}/stock/${vin}?uid=${uid}`
}
</script>

<style lang="sass" scoped>
.error-panel
  margin-bottom: 8px

.table-container
  max-height: 200px
  overflow-y: auto
  @include thin-scrollbar

.error-vehicles-table
  background-color: transparent !important

.vehicle-link
  color: $alfa_primary-blue
  text-decoration: none
  &:hover
    text-decoration: underline
</style>