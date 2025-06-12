import {ref} from 'vue';
import {localStorageUtils} from '@/utils/localStorage';
import {currentStatusGroup} from '@/stores/Shared/statusGroup';
import SeizedPropertiesAggregateService from "@/Domains/Stock/API/SeizedPropertiesAggregateService";

const ACTIVE_TAB_STORAGE_KEY = 'vehicle-active-tab';

export function useTabManagement() {
    const activeTab = ref(0);
    const tabs = ref<{ name: string; label: string; count: number }[]>([]);

    function loadActiveTab(): void {
        const savedTab = localStorageUtils.getData(ACTIVE_TAB_STORAGE_KEY);
        if (savedTab?.data) {
            currentStatusGroup.value = savedTab.data;
        }
    }

    function saveActiveTab(): void {
        localStorageUtils.saveData(ACTIVE_TAB_STORAGE_KEY, {
            data: currentStatusGroup.value,
            timestamp: Date.now()
        });
    }

    function setActiveTabByName(tabName: string): void {
        currentStatusGroup.value = tabName.toLowerCase() === 'archive' ? 'Archive' : 'Active';
        saveActiveTab();

        const index = tabs.value.findIndex(tab =>
            tab.name.toLowerCase() === currentStatusGroup.value.toLowerCase()
        );
        activeTab.value = index >= 0 ? index : 0;
    }

    function setActiveTabByGroup(): void {
        const index = tabs.value.findIndex(tab =>
            tab.name.toLowerCase() === currentStatusGroup.value.toLowerCase()
        );
        activeTab.value = index >= 0 ? index : 0;
    }

    async function fetchTabs(): Promise<void> {
        try {
            const data = await SeizedPropertiesAggregateService.fetchAggregate();
            if (data.tabs?.length > 0) {
                tabs.value = data.tabs;
            }
        } catch (error) {
            tabs.value = [];
        }
    }

    return {
        activeTab,
        tabs,
        loadActiveTab,
        setActiveTabByName,
        setActiveTabByGroup,
        fetchTabs
    };
}