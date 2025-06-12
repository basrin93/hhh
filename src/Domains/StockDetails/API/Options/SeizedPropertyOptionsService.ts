import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

interface OptionValue {
    name: string;
    value: string;
}

interface PropertyOption {
    option_name: string;
    option_sysname: string;
    option_category: string;
    option_values: OptionValue[];
    is_required: boolean;
    input_type: string;
    value?: any;
}

interface OptionsParams {
    type?: string;
    subtype1?: string;
    subtype2?: string;
}

interface ColorResponse {
    code: string;
    uid: string;
    name: string;
}

class SeizedPropertyOptionsService {
    private authenticatedRequest;
    private readonly specialOptions = [
        'color',
        'description',
        'interior_type',
        'condition_status',
        'owners_count',
        'mileage',
        'engine_hours',
        'keys_number'
    ];

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async fetchPropertyOptions(params: OptionsParams = {}): Promise<PropertyOption[]> {
        try {
            const queryParams = new URLSearchParams();
            if (params.type) queryParams.append('type', params.type);
            if (params.subtype1) queryParams.append('subtype1', params.subtype1);
            if (params.subtype2) queryParams.append('subtype2', params.subtype2);

            const queryString = queryParams.toString();
            const endpoint = `v1/seized-property-items/options${queryString ? `?${queryString}` : ''}`;

            return await this.authenticatedRequest.makeRequest<PropertyOption[]>(
                endpoint,
                { method: 'GET' }
            );
        } catch (error) {
            console.error("Ошибка в сервисе получения опций:", error);
            throw error;
        }
    }

    async fetchColors(search: string): Promise<ColorResponse[]> {
        try {
            return await this.authenticatedRequest.makeRequest<ColorResponse[]>(
                `v1/seized-property-items/colors`,
                { method: 'GET' }
            );
        } catch (error) {
            console.error("Ошибка при получении цветов:", error);
            throw error;
        }
    }


    async updatePropertyOptions(uid: string, requestBody: Record<string, any>): Promise<void> {
        try {
            await this.authenticatedRequest.makeRequest(
                `v1/seized-property-items/${uid}/options`,
                {
                    method: 'PATCH',
                    body: requestBody
                }
            );
        } catch (error) {
            console.error("Ошибка при обновлении опций:", error);
            throw error;
        }
    }
}

export default new SeizedPropertyOptionsService();