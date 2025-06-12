import {defineStore} from 'pinia';
import {ref} from 'vue';
import SeizedPropertyFiltersService from "@/Domains/Stock/API/Filters/SeizedPropertyFiltersService";
import {currentStatusGroup} from '@/stores/Shared/statusGroup'

interface ListItem {
    text: string;
    value: string | number;
    has_children?: boolean;
}

interface ApiResponse {
    uid: string;
    name: string;
    has_children?: string;
}

interface TypeResponse extends ApiResponse {
    has_children: string;
}

export const useVehicleFiltersStore = defineStore('vehicleFilters', () => {
    const PASSENGER_CAR_ID = 'passenger_car';
    // Флаги инициализации и загрузки
    const isInitialized = ref(false);
    const isLoading = ref<Record<string, boolean>>({
        statuses: false,
        liquidities: false,
        types: false,
        kinds: false,
        subKinds: false,
        brands: false,
        models: false,
        equipments: false
    });

    // Состояния для списков
    const statusItems = ref<ListItem[]>([]);
    const liquidityItems = ref<ListItem[]>([]);
    const vehicleTypeItems = ref<ListItem[]>([]);
    const vehicleKindItems = ref<ListItem[]>([]);
    const vehicleSubKindItems = ref<ListItem[]>([]);
    const brandItems = ref<ListItem[]>([]);
    const modelItems = ref<ListItem[]>([]);
    const equipmentItems = ref<ListItem[]>([]);
    const selectedTypes = ref<string[]>([]);

    // Загрузка начальных данных
    const initializeData = async (): Promise<void> => {
        if (isInitialized.value) return;

        try {
            await Promise.all([
                loadStatuses(),
                loadLiquidities(),
                loadVehicleTypes()
            ]);
            isInitialized.value = true;
        } catch (error: any) {
            console.error('Ошибка при инициализации данных:', error);
        }
    };

    // Функция сброса состояния
    async function $reset(): Promise<void> {
        statusItems.value = [];
        liquidityItems.value = [];
        vehicleTypeItems.value = [];
        vehicleKindItems.value = [];
        vehicleSubKindItems.value = [];
        brandItems.value = [];
        modelItems.value = [];
        equipmentItems.value = [];
        isInitialized.value = false;

        Object.keys(isLoading.value).forEach(key => {
            isLoading.value[key] = false;
        });

        await initializeData();
    }

    // Загрузка справочников
    const loadStatuses = async (statusGroup?: 'Active' | 'Archive'): Promise<void> => {
        try {
            isLoading.value.statuses = true;
            console.log('🔄 Загрузка статусов для группы:', statusGroup || currentStatusGroup.value);

            // Обновляем shared состояние если передана группа
            if (statusGroup) {
                currentStatusGroup.value = statusGroup;
            }

            const response = await SeizedPropertyFiltersService.fetchStatuses(currentStatusGroup.value);

            if (!response) {
                console.warn('⚠️ Пустой ответ при загрузке статусов');
                return;
            }

            statusItems.value = response.map((status: ApiResponse & { code: string }) => ({
                text: status.name,
                value: status.code
            }));

            console.log('✅ Статусы успешно загружены:', statusItems.value);
        } catch (error: any) {
            console.error('❌ Ошибка при загрузке статусов:', error);
            statusItems.value = [];
        } finally {
            isLoading.value.statuses = false;
        }
    };
    const loadLiquidities = async (): Promise<void> => {
        if (isLoading.value.liquidities || liquidityItems.value.length > 0) return;

        try {
            isLoading.value.liquidities = true;
            const response = await SeizedPropertyFiltersService.fetchLiquidities();
            liquidityItems.value = response.map((item: ApiResponse) => ({
                text: item.name,
                value: item.uid
            }));
        } catch (error: any) {
            console.error('Ошибка при загрузке ликвидности:', error);
        } finally {
            isLoading.value.liquidities = false;
        }
    };

    const loadVehicleTypes = async (): Promise<void> => {
        if (isLoading.value.types || vehicleTypeItems.value.length > 0) return;

        try {
            isLoading.value.types = true;
            const response = await SeizedPropertyFiltersService.fetchPropertyTypes();
            vehicleTypeItems.value = response.map((item: TypeResponse) => ({
                text: item.name,
                value: item.uid,
                has_children: item.has_children === 'true'
            }));
        } catch (error: any) {
            console.error('Ошибка при загрузке типов ТС:', error);
        } finally {
            isLoading.value.types = false;
        }
    };

    const handleVehicleTypeChange = async (typeIds: string[]): Promise<void> => {
        if (isLoading.value.kinds) return;

        clearDependentFields('type');

        // Проверяем что typeIds массив и не пустой
        if (!Array.isArray(typeIds) || !typeIds.length) return;

        try {
            isLoading.value.kinds = true;
            console.log('🚗 handleVehicleTypeChange - выбраны типы:', typeIds);
            selectedTypes.value = typeIds;

            const response = await SeizedPropertyFiltersService.fetchPropertyTypes(typeIds);
            vehicleKindItems.value = response.map((item: TypeResponse) => ({
                text: item.name,
                value: item.uid,
                has_children: item.has_children === 'true'
            }));

            await loadBrands({ types: typeIds });
        } catch (error: any) {
            console.error('Ошибка при загрузке видов ТС:', error);
            // Очищаем состояние при ошибке
            vehicleKindItems.value = [];
        } finally {
            isLoading.value.kinds = false;
        }
    };


    const handleVehicleKindChange = async (kindIds: string[]): Promise<void> => {
        if (isLoading.value.subKinds) return;

        clearDependentFields('kind');
        if (!kindIds?.length) return;

        try {
            isLoading.value.subKinds = true;
            console.log('🚙 handleVehicleKindChange - выбраны виды:', kindIds);
            selectedTypes.value = kindIds;

            const response = await SeizedPropertyFiltersService.fetchPropertyTypes(kindIds);
            vehicleSubKindItems.value = response.map((item: TypeResponse) => ({
                text: item.name,
                value: item.uid,
                has_children: item.has_children === 'true'
            }));

            await loadBrands({ types: kindIds });
        } catch (error: any) {
            console.error('Ошибка в handleVehicleKindChange:', error);
        } finally {
            isLoading.value.subKinds = false;
        }
    };


    const loadBrands = async (params: any): Promise<void> => {
        if (isLoading.value.brands) return;

        try {
            isLoading.value.brands = true;

            let typeIds: string[] = [];

            if (params.type) {
                typeIds = [params.type];
            } else if (params.types) {
                // Проверяем, является ли params.types массивом и не пуст ли он
                if (Array.isArray(params.types) && params.types.length > 0) {
                    // Очищаем от реактивных метаданных Vue
                    typeIds = JSON.parse(JSON.stringify(params.types));
                } else if (!Array.isArray(params.types) && params.types) {
                    typeIds = [params.types];
                }
            } else if (selectedTypes.value.length) {
                typeIds = JSON.parse(JSON.stringify(selectedTypes.value));
            }

            if (typeIds.length === 0) {
                console.log('⚠️ Пустой массив типов для загрузки брендов');
                return;
            }

            const response = await SeizedPropertyFiltersService.fetchBrands(typeIds);

            if (response?.length) {
                brandItems.value = response.map((item: ApiResponse) => ({
                    text: item.name,
                    value: item.uid
                }));
            } else {
                brandItems.value = [];
            }
        } catch (error) {
            console.error('❌ Ошибка в loadBrands:', error);
            brandItems.value = [];
        } finally {
            isLoading.value.brands = false;
        }
    };

    const loadModels = async (brandIds: string[]): Promise<void> => {
        if (isLoading.value.models) return;

        clearDependentFields('brand');
        if (!brandIds?.length) return;

        try {
            isLoading.value.models = true;
            const response = await SeizedPropertyFiltersService.fetchModels(brandIds);
            if (response?.length) {
                modelItems.value = response.map((item: ApiResponse) => ({
                    text: item.name,
                    value: item.uid
                }));
            }
        } catch (error: any) {
            console.error('Ошибка при загрузке моделей:', error);
        } finally {
            isLoading.value.models = false;
        }
    };

    const loadEquipments = async (modelIds: string[]): Promise<void> => {
        if (isLoading.value.equipments) return;

        equipmentItems.value = [];
        if (!modelIds?.length) return;

        try {
            isLoading.value.equipments = true;
            const response = await SeizedPropertyFiltersService.fetchEquipments(modelIds);
            if (response?.length) {
                equipmentItems.value = response.map((item: ApiResponse) => ({
                    text: item.name,
                    value: item.uid
                }));
            }
        } catch (error: any) {
            console.error('Ошибка при загрузке комплектаций:', error);
        } finally {
            isLoading.value.equipments = false;
        }
    };
    type ClearLevel = 'type' | 'kind' | 'brand';

    // Вспомогательная функция очистки зависимых полей
    const clearDependentFields = (level: ClearLevel): void => {
        const clearMap: Record<ClearLevel, () => void> = {
            'type': () => {
                vehicleKindItems.value = [];
                vehicleSubKindItems.value = [];
                selectedTypes.value = [];
                brandItems.value = [];
                modelItems.value = [];
                equipmentItems.value = [];
                // Убираем очистку статусов
            },
            'kind': () => {
                vehicleSubKindItems.value = [];
                brandItems.value = [];
                modelItems.value = [];
                equipmentItems.value = [];
            },
            'brand': () => {
                modelItems.value = [];
                equipmentItems.value = [];
            }
        };

        clearMap[level]();
    };

    const handleVehicleSubKindChange = async (subKindIds: string[]): Promise<void> => {
        if (!subKindIds?.length) return;

        try {
            console.log('🚐 handleVehicleSubKindChange - выбраны подвиды:', subKindIds);
            selectedTypes.value = subKindIds;
            await loadBrands({ types: subKindIds });
        } catch (error: any) {
            console.error('Ошибка при обработке подвида ТС:', error);
        }
    };
    return {
        // Состояния
        statusItems,
        liquidityItems,
        vehicleTypeItems,
        vehicleKindItems,
        vehicleSubKindItems,
        brandItems,
        modelItems,
        PASSENGER_CAR_ID,
        equipmentItems,
        selectedTypes,
        // Флаги
        isInitialized,
        isLoading,
        // Методы
        loadStatuses,
        handleVehicleSubKindChange,
        loadLiquidities,
        loadVehicleTypes,
        handleVehicleTypeChange,
        handleVehicleKindChange,
        loadBrands,
        loadModels,
        loadEquipments,
        initializeData,
        $reset
    };
});