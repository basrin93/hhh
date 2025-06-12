import {useAuthenticatedRequest} from '@/composables/Auth/useAuthenticatedRequest';
import type {PropertyDetail} from '@/types';
import {ref} from 'vue';

interface AuthenticatedRequest {
    makeRequest<T>(
        endpoint: string,
        options?: { method: string; body?: any }
    ): Promise<T | null>;
}

export const vehicleType = ref<string | null>(null);

try {
    const stored = localStorage.getItem('property-types');
    if (stored) {
        const parsed = JSON.parse(stored);
        vehicleType.value = parsed.type;
    }
} catch (error) {
    vehicleType.value = null;
}

class SeizedPropertyDetailService {
    private authenticatedRequest: AuthenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    private savePropertyTypes(detail: PropertyDetail): void {
        if (!detail?.equipment) return;

        const typeUids = {
            type: detail.equipment.type_ts?.uid ?? null,
            subtype1: detail.equipment.subtype1?.uid ?? null,
            subtype2: detail.equipment.subtype2?.uid ?? null
        };

        try {
            localStorage.setItem('property-types', JSON.stringify(typeUids));
            // Обновляем реактивное состояние
            vehicleType.value = typeUids.type;
        } catch (error) {
            console.error('Ошибка при сохранении UUID типов:', error);
        }
    }

    async fetchPropertyDetail(uid: string): Promise<PropertyDetail> {
        if (!uid) {
            throw new Error('UID не предоставлен');
        }

        try {
            console.log('Запрашиваем детали для uid:', uid);
            const response = await this.authenticatedRequest.makeRequest<PropertyDetail>(
                `v1/seized-property-items/${uid}`,
                { method: 'GET' }
            );

            if (!response) {
                throw new Error('Пустой ответ от сервера');
            }

            this.savePropertyTypes(response);
            return response;
        } catch (error) {
            console.error("Ошибка в сервисе получения деталей имущества:", error);
            throw error;
        }
    }
}

export default new SeizedPropertyDetailService();