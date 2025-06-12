import {type Component} from 'vue';
import {useAuthenticatedRequest} from '@/composables/Auth/useAuthenticatedRequest';
import GeneralCharacteristics from '@/Domains/StockDetails/Components/TabsContent/GeneralCharacteristics.vue';

interface SidebarTab {
    id: string;
    name: string;
}

interface SidebarTabsResponse {
    tabs: SidebarTab[];
}

export interface Tab {
    id: number;
    name: string;
    icon: string;
    component: Component;
}

// Маппинг для определения иконок и других свойств по имени таба
const getTabProperties = (name: string): { icon: string; component: Component } => {
    const loweredName = name.toLowerCase();

    if (loweredName.includes('характеристик')) {
        return {
            icon: 'mdi-car-info',
            component: GeneralCharacteristics
        };
    }
    if (loweredName.includes('документ')) {
        return {
            icon: 'mdi-file-document',
            component: GeneralCharacteristics
        };
    }
    if (loweredName.includes('оценка')) {
        return {
            icon: 'mdi-calculator',
            component: GeneralCharacteristics
        };
    }

    if (loweredName.includes('фото')) {
        return {
            icon: 'mdi-image-multiple',
            component: GeneralCharacteristics
        };
    }
    if (loweredName.includes('реализация')) {
        return {
            icon: 'mdi-shopping',
            component: GeneralCharacteristics
        };
    }

    return {
        icon: 'mdi-tab',
        component: GeneralCharacteristics
    };
};

class SeizedPropertySidebarService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    private mapTabData(tab: SidebarTab, index: number): Tab {
        const { icon, component } = getTabProperties(tab.name);
        return {
            id: index,
            name: tab.name,
            icon,
            component
        };
    }

    async fetchSidebarTabs(): Promise<Tab[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<SidebarTabsResponse>(
                'v1/seized-property-items/sidebar-tabs',
                {
                    method: 'GET'
                }
            );

            if (!response) {
                return [];
            }

            return response.tabs.map((tab, index) => this.mapTabData(tab, index));
        } catch (error) {
            console.error("❌ Ошибка в сервисе получения вкладок:", error);
            throw error;
        }
    }

    // Метод для отмены текущего запроса при необходимости
}

// Экспортируем единственный экземпляр сервиса
export default new SeizedPropertySidebarService();