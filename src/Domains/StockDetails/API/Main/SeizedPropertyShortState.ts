import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

// Интерфейс для ответа состояния имущества
interface SeizedPropertyStateResponse {
    state: string;
    stateCode: number;
    message: string | null;
    approved_for_sale: boolean | null;
}

class SeizedPropertyShortState {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async fetchPropertyState(uid: string): Promise<SeizedPropertyStateResponse> {
        try {
            const response = await this.authenticatedRequest.makeRequest<SeizedPropertyStateResponse>(
                `v1/seized-property-items/${uid}/short-state`,
                {
                    method: 'GET'
                }
            );

            return response || { state: '', stateCode: 0, message: null, approved_for_sale: null };
        } catch (error) {
            console.error("Ошибка в сервисе получения состояния:", error);
            throw error;
        }
    }
}

export default new SeizedPropertyShortState();