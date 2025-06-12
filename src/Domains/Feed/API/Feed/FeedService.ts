import {useAuthenticatedRequest} from '@/composables/Auth/useAuthenticatedRequest';

/**
 * Интерфейс события в ленте
 */
export interface FeedItem {
    uid: string;
    event_type: string;
    title: string;
    description: string;
    created_at: string;
    entity_uid: string;
    payload: string;
    read?: boolean;
}

/**
 * Интерфейс ответа с событиями
 */
export interface FeedResponse {
    count: number;
    items: FeedItem[];
}

/**
 * Интерфейс запроса с параметрами
 */
export interface FilterParams {
    FeedEventType?: number;
    page?: number;
    perPage?: number;
}

/**
 * Сервис для работы с лентой событий
 */
class FeedService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    /**
     * Получение списка событий
     * @param page Номер страницы
     * @param perPage Элементов на странице
     */
    async getFeed(params: FilterParams): Promise<FeedResponse> {
        try {
            console.log('FeedService.getFeed вызван с параметрами:', params);

            const response = await this.authenticatedRequest.makeRequest<FeedResponse>(
                'v1/feed',
                {
                    method: 'GET',
                    params: params
                }
            );

            return this.processResponse(response);
        } catch (error) {
            console.error('Ошибка при получении ленты событий:', error);
            // Возвращаем пустой результат вместо выбрасывания исключения
            return { count: 0, items: [] };
        }
    }

    /**
     * Получение количества непрочитанных сообщений
     */
    async getUnreadCount(): Promise<number> {
        try {
            const response = await this.authenticatedRequest.makeRequest<number>(
                'v1/feed/unread-count',
                {
                    method: 'GET'
                }
            );

            return response || 0;
        } catch (error) {
            console.error('Ошибка при получении количества непрочитанных сообщений:', error);
            return 0;
        }
    }

    /**
     * Отметка события как прочитанного
     * @param feedItemUid ID события
     */
    async markAsRead(feedItemUid: string | null): Promise<boolean> {
        try {
            await this.authenticatedRequest.makeRequest(
                'v1/feed/mark-read',
                {
                    method: 'POST',
                    body: {
                        feed_item: feedItemUid
                    }
                }
            );
            return true;
        } catch (error) {
            console.error('Ошибка при отметке события как прочитанного:', error);
            return false;
        }
    }

    /**
     * Обработка ответа API
     * @param response Ответ от API
     */
    private processResponse(response: FeedResponse | null): FeedResponse {
        if (!response || !response.items) {
            return { count: 0, items: [] };
        }

        // Дополнительная обработка данных, если потребуется
        const processedItems = response.items.map(item => ({
            ...item,
            // Добавляем обработку данных, если нужно
        }));

        return {
            count: response.count || processedItems.length,
            items: processedItems
        };
    }
}

export default new FeedService();