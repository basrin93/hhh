import { ref } from 'vue';

export function useFilterInitialization(store, handleAsync) {
    const isInitializing = ref(false);

    /**
     * Инициализирует фильтры с заданными значениями
     * @param filters - Объект с текущими фильтрами
     */
    async function initializeFilters(filters) {
        isInitializing.value = true;
        try {
            // Инициализация диапазонных фильтров обрабатывается в компоненте

            // Шаг 1: Инициализация базовых справочников
            if (!store.isInitialized) {
                await handleAsync(async () => {
                    await store.initializeData();
                }, 'инициализация базовых справочников');
            }

            // Шаг 2: Инициализация выбранных ранее фильтров
            if (filters.vehicleType?.length) {
                await handleAsync(async () => {
                    await store.handleVehicleTypeChange(filters.vehicleType);
                }, 'инициализация видов ТС');
            }

            if (filters.vehicleKind?.length) {
                await handleAsync(async () => {
                    await store.handleVehicleKindChange(filters.vehicleKind);
                }, 'инициализация подвидов ТС');
            }

            if (filters.vehicleSubKind?.length) {
                await handleAsync(async () => {
                    await store.loadBrands({ types: filters.vehicleSubKind });
                }, 'инициализация брендов из подвидов');
            }

            if (filters.brand?.length) {
                await handleAsync(async () => {
                    await store.loadModels(filters.brand);
                }, 'инициализация моделей');
            }

            if (filters.model?.length) {
                await handleAsync(async () => {
                    await store.loadEquipments(filters.model);
                }, 'инициализация комплектаций');
            }
        } catch (error) {
            console.error('Ошибка инициализации фильтров:', error);
        } finally {
            isInitializing.value = false;
        }
    }

    return {
        isInitializing,
        initializeFilters
    };
}