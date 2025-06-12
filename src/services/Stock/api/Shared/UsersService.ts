import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

// Интерфейсы для ответа пользователей
interface Location {
    city: string | null;
    timezone: string | null;
}

interface User {
    uid: string;
    location: Location;
    employeeDisplay: string | null;
}

interface UsersResponse {
    users: User[];
}

// Интерфейсы для запроса изменения ответственных
interface ResponsibleRequest {
    seizedPropertyUid: string;
    userUid: string;
}

interface UpdateResponsibleRequest {
    responsible: ResponsibleRequest[];
}

class UsersService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async fetchUsers(): Promise<User[]> {
        try {
            console.log('📞 Запрос списка пользователей');

            const response = await this.authenticatedRequest.makeRequest<UsersResponse>(
                'v1/users',
                { method: 'GET' }
            );

            console.log('✅ Получен список пользователей:', response?.users);

            if (!response?.users) {
                console.warn('⚠️ Список пользователей пуст');
            }

            return response?.users || [];
        } catch (error) {
            console.error("❌ Ошибка при получении пользователей:", error);
            throw error;
        }
    }

    async updateResponsible(responsibleData: ResponsibleRequest[]): Promise<void> {
        try {
            console.log('📝 Обновление ответственных:', responsibleData);

            const requestBody: UpdateResponsibleRequest = {
                responsible: responsibleData
            };

            await this.authenticatedRequest.makeRequest(
                'v1/seized-property-items/responsible',
                {
                    method: 'PATCH',
                    body: requestBody
                }
            );

            console.log('✅ Ответственные успешно обновлены');
        } catch (error) {
            console.error("❌ Ошибка при обновлении ответственных:", error);
            throw error;
        }
    }
}

export default new UsersService();