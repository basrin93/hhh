import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

interface TabData {
    tab_code: string;
    tab_name: string;
    count: number;
}

interface AggregateResponse {
    tabs: TabData[];
}

interface FormattedTabData {
    name: string;
    label: string;
    count: number;
}

class SeizedPropertiesAggregateService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async fetchAggregate(): Promise<{ tabs: FormattedTabData[] }> {
        try {
            const data = await this.authenticatedRequest.makeRequest<AggregateResponse>(
                'v1/seized-property-items/total-items',
                {
                    method: 'GET'
                }
            );

            if (!data) {
                return this.getDefaultTabs();
            }

            console.log('Raw aggregate data:', data);

            // Преобразуем данные в нужный формат
            const formattedTabs = data.tabs.map(tab => ({
                name: tab.tab_code,
                label: tab.tab_name,
                count: tab.count
            }));

            console.log('Formatted tabs:', formattedTabs);

            return { tabs: formattedTabs };
        } catch (error) {
            console.error("Ошибка загрузки агрегированных данных:", error);
            return this.getDefaultTabs();
        }
    }

    private getDefaultTabs(): { tabs: FormattedTabData[] } {
        return {
            tabs: [{
                name: "all",
                label: "Весь сток",
                count: 0
            }]
        };
    }
}

export default new SeizedPropertiesAggregateService();