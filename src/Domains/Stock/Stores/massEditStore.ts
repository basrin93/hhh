import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import EditableFieldsService from '@/Domains/Stock/API/EditableFieldsService';
import SeizedPropertyFiltersService from '@/Domains/Stock/API/Filters/SeizedPropertyFiltersService';
import SeizedPropertyStatusService, {StatusGroup} from '@/Domains/StockDetails/API/Status/SeizedPropertyStatusService';
import UsersService from '@/services/Stock/api/Shared/UsersService';

export const useMassEditStore = defineStore('massEdit', () => {
    // Состояние
    const isLoading = ref(false);
    const isStatusLoading = ref(false);
    const isUsersLoading = ref(false);
    const isKeysCountLoading = ref(false);

    const fields = ref([]);
    const statusOptions = ref([]);
    const userOptions = ref([]);
    const keysCountOptions = ref([]);

    // Выбранные объекты и предупреждение
    const selectedItemsCount = ref(0);
    const showMultiSelectWarning = ref(false);

    // Статичные опции для ограничений
    const restrictionOptions = ref([
        { text: 'Да', value: true },
        { text: 'Нет', value: false }
    ]);

    const formState = ref({
        status: null,
        responsible_user: null,
        keys_count: null,
        owners_count: null,
        restrictions: null,
        mileage: null,
        engine_hours: null,
        realization_cost: null
    });

    // Выбранные поля для редактирования
    const selectedFieldCodes = ref([]);

    // Функция для проверки доступности поля для массового редактирования
    const isFieldAvailableForMassEdit = computed(() => {
        return (fieldCode) => {
            if (selectedItemsCount.value <= 1) return true;

            const field = fields.value.find(f => f.code === fieldCode);
            return field ? field.massChange : true;
        };
    });

    // Функция получения списка полей с проверкой доступности
    const availableFields = computed(() => {
        return fields.value.map(field => ({
            ...field,
            disabled: selectedItemsCount.value > 1 && !field.massChange
        }));
    });

    // Действия
    async function loadFields() {
        isLoading.value = true;
        try {
            const response = await EditableFieldsService.fetchEditableFields('active');
            if (response && response.rows) {
                fields.value = response.rows;
            }
        } catch (error) {
            console.error('Ошибка загрузки полей:', error);
            fields.value = [];
        } finally {
            isLoading.value = false;
        }
    }

    // Установка количества выбранных элементов и обновление предупреждения
    function setSelectedItemsCount(count) {
        selectedItemsCount.value = count;

        // Проверяем, нужно ли показывать предупреждение
        if (count > 1) {
            // Проверяем выбраны ли поля, недоступные для массового редактирования
            const hasNonMassFields = selectedFieldCodes.value.some(code => {
                const field = fields.value.find(f => f.code === code);
                return field && !field.massChange;
            });

            showMultiSelectWarning.value = hasNonMassFields;

            // Если выбраны поля, недоступные для массового редактирования, удаляем их из выбора
            if (hasNonMassFields) {
                selectedFieldCodes.value = selectedFieldCodes.value.filter(code => {
                    const field = fields.value.find(f => f.code === code);
                    return field && field.massChange;
                });
            }
        } else {
            showMultiSelectWarning.value = false;
        }
    }

    // Обработчик изменения выбранных полей
    function handleFieldsChange(selectedCodes) {
        if (selectedItemsCount.value > 1) {
            // Фильтруем выбранные поля, оставляя только доступные для массового редактирования
            selectedFieldCodes.value = selectedCodes.filter(code => {
                const field = fields.value.find(f => f.code === code);
                return field && field.massChange;
            });
        } else {
            selectedFieldCodes.value = selectedCodes;
        }
    }

    async function loadStatusOptions(selectedStatuses = []) {
        if (isStatusLoading.value) return;
        isStatusLoading.value = true;

        try {
            console.log('Загрузка статусов для выбранных элементов:', selectedStatuses);

            if (!selectedStatuses.length) {
                console.warn('Нет выбранных элементов со статусами');
                statusOptions.value = [];
                return;
            }

            // Отладка объектов статусов
            selectedStatuses.forEach((status, index) => {
                console.log(`Элемент ${index}:`, status);
                console.log(`  statusCode:`, status.statusCode);
            });

            // Получаем отфильтрованные статусы
            const filteredStatuses = selectedStatuses.filter(item => Boolean(item.statusCode));
            console.log('Отфильтрованные статусы:', filteredStatuses);

            // Получаем массив кодов статусов
            const statusCodes = filteredStatuses.map(item => item.statusCode);
            console.log('Все коды статусов:', statusCodes);

            // Получаем уникальные коды статусов с помощью другого метода
            const uniqueStatusCodes = Array.from(new Set(statusCodes));
            console.log('Уникальные коды статусов:', uniqueStatusCodes);

            if (uniqueStatusCodes.length === 0) {
                console.warn('Не удалось найти уникальные коды статусов, возвращаем стандартный набор');
                // Fallback статусы
                statusOptions.value = [
                    { code: 'TerminatedNotSeized', name: 'Расторгнут, не изъят', isAvailableForAll: true },
                    { code: 'TerminatedSeized', name: 'Расторгнут, изъят', isAvailableForAll: true },
                    { code: 'TerminatedImpossibleSeized', name: 'Расторгнут, невозможно изъять', isAvailableForAll: true },
                    { code: 'TerminatedSelling', name: 'Расторгнут, на продаже', isAvailableForAll: true },
                    { code: 'Returned', name: 'Возврат', isAvailableForAll: true },
                    { code: 'Leased', name: 'Аренда', isAvailableForAll: true },
                    { code: 'Sold', name: 'Продан', isAvailableForAll: true }
                ];
                return;
            }

            // Получаем доступные статусы для каждого уникального кода статуса
            const allStatusesPromises = [];

            for (const statusCode of uniqueStatusCodes) {
                console.log(`Запрос доступных статусов для кода: ${statusCode}`);
                try {
                    const promise = SeizedPropertyStatusService.authenticatedRequest.makeRequest(
                        'v1/seized-property-items/statuses',
                        {
                            method: 'GET',
                            params: {
                                status_group: StatusGroup.All,
                                current_status: statusCode
                            }
                        }
                    );
                    allStatusesPromises.push(promise);
                } catch (err) {
                    console.error(`Ошибка при создании запроса для статуса ${statusCode}:`, err);
                }
            }

            console.log(`Создано ${allStatusesPromises.length} запросов на получение статусов`);

            if (allStatusesPromises.length === 0) {
                console.warn('Нет запросов на получение статусов');
                statusOptions.value = [];
                return;
            }

            const results = await Promise.all(allStatusesPromises);
            console.log('Результаты запросов доступных статусов:', results);

            // Обработка результатов
            const statusCounts = new Map();
            const allStatuses = [];

            results.forEach(statuses => {
                if (Array.isArray(statuses)) {
                    statuses.forEach(status => {
                        allStatuses.push(status);
                        statusCounts.set(status.code, (statusCounts.get(status.code) || 0) + 1);
                    });
                }
            });

            const mergedStatuses = [];
            const addedCodes = new Set();

            allStatuses.forEach(status => {
                if (!addedCodes.has(status.code)) {
                    addedCodes.add(status.code);
                    const isAvailableForAll = statusCounts.get(status.code) === uniqueStatusCodes.length;
                    mergedStatuses.push({
                        ...status,
                        isAvailableForAll
                    });
                }
            });

            console.log('Объединенные статусы с пометками доступности:', mergedStatuses);
            statusOptions.value = mergedStatuses;
        } catch (error) {
            console.error('Ошибка при загрузке доступных статусов:', error);
            statusOptions.value = [];
        } finally {
            isStatusLoading.value = false;
        }
    }

    async function loadUsers() {
        if (isUsersLoading.value) return;

        isUsersLoading.value = true;
        try {
            const users = await UsersService.fetchUsers();

            userOptions.value = users.map(user => ({
                uid: user.uid,
                name: user.employeeDisplay || 'Без имени',
                city: user.location?.city || null,
                timezone: user.location?.timezone || null
            }));
        } catch (error) {
            console.error('Ошибка загрузки пользователей:', error);
            userOptions.value = [];
        } finally {
            isUsersLoading.value = false;
        }
    }

    async function loadKeysCount() {
        if (isKeysCountLoading.value) return;

        isKeysCountLoading.value = true;
        try {
            // Статически определяем маппинг ключей
            const keyMapping = [
                { name: 'Не применимо', value: 'NONE' },
                { name: '1 ключ', value: 'ONE' },
                { name: '2 ключа', value: 'TWO' }
            ];

            // Если есть ответ от сервиса, можно использовать его для дополнительной логики
            const response = await SeizedPropertyFiltersService.fetchKeysCount();

            // Используем предопределенный маппинг
            keysCountOptions.value = keyMapping.map(item => ({
                text: item.name,
                value: item.value
            }));
        } catch (error) {
            console.error('Ошибка загрузки списка количества ключей:', error);
            // Fallback - используем статический маппинг даже при ошибке
            keysCountOptions.value = [
                { text: 'Не применимо', value: 'NONE' },
                { text: '1 ключ', value: 'ONE' },
                { text: '2 ключа', value: 'TWO' }
            ];
        } finally {
            isKeysCountLoading.value = false;
        }
    }

    function resetForm() {
        selectedFieldCodes.value = [];
        formState.value = {
            status: null,
            responsible_user: null,
            keys_count: null,
            owners_count: null,
            restrictions: null,
            mileage: null,
            engine_hours: null,
            realization_cost: null
        };
        statusOptions.value = [];
        userOptions.value = [];
        keysCountOptions.value = [];
        showMultiSelectWarning.value = false;
    }

    return {
        // Состояние
        isLoading,
        isStatusLoading,
        isUsersLoading,
        isKeysCountLoading,
        fields,
        statusOptions,
        userOptions,
        keysCountOptions,
        restrictionOptions,
        formState,
        selectedFieldCodes,
        selectedItemsCount,
        showMultiSelectWarning,
        isFieldAvailableForMassEdit,
        availableFields,

        // Методы
        loadFields,
        loadStatusOptions,
        loadUsers,
        loadKeysCount,
        resetForm,
        setSelectedItemsCount,
        handleFieldsChange
    };
});