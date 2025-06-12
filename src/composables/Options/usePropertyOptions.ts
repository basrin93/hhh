import {computed, nextTick, ref, watch} from 'vue';
import type {CategoryOption} from '@/types/options';
import {useCategoryOptions} from '@/composables/Options/useCategoryOptions';
import {useOptionsStore} from '@/Domains/StockDetails/Stores/options';
import SeizedPropertyOptionsService from '@/Domains/StockDetails/API/Options/SeizedPropertyOptionsService';

interface FormState {
    [key: string]: any;
}

interface TabItem {
    id: string;
    title: string;
}

export function usePropertyOptions(options: CategoryOption[]) {
    const optionsStore = useOptionsStore();
    const isEditing = ref(false);
    const formState = ref<FormState>({});
    const activeTabIndex = ref(0);
    const validationAttempted = ref(false);
    const initialFormFilled = ref(false);

    const {
        groupedOptions,
        getCategoryTitle,
        isArrayType,
        formatSelectItems,
    } = useCategoryOptions(options);

    // Табы для категорий
    const tabsList = computed<TabItem[]>(() => {
        return Object.keys(groupedOptions.value).map(categoryId => ({
            id: categoryId,
            title: getCategoryTitle(categoryId)
        }));
    });

    // Цвета для селекта
    const colorItems = computed(() => {
        return optionsStore.getColorOptions.map(color => ({
            text: color.name,
            value: color.uid
        }));
    });

    // Получение первого кода цвета из составных цветов
    const getFirstColorCode = (colorCode: string) => {
        if (!colorCode) return '';
        return colorCode.split(',')[0];
    };

    // Устанавливаем вкладку MAIN по умолчанию
    watch(tabsList, (newTabs) => {
        if (newTabs.length > 0) {
            const mainIndex = newTabs.findIndex(tab => tab.id === 'MAIN');
            if (mainIndex >= 0 && activeTabIndex.value !== mainIndex) {
                activeTabIndex.value = mainIndex;
            }
        }
    }, { immediate: true });

    // Инициализация формы из опций
    const initializeForm = () => {
        if (initialFormFilled.value && isEditing.value) {
            return;
        }

        const newState: FormState = {};
        const allValues = optionsStore.getAllValues;

        // Парсим options
        let optionsObj = {};
        try {
            if (allValues.options) {
                optionsObj = typeof allValues.options === 'string'
                    ? JSON.parse(allValues.options)
                    : allValues.options;
            }
        } catch (e) {
            // Игнорируем ошибку парсинга
        }

        // Заполняем форму из опций
        options.forEach(option => {
            const sysname = option.option_sysname;

            // Обработка селектов
            if (isArrayType(option.input_type) && option.option_values?.length > 0) {
                const formattedItems = formatSelectItems(option.option_values);
                let foundValue = null;

                // 1. Проверяем значение из самой опции
                if (option.value !== undefined && option.value !== null) {
                    // Прямое совпадение по value
                    const matchByValue = formattedItems.find(item => item.value === option.value);
                    if (matchByValue) {
                        foundValue = matchByValue.value;
                    }
                    // Строковое совпадение по text (если значение - строка)
                    else if (typeof option.value === 'string') {
                        const textValue = option.value.toLowerCase();
                        const matchByText = formattedItems.find(item =>
                            String(item.text).toLowerCase() === textValue ||
                            String(item.text).toLowerCase().includes(textValue) ||
                            textValue.includes(String(item.text).toLowerCase())
                        );

                        if (matchByText) {
                            foundValue = matchByText.value;
                        }
                    }
                }

                // 2. Проверяем значение из allValues
                if (!foundValue && allValues[sysname] !== undefined) {
                    // Прямое совпадение по value
                    const matchByValue = formattedItems.find(item => item.value === allValues[sysname]);
                    if (matchByValue) {
                        foundValue = matchByValue.value;
                    }
                    // Строковое совпадение (если allValues[sysname] - строка)
                    else if (typeof allValues[sysname] === 'string') {
                        const textValue = allValues[sysname].toLowerCase();
                        const matchByText = formattedItems.find(item =>
                            String(item.text).toLowerCase() === textValue ||
                            String(item.text).toLowerCase().includes(textValue) ||
                            textValue.includes(String(item.text).toLowerCase())
                        );

                        if (matchByText) {
                            foundValue = matchByText.value;
                        }
                    }
                }

                // 3. Проверяем в optionsObj
                if (!foundValue && optionsObj[sysname] !== undefined) {
                    const textValue = String(optionsObj[sysname]).toLowerCase();
                    const matchByOptions = formattedItems.find(item =>
                        String(item.text).toLowerCase() === textValue ||
                        String(item.text).toLowerCase().includes(textValue) ||
                        textValue.includes(String(item.text).toLowerCase())
                    );

                    if (matchByOptions) {
                        foundValue = matchByOptions.value;
                    }
                }

                // 4. Если всё ещё нет значения, берём первый элемент
                if (foundValue === null && formattedItems.length > 0) {
                    foundValue = formattedItems[0].value;
                }

                newState[sysname] = foundValue;
            }
            // Простые поля
            else {
                if (option.value !== undefined && option.value !== null) {
                    newState[sysname] = option.value;
                } else if (allValues[sysname] !== undefined) {
                    if (option.input_type === 'bool') {
                        newState[sysname] = Boolean(allValues[sysname]);
                    } else if (option.input_type === 'int') {
                        newState[sysname] = Number(allValues[sysname]);
                    } else {
                        newState[sysname] = allValues[sysname];
                    }
                }
            }
        });

        // Специальные поля
        ['owners_count', 'mileage', 'engine_hours'].forEach(field => {
            if (allValues[field] !== undefined) {
                newState[field] = Number(allValues[field]);
            }
        });

        if (allValues.description !== undefined) {
            newState.description = allValues.description;
        }

        // Объектные поля
        if (allValues.color?.uid) {
            newState.color = allValues.color.uid;
        }

        if (allValues.keys_count?.value) {
            newState.keys_count = allValues.keys_count.value;
        }

        if (allValues.condition_status?.value) {
            newState.condition_status = allValues.condition_status.value;
        }

        if (allValues.interior_type?.value) {
            newState.interior_type = allValues.interior_type.value;
        }

        if (allValues.wheels?.value) {
            newState.wheels = allValues.wheels.value;
        }

        if (allValues.glasses?.value) {
            newState.glasses = allValues.glasses.value;
        }
        

        // Важно! Сначала применяем значения, затем устанавливаем флаг
        formState.value = { ...newState };
        // Принудительное обновление в следующем тике
        nextTick(() => {
            initialFormFilled.value = true;
        });
    };

    // Обработка изменения полей
    const handleFieldUpdate = (sysname: string, value: any) => {
        const option = options.find(opt => opt.option_sysname === sysname);
        if (!option) return;

        let processedValue = null;

        if (value === null || value === '') {
            processedValue = null;
        } else {
            switch (option.input_type) {
                case 'array[object]':
                    processedValue = value;
                    break;
                case 'int':
                    processedValue = value === '' ? 0 : Number(value);
                    break;
                case 'bool':
                    processedValue = Boolean(value);
                    break;
                default:
                    processedValue = String(value).trim();
            }
        }

        // Обновляем значение в formState
        formState.value[sysname] = processedValue;

        // Обновляем значение в опциях для валидации
        const optionIndex = options.findIndex(opt => opt.option_sysname === sysname);
        if (optionIndex > -1) {
            options[optionIndex].value = processedValue;
        }
    };

    // Проверка валидности поля
    const isFieldInvalid = (item: any) => {
        if (!item.is_required || !validationAttempted.value) return false;

        const value = formState.value[item.option_sysname];
        return value === null || value === undefined || value === '' ||
            (Array.isArray(value) && value.length === 0);
    };

    // Сообщение об ошибке
    const getErrorMessage = (item: any) => {
        if (isFieldInvalid(item)) {
            return 'Обязательное поле';
        }
        return '';
    };

    // Валидация формы
    const validateForm = () => {
        validationAttempted.value = true;

        // Проверяем обязательные поля
        const requiredFields = options.filter(option => option.is_required);
        const invalidFields = requiredFields.filter(option => {
            const value = formState.value[option.option_sysname];
            return value === null || value === undefined || value === '' ||
                (Array.isArray(value) && value.length === 0);
        });

        // Переключаемся на вкладку с ошибкой
        if (invalidFields.length > 0) {
            const invalidField = invalidFields[0];
            const categoryId = invalidField.option_category;
            const tabIndex = tabsList.value.findIndex(tab => tab.id === categoryId);

            if (tabIndex !== -1) {
                activeTabIndex.value = tabIndex;
            }
            return false;
        }
        return true;
    };

    // Подготовка данных для отправки
    const prepareRequestData = () => {
        const colorOption = optionsStore.getColorOptions.find(c => c.uid === formState.value['color']);
        const keysCountOption = options.find(opt => opt.option_sysname === 'keys_count')?.option_values.find(v => v.value === formState.value['keys_count']);
        const conditionOption = options.find(opt => opt.option_sysname === 'condition_status')?.option_values.find(v => v.value === formState.value['condition_status']);
        const interiorOption = options.find(opt => opt.option_sysname === 'interior_type')?.option_values.find(v => v.value === formState.value['interior_type']);
        const wheelsOption = options.find(opt => opt.option_sysname === 'wheels')?.option_values.find(v => v.value === formState.value['wheels']);
        const glassesOption = options.find(opt => opt.option_sysname === 'glasses')?.option_values.find(v => v.value === formState.value['glasses']);

        const requestBody = {
            // Числовые поля
            owners_count: Number(formState.value['owners_count'] ?? 0),
            mileage: Number(formState.value['mileage'] ?? 0),
            engine_hours: Number(formState.value['engine_hours'] ?? 0),

            // Строковые поля
            description: String(formState.value['description'] ?? ''),

            // Двоичные поля
            damage: formState.value['damage'] ?? null,

            // Объектные поля
            color: colorOption ? {
                uid: colorOption.uid,
                name: colorOption.name
            } : null,

            keys_count: keysCountOption ? {
                name: keysCountOption.name,
                value: keysCountOption.value
            } : null,

            condition_status: conditionOption ? {
                name: conditionOption.name,
                value: conditionOption.value
            } : null,

            interior_type: interiorOption ? {
                name: interiorOption.name,
                value: interiorOption.value
            } : null,

            wheels: wheelsOption ? {
                name: wheelsOption.name,
                value: wheelsOption.value
            } : null,

            glasses: glassesOption ? {
                name: glassesOption.name,
                value: glassesOption.value
            } : null,

            options: '{}'
        };

        // Добавляем дополнительные опции
        const customOptions = {};
        Object.entries(formState.value).forEach(([key, value]) => {
            if (!Object.keys(requestBody).includes(key) && value !== null) {
                const option = options.find(opt => opt.option_sysname === key);
                if (option?.option_values?.length) {
                    const optionValue = option.option_values.find(v => v.value === value);
                    customOptions[key] = optionValue?.name || value;
                } else {
                    customOptions[key] = value;
                }
            }
        });

        if (Object.keys(customOptions).length) {
            requestBody.options = JSON.stringify(customOptions);
        }

        requestBody['request'] = 'update-options';
        return requestBody;
    };

    // Управление редактированием
    const startEditing = () => {
        isEditing.value = true;
        validationAttempted.value = false;
    };

    const cancelEditing = () => {
        isEditing.value = false;
        validationAttempted.value = false;
        // Сбрасываем к исходным значениям
        initialFormFilled.value = false;
        initializeForm();
    };


// Сохранение изменений
    const saveChanges = async () => {
        try {
            if (!validateForm()) return;

            const urlParams = new URLSearchParams(window.location.search);
            const propertyUid = urlParams.get('uid');

            if (!propertyUid) {
                console.error('UID не найден в URL параметрах');
                return;
            }

            const requestData = prepareRequestData();
            await SeizedPropertyOptionsService.updatePropertyOptions(propertyUid, requestData);

            isEditing.value = false;
            validationAttempted.value = false;
        } catch (error) {
            console.error('Ошибка при сохранении:', error);
        }
    };

    return {
        // Состояние
        formState,
        isEditing,
        activeTabIndex,
        validationAttempted,
        // Вычисляемые свойства
        tabsList,
        groupedOptions,
        colorItems,

        // Методы
        initializeForm,
        handleFieldUpdate,
        isFieldInvalid,
        getErrorMessage,
        validateForm,
        startEditing,
        cancelEditing,
        saveChanges,
        isArrayType,
        formatSelectItems,
        getFirstColorCode
    };
}