import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import FeedService, { FeedItem, FeedResponse, FilterParams } from '@/Domains/Feed/API/Feed/FeedService';
import debounce from 'lodash/debounce';

export enum FeedEventType {
    SeizedPropertyCreated = 'SeizedPropertyCreated',
    ValuationAdded = 'ValuationAdded',
    ResponsibleAssigned = 'ResponsibleAssigned',
    StatusChanged = 'StatusChanged' ,
    All = 'All'
}

export const useFeedStore = defineStore('feed', () => {
    // Состояние
    const feedItems = ref<FeedItem[]>([]);
    const totalCount = ref(0);
    const isLoading = ref(false);
    const error = ref<Error | null>(null);
    const page = ref(1);
    const itemsPerPage = ref(50);
    const hasMore = ref(true);
    const unreadCount = ref(0);
    const activeEventType = ref<number | undefined>(undefined);
    const lastReadPosition = ref<string | null>(null);
    const markAsReadDebounceTime = 3000; // Increased to 3 seconds for better visibility
    let markAsReadTimeout: number | null = null;

    // Вычисляемые свойства
    const isFiltered = computed(() => activeEventType.value !== null);
    const isEmpty = computed(() => feedItems.value.length === 0);
    const isInitialized = computed(() => feedItems.value.length > 0 || error.value !== null);
    const hasUnreadItems = computed(() => feedItems.value.some(item => !item.read));

    setInterval(getUnreadCount, 120_000); // Update every 2 minutes

    const debouncedCount = debounce(async () => {
        return getUnreadCount()
    }, 1000, { leading: true })

    // Загрузка ленты событий (первая страница или сброс)
    async function loadFeed(reset: boolean = false): Promise<void> {
        debouncedCount()
        try {
            if (reset) {
                page.value = 1;
                feedItems.value = [];
                hasMore.value = true;
            }

            isLoading.value = true;
            error.value = null;

            console.log('Загрузка ленты событий:', {
                reset,
                page: page.value,
                itemsPerPage: itemsPerPage.value,
                activeEventType: activeEventType.value
            });

            let response: FeedResponse;

            // Выбираем метод в зависимости от фильтра
            const params : FilterParams = {
                FeedEventType: activeEventType.value,
                page: page.value,
                perPage: itemsPerPage.value
            };
            response = await FeedService.getFeed(params);

            // Обработка ответа
            if (response) {
                console.log(`Получено ${response.items.length} событий, всего: ${response.count}`);

                // Всегда сортируем элементы по дате (по убыванию - самые новые сверху)
                const sortedItems = response.items;

                // При сбросе заменяем элементы, иначе добавляем к списку
                if (reset) {
                    feedItems.value = sortedItems;
                } else {
                    // Добавляем новые элементы и пересортировываем весь список
                    feedItems.value = [...feedItems.value, ...sortedItems];
                }

                totalCount.value = response.count;

                // Проверяем, есть ли еще элементы для загрузки
                hasMore.value = feedItems.value.length < totalCount.value;
            } else {
                console.warn('Получен пустой ответ от сервиса');
            }
        } catch (err) {
            error.value = err instanceof Error ? err : new Error('Ошибка загрузки ленты событий');
            console.error('Ошибка загрузки ленты событий:', err);
        } finally {
            isLoading.value = false;
        }
    }

    // Получение количества непрочитанных сообщений
    async function getUnreadCount(): Promise<void> {
        try {
            unreadCount.value = await FeedService.getUnreadCount();
        } catch (err) {
            console.error('Ошибка при получении количества непрочитанных сообщений:', err);
            unreadCount.value = 0;
        }
    }

    // Загрузка следующей страницы (бесконечная прокрутка)
    async function loadMore(): Promise<void> {
        if (isLoading.value || !hasMore.value) return;

        page.value++;
        await loadFeed();
    }

    // Фильтрация по типу события
    async function filterByEventType(eventType: number | undefined): Promise<void> {
        if (eventType != activeEventType.value)
        {
            if (eventType === null) eventType = undefined;
            // Принудительно сбрасываем состояние
            activeEventType.value = eventType;
            await loadFeed(true)
        }
    }

    // Отметка события как прочитанного
    async function markAsRead(eventId: string): Promise<void> {
        try {
            // Проверяем, не прочитано ли уже событие
            const item = feedItems.value.find(item => item.uid === eventId);
            if (!item || item.read) {
                return; // Пропускаем, если элемент уже прочитан или не найден
            }
            
            // console.log(`Marking item as read: ${eventId}`);
            
            // Сначала обновляем UI для немедленной обратной связи
            feedItems.value = feedItems.value.map(item => {
                if (item.uid === eventId) {
                    return { ...item, read: true };
                }
                return item;
            });
            
            // Затем отправляем запрос на сервер
            const success = await FeedService.markAsRead(eventId);

            if (success) {
                // console.log(`Successfully marked item as read: ${eventId}`);
                // Сохраняем последнюю прочитанную позицию
                lastReadPosition.value = eventId;
            } else {
                console.warn(`Server failed to mark item as read: ${eventId}`);
                // Возвращаем прежнее состояние, если запрос не удался
                feedItems.value = feedItems.value.map(item => {
                    if (item.uid === eventId) {
                        return { ...item, read: false };
                    }
                    return item;
                });
            }
        } catch (err) {
            console.error('Ошибка при отметке события как прочитанного:', err);
        }
        debouncedCount()
    }

    // Отметка события как прочитанного при прокрутке с дебаунсом
    function markAsReadOnScroll(eventId: string): void {
        // Проверяем, существует ли элемент и не прочитан ли он уже
        const feedItem = feedItems.value.find(item => item.uid === eventId);
        if (!feedItem) {
            console.warn(`Item with ID ${eventId} not found in feed items`);
            return;
        }
        
        if (feedItem.read) {
            console.log(`Item ${eventId} is already marked as read, skipping`);
            return;
        }
        
        // console.log(`Setting up debounce for marking item as read: ${eventId}`);
        
        // Очищаем предыдущий таймаут, если он существует для этого элемента
        if (markAsReadTimeout !== null) {
            window.clearTimeout(markAsReadTimeout);
            markAsReadTimeout = null;
        }

        // Устанавливаем новый таймаут с большим временем дебаунса для видимости
        markAsReadTimeout = window.setTimeout(() => {
            // console.log(`Debounce completed, marking item as read: ${eventId}`);
            // Проверяем еще раз перед отправкой запроса
            const item = feedItems.value.find(i => i.uid === eventId);
            if (item && !item.read) {
                markAsRead(eventId);
            }
            markAsReadTimeout = null;
        }, markAsReadDebounceTime);
    }

    // Получение названия типа события
    function getEventTypeLabel(type: string): string {
        // Преобразуем строковый тип из API в числовой для получения метки
        const numericType = parseInt(type, 10);
        if (!isNaN(numericType)) {
            const typeLabels: Record<number, string> = {
                [FeedEventType.SeizedPropertyCreated]: 'Создание ИИ в РМ ОРИИ',
                [FeedEventType.ValuationAdded]: 'Оценка',
                [FeedEventType.ResponsibleAssigned]: 'Назначение ответственного',
                [FeedEventType.StatusChanged]: 'Присвоение статуса "Расторгнут, изъят"',
            };
            return typeLabels[numericType] || type;
        }

        // Для строковых типов (обратная совместимость)
        const stringTypeLabels: Record<string, string> = {
            'SeizedPropertyCreated': 'Создание ИИ в РМ ОРИИ',
            'ValuationAdded': 'Оценка',
            'ResponsibleAssigned': 'Назначение ответственного',
            'StatusChanged': 'Присвоение статуса "Расторгнут, изъят"',
        };
        return stringTypeLabels[type] || type;
    }

    // Получение стиля для типа события (цвет и иконка)
    function getEventTypeStyle(type: string): { color: string; icon: string } {
        // Преобразуем строковый тип из API в числовой для получения стиля
        const numericType = parseInt(type, 10);

        if (!isNaN(numericType)) {
            const styles: Record<number, { color: string; icon: string }> = {
                [FeedEventType.SeizedPropertyCreated]: { color: 'success', icon: 'mdi-plus-circle' },
                [FeedEventType.ValuationAdded]: { color: 'info', icon: 'mdi-currency-usd' },
                [FeedEventType.ResponsibleAssigned]: { color: 'primary', icon: 'mdi-account-plus' },
                [FeedEventType.StatusChanged]: { color: 'error', icon: 'mdi-lock' }
            };
            return styles[numericType] || { color: 'grey', icon: 'mdi-bell' };
        }

        // Для null или undefined
        if (!type) {
            return { color: 'grey', icon: 'mdi-filter-variant' };
        }

        // Для строковых типов (обратная совместимость)
        const stringStyles: Record<string, { color: string; icon: string }> = {
            'SeizedPropertyCreated': { color: 'success', icon: 'mdi-plus-circle' },
            'ValuationAdded': { color: 'info', icon: 'mdi-currency-usd' },
            'ResponsibleAssigned': { color: 'primary', icon: 'mdi-account-plus' },
            'StatusChanged': { color: 'error', icon: 'mdi-lock' }
        };
        return stringStyles[type] || { color: 'grey', icon: 'mdi-bell' };
    }

    async function readAll(): Promise<void> {
        await FeedService.markAsRead(null);
        await loadFeed(true)
    }

    // Возвращаем публичный интерфейс стора
    return {
        // Состояние
        feedItems,
        totalCount,
        isLoading,
        error,
        page,
        itemsPerPage,
        hasMore,
        activeEventType,
        isFiltered,
        isEmpty,
        isInitialized,
        hasUnreadItems,
        lastReadPosition,
        unreadCount,

        // Методы
        loadFeed,
        loadMore,
        filterByEventType,
        markAsRead,
        markAsReadOnScroll,
        getEventTypeLabel,
        getEventTypeStyle,
        readAll,
        getUnreadCount,

        // Константы
        FeedEventType
    };
});