<template>
  <div class="documents-tab">
    <v-card flat class="mb-2">
      <v-toolbar flat dense>
        <v-toolbar-title>Документы</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-text-field
            v-model="searchQuery"
            placeholder="Поиск документов..."
            prepend-inner-icon="mdi-magnify"
            hide-details
            class="mx-4"
            dense
            outlined
            single-line
        ></v-text-field>
      </v-toolbar>
    </v-card>

    <v-card v-if="isLoading" class="pa-4 d-flex justify-center align-center">
      <v-progress-circular indeterminate color="primary" />
    </v-card>

    <v-card v-else>
      <v-tabs
          v-model="activeTabIndex"
          color="primary"
          align-tabs="start"
          :mandatory="true"
          :selected-class="'v-tab--selected'"
      >
        <v-tab
            v-for="(tab, index) in documentTabs"
            :key="tab.code"
            :value="index"
        >
          {{ tab.name }}
        </v-tab>
      </v-tabs>

      <v-card-text>
        <div v-if="isTabContentLoading" class="d-flex justify-center py-4">
          <v-progress-circular indeterminate color="primary" />
        </div>

        <div v-else>
          <div class="d-flex justify-space-between mb-2">
            <v-btn-toggle v-model="viewMode" mandatory>
              <v-btn small :value="'list'">
                <v-icon>mdi-view-list</v-icon>
              </v-btn>
              <v-btn small :value="'grid'">
                <v-icon>mdi-view-grid</v-icon>
              </v-btn>
            </v-btn-toggle>
          </div>

          <div class="documents-tab__file-container">
            <div v-if="filteredDocuments.length === 0" class="text-center grey--text pa-4">
              <v-icon size="54" color="grey lighten-1">mdi-file-document-outline</v-icon>
              <div class="mt-2">Нет документов для отображения</div>
            </div>

            <div v-else>
              <v-list v-if="viewMode === 'list'" dense>
                <template v-for="owner in documentOwners">
                  <v-list-group
                      :key="`owner-${owner.uid}`"
                      :value="true"
                      no-action
                  >
                    <template v-slot:activator>
                      <v-list-item-icon class="mr-2">
                        <v-icon>mdi-domain</v-icon>
                      </v-list-item-icon>
                      <v-list-item-content>
                        <v-list-item-title>{{ owner.name }}</v-list-item-title>
                      </v-list-item-content>
                    </template>

                    <template v-for="type in getDocumentTypesByOwner(owner.uid)">
                      <v-list-group
                          :key="`type-${owner.uid}-${type}`"
                          :value="false"
                          sub-group
                          no-action
                      >
                        <template v-slot:activator>
                          <v-list-item-icon class="mr-2">
                            <v-icon>mdi-folder</v-icon>
                          </v-list-item-icon>
                          <v-list-item-content>
                            <v-list-item-title>{{ type }}</v-list-item-title>
                          </v-list-item-content>
                        </template>

                        <v-list-item
                            v-for="doc in getDocumentsByOwnerAndType(owner.uid, type)"
                            :key="doc.uid"
                        >
                          <v-list-item-avatar>
                            <v-icon color="grey">
                              mdi-file-pdf
                            </v-icon>
                          </v-list-item-avatar>
                          <v-list-item-content>
                            <v-list-item-title class="text-truncate">{{ doc.title || doc.file_name }}</v-list-item-title>
                            <v-list-item-subtitle>{{ formatter.formatDate(doc.created_at, false) }}</v-list-item-subtitle>
                          </v-list-item-content>
                          <v-list-item-action>
                            <v-btn icon @click.stop="openPreview(doc)">
                              <v-icon small>mdi-eye</v-icon>
                            </v-btn>
                          </v-list-item-action>
                          <v-list-item-action>
                            <v-btn icon @click.stop="downloadFile(doc)">
                              <v-icon small>mdi-download</v-icon>
                            </v-btn>
                          </v-list-item-action>
                        </v-list-item>
                      </v-list-group>
                    </template>
                  </v-list-group>
                </template>
              </v-list>

              <div v-else>
                <div v-for="owner in documentOwners" :key="`grid-${owner.uid}`" class="mb-4">
                  <div class="documents-tab__owner-header py-2 px-3">
                    <v-icon class="mr-2">mdi-domain</v-icon>
                    <span>{{ owner.name }}</span>
                  </div>

                  <div v-for="type in getDocumentTypesByOwner(owner.uid)" :key="`grid-type-${owner.uid}-${type}`" class="mb-4 ml-4">
                    <div class="documents-tab__group-header py-2 px-3">
                      <v-icon small class="mr-2">mdi-folder</v-icon>
                      <span>{{ type }}</span>
                    </div>

                    <div class="documents-tab__grid">
                      <v-hover v-for="doc in getDocumentsByOwnerAndType(owner.uid, type)" :key="doc.uid" v-slot="{ hover }">
                        <v-card
                            :elevation="hover ? 4 : 1"
                            class="documents-tab__grid-item"
                        >
                          <div class="documents-tab__actions-overlay">
                            <v-btn
                                icon
                                color="primary"
                                class="documents-tab__action-btn"
                                @click.stop="openPreview(doc)"
                            >
                              <v-icon>mdi-eye</v-icon>
                            </v-btn>
                            <v-btn
                                icon
                                color="primary"
                                class="documents-tab__action-btn ml-1"
                                @click.stop="downloadFile(doc)"
                            >
                              <v-icon>mdi-download</v-icon>
                            </v-btn>
                          </div>
                          <div class="documents-tab__thumbnail">
                            <v-icon
                                size="54"
                                color="grey"
                            >
                              mdi-file-pdf
                            </v-icon>
                          </div>
                          <v-card-text class="pa-2 text-center">
                            <div class="text-truncate font-weight-medium">{{ doc.title || doc.file_name }}</div>
                            <div class="text-caption grey--text">{{ formatter.formatDate(doc.created_at, false) }}</div>
                          </v-card-text>
                        </v-card>
                      </v-hover>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </div>
</template>

<script setup>
import {computed, onMounted, ref, watch} from 'vue'
import DocumentsService from '@/Domains/StockDetails/API/Documents/DocumentsService'
import {formatter} from '@/utils/FormatterService'

const props = defineProps({
  propertyUid: {
    type: String,
    default: ''
  }
});

const isLoading = ref(true)
const isTabContentLoading = ref(false)
const documentTabs = ref([])
const activeTabIndex = ref(0)
const tabDocuments = ref({})
const viewMode = ref('list')
const searchQuery = ref('')

const activeTab = computed(() => {
  return documentTabs.value[activeTabIndex.value] || null
})

const activeTabDocuments = computed(() => {
  if (!activeTab.value) return []
  return tabDocuments.value[activeTab.value.code] || []
})

const filteredDocuments = computed(() => {
  let docs = activeTabDocuments.value

  if (searchQuery.value) {
    const query = searchQuery.value.toLowerCase()
    docs = docs.filter(doc =>
        (doc.title && doc.title.toLowerCase().includes(query)) ||
        (doc.file_name && doc.file_name.toLowerCase().includes(query))
    )
  }

  return docs
})

const documentOwners = computed(() => {
  if (!activeTab.value || !activeTab.value.owners) return []

  const result = []
  const ownerIds = new Set(filteredDocuments.value.map(doc => doc.owner_uid))

  for (const owner of activeTab.value.owners) {
    if (ownerIds.has(owner.uid)) {
      result.push({
        uid: owner.uid,
        name: owner.name
      })
    }
  }

  return result
})

const getDocumentTypesByOwner = (ownerUid) => {
  const docs = filteredDocuments.value.filter(doc => doc.owner_uid === ownerUid)
  const types = new Set()

  docs.forEach(doc => {
    if (doc.document_type) {
      types.add(doc.document_type)
    }
  })

  return Array.from(types)
}

const getDocumentsByOwnerAndType = (ownerUid, typeName) => {
  return filteredDocuments.value.filter(doc =>
      doc.owner_uid === ownerUid && doc.document_type === typeName
  )
}

const openPreview = (doc) => {
  if (!doc.uid) return
  DocumentsService.openDocumentPreview(doc.uid)
}

const downloadFile = async (doc, convertToPdf = false) => {
  if (!doc.uid) return

  try {
    await DocumentsService.downloadFile(doc.uid, doc.title || doc.file_name, convertToPdf)
  } catch (error) {
    console.error('Ошибка при скачивании файла:', error)
  }
}

const fetchDocumentTabs = async () => {
  try {
    isLoading.value = true

    const propertyId = getPropertyUid()
    if (!propertyId) {
      throw new Error('Отсутствует идентификатор имущества')
    }

    const response = await DocumentsService.fetchDocumentTabs(propertyId)

    documentTabs.value = response.tabs || []

    if (documentTabs.value.length > 0) {
      await loadTabContents(documentTabs.value[0])
    }
  } catch (error) {
    console.error('Ошибка при загрузке вкладок документов:', error)
    documentTabs.value = []
  } finally {
    isLoading.value = false
  }
}

const loadTabContents = async (tab) => {
  if (tabDocuments.value[tab.code]) return

  try {
    isTabContentLoading.value = true

    const docs = await DocumentsService.fetchTabDocuments(tab)
    console.log(`Загружено ${docs.length} документов для вкладки ${tab.code}`)

    tabDocuments.value[tab.code] = docs
  } catch (error) {
    console.error(`Ошибка при загрузке документов для вкладки ${tab.code}:`, error)
    tabDocuments.value[tab.code] = []
  } finally {
    isTabContentLoading.value = false
  }
}

const getPropertyUid = () => {
  if (props.propertyUid) return props.propertyUid

  try {
    const urlParams = new URLSearchParams(window.location.search)
    return urlParams.get('uid') || ''
  } catch (error) {
    console.error('Ошибка при получении property-uid из URL:', error)
    return ''
  }
}

watch(activeTabIndex, async (newIndex) => {
  const newTab = documentTabs.value[newIndex]
  if (newTab) {
    await loadTabContents(newTab)
  }
})

onMounted(async () => {
  await fetchDocumentTabs()
})
</script>

<style lang="sass" scoped>
.documents-tab
  height: 100%
  @include flex-col

  &__file-container
    height: calc(100vh - 380px)
    overflow-y: auto
    @include thin-scrollbar

  &__owner-header
    background-color: $alfa_friendly_white
    color: $alfa_friendly_background_hard
    border-radius: 4px
    font-weight: 500

  &__group-header
    background-color: #f5f5f5
    border-radius: 4px
    font-weight: 500

  &__grid
    display: grid
    grid-template-columns: repeat(auto-fill, minmax(150px, 1fr))
    gap: 16px
    padding: 16px

  &__grid-item
    cursor: default
    transition: all 0.2s ease
    display: flex
    flex-direction: column
    position: relative

  &__thumbnail
    @include flex-center
    height: 100px
    background-color: #f5f5f5
    position: relative

  &__actions-overlay
    position: absolute
    top: 8px
    right: 8px
    display: flex
    align-items: center
    opacity: 1
    z-index: 2

  &__action-btn
    background-color: rgba(255, 255, 255, 0.9)
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2)
    height: 32px
    width: 32px
    min-width: 32px
</style>