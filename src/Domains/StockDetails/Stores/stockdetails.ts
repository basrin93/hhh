import {defineStore} from 'pinia'
import {tabs} from '@/constants/tabs'
import InProgress from "@/components/ui/banners/InProgress.vue";

interface PropertyState {
    state: string;
    stateCode: number;
    message: string | null;
}

export const useLayoutStore = defineStore('layout', {
    state: () => ({
        activeTab: 0,
        isLoading: false,
        isSidebarCollapsed: false,
        propertyState: null as PropertyState | null,
    }),

    getters: {
        currentComponent: (state) => {
            const tab = tabs.find(tab => tab.id === state.activeTab)
            if (!tab) {
                return InProgress
            }
            return tab.component
        },

        breadcrumbItems: (state) => [
            {
                title: 'Назад',
                path: '/stock'
            },
            {
                title: tabs.find(tab => tab.id === state.activeTab)?.name || '',
                path: ''
            }
        ]
    },

    actions: {
        toggleSidebar() {
            this.isSidebarCollapsed = !this.isSidebarCollapsed
        },

        setLoading(value: boolean) {
            this.isLoading = value
        },

        setActiveTab(tabId: number) {
            this.activeTab = tabId
        }
    }
})