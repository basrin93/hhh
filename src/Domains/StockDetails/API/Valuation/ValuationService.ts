import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

interface ValuationHistoryResponse {
    count: number;
    items: ValuationHistoryItem[];
}

interface ValuationHistoryItem {
    comment: string;
    valuation_date: string;
    valuation: number;
    reason: {
        name: string;
        value: string;
    };
    author: {
        name: string;
        code: string;
    };
}

interface ValuationReasonResponse {
    items: ValuationReason[];
}

interface ValuationReason {
    name: string;
    value: string;
}

interface ValuationRequest {
    valuation: number;
    reason: {
        name: string;
        value: string;
    };
    comment?: string;
}

class ValuationService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }
    async getValuationHistory(itemUid: string): Promise<any> {
        try {
            console.log('Запрос истории оценок для:', itemUid);
            const response = await this.authenticatedRequest.makeRequest(
                `v1/seized-property-items/${itemUid}/valuation-history`,
                {
                    method: 'GET'
                }
            );

            console.log('Ответ от API истории оценок:', response);

            // Просто возвращаем ответ как есть, обработка в компоненте
            return response;
        } catch (error) {
            console.error("Ошибка при получении истории оценок:", error);
            return { count: 0, items: [] };
        }
    }

    async getValuationReasons(): Promise<ValuationReason[]> {
        try {
            console.log('Запрос причин оценки');
            const response = await this.authenticatedRequest.makeRequest<ValuationReasonResponse>(
                'v1/seized-property-items/valuation-reasons',
                {
                    method: 'GET'
                }
            );

            console.log('Ответ API для причин:', response);

            // Проверяем структуру ответа и извлекаем правильные данные
            if (response?.items && Array.isArray(response.items)) {
                return response.items;
            } else if (Array.isArray(response)) {
                return response;
            } else {
                console.warn('Неожиданная структура ответа для причин:', response);
                return [];
            }
        } catch (error) {
            console.error("Ошибка при получении списка причин:", error);
            return [];
        }
    }

    async saveValuation(itemUid: string, valuationData: ValuationRequest): Promise<any> {
        try {
            console.log(`Сохранение оценки для ${itemUid}:`, valuationData);
            return await this.authenticatedRequest.makeRequest(
                `v1/seized-property-items/${itemUid}/valuation`,
                {
                    method: 'PATCH',
                    body: valuationData
                }
            );
        } catch (error) {
            console.error("Ошибка при сохранении оценки:", error);
            throw error;
        }
    }
}

export default new ValuationService();