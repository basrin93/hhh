import {useAuthenticatedRequest} from '@/composables/Auth/useAuthenticatedRequest';

interface ReportItem {
    vin: string;
}

interface Report {
    messageType: 'ERROR' | 'ALARM';
    message: string;
    items: ReportItem[];
}

export interface PriceImportResponse {
    all: number;
    processed: number;
    successed: number;
    failed: number;
    warning: number;
    report?: Report[];
}

class PriceImportService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async importPrices(file: File): Promise<PriceImportResponse> {
        try {
            console.log('📤 Импорт файла цен:', file.name);

            const formData = new FormData();
            formData.append('file', file);

            const response = await this.authenticatedRequest.makeRequest<PriceImportResponse>(
                'v1/import/valuations',
                {
                    method: 'POST',
                    body: formData // FormData обработается автоматически
                }
            );

            console.log('✅ Импорт завершен:', response);

            return response || {
                all: 0,
                processed: 0,
                successed: 0,
                failed: 1,
                warning: 0,
                report: [{
                    messageType: 'ERROR',
                    message: 'Пустой ответ от сервера',
                    items: []
                }]
            };
        } catch (error) {
            console.error("❌ Ошибка в сервисе импорта цен:", error);
            throw error;
        }
    }
}

export default new PriceImportService();