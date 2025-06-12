<template>
  <v-card class="characteristics-panel" elevation="0">
    <v-overlay :value="isLoading" absolute>
      <v-progress-circular indeterminate color="primary"></v-progress-circular>
    </v-overlay>

    <PanelHeader :quick-info="store.quickInfo" />

    <TabsPanel
        v-model="store.activeTab"
        :tabs="store.transformedTabs"
        :loading="store.isLoading"
        saveTabId="characteristics-panel"
    >
      <template #[`panel-0`]="{ tab }">
        <keep-alive>
          <CharacteristicsComponent
              :characteristics="characteristicsItems"
              :is-editing="store.getIsEditing"
              @validate-field="store.validateField"
          />
        </keep-alive>
      </template>

      <template #[`panel-1`]="{ tab }">
        <keep-alive>
          <OptionsComponent
              :options="optionsStore.options"
              @update:option="handleOptionUpdate"
          />
        </keep-alive>
      </template>

      <template #[`panel-2`]="{ tab }">
        <keep-alive>
          <LeasingAgreementsTab
              :item-uid="getPropertyUidFromUrl()"
          />
        </keep-alive>
      </template>

      <template #[`panel-3`]="{ tab }">
        <keep-alive>
          <Advertisement
              :item-uid="getPropertyUidFromUrl()"
              :classified-ads="getClassificationAds()"
          />
        </keep-alive>
      </template>
    </TabsPanel>
  </v-card>
</template>
<script setup lang="ts">
import {computed, getCurrentInstance, onMounted, ref, watch} from 'vue'
import PanelHeader from '@/Domains/StockDetails/Components/PanelHeader.vue'
import TabsPanel from '@/components/ui/tabs/TabsPanel.vue'
import CharacteristicsComponent
  from "@/Domains/StockDetails/Components/OwnCharacteristicsTab/CharacteristicsComponent.vue"
import OptionsComponent from "@/Domains/StockDetails/Components/OwnCharacteristicsTab/OptionsTab/OptionsComponent.vue"
import LeasingAgreementsTab
  from "@/Domains/StockDetails/Components/OwnCharacteristicsTab/LeasingTab/LeasingArgreementTab.vue"
import {useCharacteristicsStore} from '@/Domains/StockDetails/Stores/characteristics'
import {useOptionsStore} from '@/Domains/StockDetails/Stores/options'
import {usePropertyDetailStore} from '@/Domains/StockDetails/Stores/PropertyDetailStore';
import {transformPropertyToCharacteristics} from '@/Domains/StockDetails/Composables/characteristics-transformer'
import {CategoryOption} from "@/types"
import Advertisement from '@/Domains/StockDetails/Components/Advertisement/Advertisement.vue'

const store = useCharacteristicsStore()
const propertyDetailStore = usePropertyDetailStore();
const optionsStore = useOptionsStore()
const { proxy } = getCurrentInstance();
const route = proxy.$route;
const isLoading = ref(false);

const characteristicsItems = computed(() => {
  const firstTab = store.characteristics[0]
  return firstTab?.items || []
})

const handleOptionUpdate = (option: CategoryOption) => {
  optionsStore.updateOption(option)
}

function getPropertyUidFromUrl() {
  return route.query.uid as string || null;
}

function getStatusCodeFromUrl() {
  return route.query.status as string || null;
}

function getClassificationAds() {
  const propertyUid = getPropertyUidFromUrl();
  if (propertyUid) {
    var property = propertyDetailStore.getPropertyDetail(propertyUid);
    if (property) {
      return property.classified_ads;
    }
  }

  return [];
}

const initializeOptionsData = (propertyDetails: any) => {
  const initialOptionsData: any = {
    owners_count: propertyDetails.owners_count,
    mileage: propertyDetails.mileage || 0,
    engine_hours: propertyDetails.engine_hours || 0,
    description: propertyDetails.description || '',
    color: propertyDetails.color,
    condition_status: propertyDetails.condition_status,
    keys_count: propertyDetails.keys_count,
    interior_type: propertyDetails.interior_type,
    wheels: propertyDetails.wheels,
    glasses: propertyDetails.glasses,
    damage: propertyDetails.damage
  };

  const extractFieldsFromJson = (jsonStr: string | null | undefined, target: any) => {
    if (!jsonStr) return;

    try {
      const parsed = JSON.parse(jsonStr);

      if (parsed && typeof parsed === 'object') {
        Object.entries(parsed).forEach(([key, value]) => {
          if (key === 'details' && typeof value === 'string') {
            extractFieldsFromJson(value, target);
          } else {
            target[key] = value;
          }
        });
      }
    } catch (e) {
      console.error('Ошибка при парсинге JSON:', e, jsonStr);
    }
  };

  if (propertyDetails.details) {
    extractFieldsFromJson(propertyDetails.details, initialOptionsData);
  }

  if (propertyDetails.options) {
    extractFieldsFromJson(propertyDetails.options, initialOptionsData);
  }

  return initialOptionsData;
};

const loadPropertyDetails = async () => {
  try {
    isLoading.value = true;

    const propertyUid = getPropertyUidFromUrl();
    if (!propertyUid) {
      return;
    }

    const propertyDetails = await propertyDetailStore.fetchPropertyDetail(propertyUid)
    if (!propertyDetails) return;

    const characteristics = transformPropertyToCharacteristics(propertyDetails);
    console.log("characteristics: ", characteristics)
    const initialOptionsData = initializeOptionsData(propertyDetails);
    const statusCodeFromUrl = getStatusCodeFromUrl();

    await store.setCharacteristics(characteristics, {
      title: propertyDetails.equipment?.name || 'Без названия',
      subtitle: `${propertyDetails.equipment?.make?.name || ''} ${propertyDetails.equipment?.model?.name || ''}`.trim() || 'Без модели',
      status: propertyDetails.status || (statusCodeFromUrl ? { code: statusCodeFromUrl } : undefined)
    });

    await optionsStore.loadOptions();
    await optionsStore.loadColors();
    optionsStore.initializeOptionsValues(initialOptionsData);
  } catch (error) {
    console.error('Ошибка при загрузке данных:', error);
  } finally {
    isLoading.value = false;
  }
};

watch(
    () => store.quickInfo,
    async (newQuickInfo) => {
      if (newQuickInfo) {
        await loadPropertyDetails();
      }
    },
    { immediate: true }
);

onMounted(async () => {
  const propertyUid = getPropertyUidFromUrl();
  if (propertyUid) {
    await loadPropertyDetails();
  }
});
</script>
<style lang="sass" scoped>
:deep(.v-window)
  height: calc(80vh - 180px)
  overflow: auto
  @include thin-scrollbar
  scrollbar-gutter: stable

  &::-webkit-scrollbar
    background-color: transparent
</style>