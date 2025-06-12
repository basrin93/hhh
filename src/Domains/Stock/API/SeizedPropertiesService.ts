import { Item } from "@/types";
import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

interface SeizedPropertiesFilter {
    query?: string | null;
    types?: string[];
    subtypes1?: string[];
    subtypes2?: string[];
    brands?: string[];
    models?: string[];
    equipments?: string[];
    liquidities?: string[];
    statuses?: string[];
    status_group?: 'Active' | 'Archive';
    engine_power_kw_min?: number | null;
    engine_power_kw_max?: number | null;
    engine_power_hp_min?: number | null;
    engine_power_hp_max?: number | null;
    year_min?: number | null;
    year_max?: number | null;

    // Добавляем новые поля
    fuel_type?: string | null;
    transmission_type?: string | null;
    wheel_formula?: string | null;
    lessor?: string | null;
    lessees?: string[];
    keys_count?: string | null;
    drive_unit?: string | null;
    responsible_user?: string | null;
    date_of_seizure_min?: string | null;
    date_of_seizure_max?: string | null;
    mileage_min?: number | null;
    mileage_max?: number | null;
    engine_hours_min?: number | null;
    engine_hours_max?: number | null;
    approved_for_sale?: boolean | null;
    address?: string | null;
}

interface SeizedPropertiesRequest {
    filter: SeizedPropertiesFilter;
    page: number;
    per_page: number;
    sort_column?: string[];
    sort_desc?: boolean[];
}

interface SeizedPropertiesResponse {
    items: Item[];
    count: number;
}

class SeizedPropertiesService {
    private authenticatedRequest;
    private readonly endpoint = 'v1/seized-property-items';
    private readonly MAX_BRANDS = 3;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL,
        });
    }

    async fetchSeizedProperties(
        filters?: Partial<SeizedPropertiesFilter>,
        page: number = 1,
        per_page: number = 100,
        isArchive: boolean = false,
        sort_column: string[] = [],
        sort_desc: boolean[] = []
    ): Promise<SeizedPropertiesResponse> {
        console.group('🔄 SeizedPropertiesService.fetchSeizedProperties');
        console.log('📊 Параметры запроса:', { filters, page, per_page, isArchive, sort_column, sort_desc });

        try {
            // Формируем endpoint с query параметром
            const endpointWithQuery = `${this.endpoint}?status_group=${isArchive ? 'Archive' : 'Active'}`;
            this.authenticatedRequest.abortRequest(endpointWithQuery);

            const normalizedFilters: SeizedPropertiesFilter = {
                ...filters,
                types: filters?.types || [],
                subtypes1: filters?.subtypes1 || [],
                subtypes2: filters?.subtypes2 || [],
                brands: (filters?.brands || []).slice(0, this.MAX_BRANDS),
                models: filters?.models || [],
                equipments: filters?.equipments || [],
                liquidities: filters?.liquidities || [],
                statuses: filters?.statuses || []
            };

            const requestBody: SeizedPropertiesRequest = {
                filter: normalizedFilters,
                page,
                per_page
            };

            if (sort_column.length > 0) {
                requestBody.sort_column = sort_column;
                requestBody.sort_desc = sort_desc;
            }

            const response = await this.authenticatedRequest.makeRequest<SeizedPropertiesResponse>(
                endpointWithQuery,
                {
                    method: 'POST',
                    body: requestBody,
                }
            );

            if (sort_column.length > 0) {
                console.log('Параметры сортировки:', { sort_column, sort_desc });
            }

            return response || { items: [], count: 0 };
        } catch (error) {
            console.error('❌ Ошибка запроса:', error);
            throw error;
        } finally {
            console.groupEnd();
        }
    }
}

export default new SeizedPropertiesService();