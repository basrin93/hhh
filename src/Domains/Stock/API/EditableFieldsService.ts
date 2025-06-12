import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

interface EditableField {
    value: string;
    code: string;
    massChange: boolean;
}

interface EditableFieldsResponse {
    rows: EditableField[];
}

interface ChangedField {
    code: string;
    change: string;
}

interface SeizedPropertyItem {
    uid: string;
    rows: ChangedField[];
}

interface MassEditRequest {
    items: SeizedPropertyItem[];
}

interface MassEditRowResult {
    code: string;
    message: string;
}

interface MassEditItemResult {
    uid: string;
    message: string;
    rows: MassEditRowResult[];
}

interface MassEditResponse {
    all: number;
    successed: number;
    failed: number;
    report: MassEditItemResult[];
}

class EditableFieldsService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async fetchEditableFields(statusGroup: string): Promise<EditableFieldsResponse> {
        try {
            const response = await this.authenticatedRequest.makeRequest<EditableFieldsResponse>(
                `v1/seized-property/editable-rows?status_group=${statusGroup}`,
                { method: 'GET' }
            );

            // Если ответ имеет структуру { columns: [...] }, преобразуем его
            if (response && 'columns' in response) {
                console.error('Старый формат ответа:', response);
                return { rows: [] };
            }

            return response || { rows: [] };
        } catch (error) {
            console.error("Ошибка при получении списка редактируемых полей:", error);
            throw error;
        }
    }

    async saveMassChanges(items: SeizedPropertyItem[]): Promise<MassEditResponse> {
        const requestBody: MassEditRequest = { items };

        try {
            console.log('Отправка массовых изменений:', requestBody);

            const response = await this.authenticatedRequest.makeRequest<MassEditResponse>(
                'v1/seized-property-items/mass',
                {
                    method: 'PATCH',
                    body: requestBody
                }
            );

            console.log('Результат массовых изменений:', response);
            return response;
        } catch (error) {
            console.error("Ошибка при сохранении массовых изменений:", error);
            throw error;
        }
    }
}

export default new EditableFieldsService();