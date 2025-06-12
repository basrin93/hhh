import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

interface FilterResponse {
    uid: string;
    name: string;
}

interface TypeResponse extends FilterResponse {
    has_children: string;
}

class SeizedPropertyFiltersService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async fetchPropertyTypes(parents?: string[]): Promise<TypeResponse[]> {
        try {
            // Формируем строку запроса с параметрами
            const parentsParam = Array.isArray(parents) && parents.length > 0
                ? `?${parents.map(p => `parents=${encodeURIComponent(p)}`).join('&')}`
                : '';

            const response = await this.authenticatedRequest.makeRequest<TypeResponse[]>(
                `v1/seized-property-items/types${parentsParam}`,
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении типов имущества:", error);
            throw error;
        }
    }

    async fetchBrands(typeIds: string[]): Promise<FilterResponse[]> {
        try {
            // Проверяем входные данные
            if (!Array.isArray(typeIds) || typeIds.length === 0) {
                console.error('typeIds должен быть непустым массивом');
                return [];
            }

            // Формируем строку запроса с параметрами
            const typesParam = typeIds.map(id => `types=${encodeURIComponent(id)}`).join('&');

            console.log('Отправляем GET запрос брендов с параметрами:', typesParam);

            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                `v1/seized-property-items/brands?${typesParam}`,
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении брендов:", error);
            throw error;
        }
    }

    async fetchModels(brandIds: string[]): Promise<FilterResponse[]> {
        try {
            if (!Array.isArray(brandIds) || brandIds.length === 0) {
                return [];
            }

            // Формируем строку запроса с параметрами
            const brandsParam = brandIds.map(id => `brands=${encodeURIComponent(id)}`).join('&');

            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                `v1/seized-property-items/models?${brandsParam}`,
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении моделей:", error);
            throw error;
        }
    }

    async fetchEquipments(modelIds: string[]): Promise<FilterResponse[]> {
        try {
            if (!Array.isArray(modelIds) || modelIds.length === 0) {
                return [];
            }

            // Формируем строку запроса с параметрами
            const modelsParam = modelIds.map(id => `models=${encodeURIComponent(id)}`).join('&');

            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                `v1/seized-property-items/equipments?${modelsParam}`,
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении комплектаций:", error);
            throw error;
        }
    }

    async fetchStatuses(statusGroup: 'Active' | 'Archive' = 'Active'): Promise<FilterResponse[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                `v1/seized-property-items/statuses?status_group=${statusGroup}`,
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении статусов:", error);
            throw error;
        }
    }

    async fetchLiquidities(): Promise<FilterResponse[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                'v1/seized-property-items/liquidities',
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении ликвидности:", error);
            throw error;
        }
    }

    // Новые методы для дополнительных фильтров на основе реальных эндпоинтов

    async fetchDriveUnits(): Promise<FilterResponse[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                'v1/seized-property-items/equipment/drive-units',
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении типов привода:", error);
            throw error;
        }
    }

    async fetchFuelTypes(): Promise<FilterResponse[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                'v1/seized-property-items/equipment/fuel-types',
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении типов топлива:", error);
            throw error;
        }
    }

    async fetchTransmissionTypes(): Promise<FilterResponse[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                'v1/seized-property-items/equipment/transmission-types',
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении типов коробок передач:", error);
            throw error;
        }
    }

    async fetchWheelFormulas(): Promise<FilterResponse[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                'v1/seized-property-items/equipment/wheel-formulas',
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении колесных формул:", error);
            throw error;
        }
    }

    async fetchParticipants(type = 'lessor') {
        try {
            const response = await this.authenticatedRequest.makeRequest(
                `v1/seized-property-items/participants?type=${type}`,
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error(`Ошибка при получении ${type === 'lessor' ? 'лизингодателей' : 'лизингополучателей'}:`, error);
            return [];
        }
    }

    async fetchKeysCount(): Promise<FilterResponse[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<FilterResponse[]>(
                'v1/seized-property-items/keys-count',
                { method: 'GET' }
            );
            return response || [];
        } catch (error) {
            console.error("Ошибка при получении количества ключей:", error);
            throw error;
        }
    }
}

export default new SeizedPropertyFiltersService();