import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

class RealizationService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    /**
     * Обновление данных о реализации имущества
     */
    async updateRealizationData(uid: string, data: {
        realization_cost: number | null;
        realization_date: string | null;
    }): Promise<void> {
        try {
            await this.authenticatedRequest.makeRequest(
                `v1/seized-property-items/${uid}/realization`,
                {
                    method: 'PATCH',
                    body: data
                }
            );
        } catch (error) {
            console.error("Ошибка при обновлении данных реализации:", error);
            throw error;
        }
    }
}

export default new RealizationService();