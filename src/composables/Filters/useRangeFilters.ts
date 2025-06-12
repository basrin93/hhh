import { computed, ref, watch } from 'vue';

// Типы для полей
interface FieldConfig {
    name: string;          // Имя поля
    label: string;         // Отображаемое название
    type: string;          // Тип ввода (date, text, number)
    minLabel: string;      // Метка для минимального значения
    maxLabel: string;      // Метка для максимального значения
    minValue?: string;     // Минимально возможное значение
    maxValue?: string;     // Максимально возможное значение
    maxLength?: number;    // Максимальная длина ввода
    validation: string;    // Тип валидации
}

// Типы для валидации полей
interface ValidationRules {
    min: number;
    max: number;
    format?: RegExp;
    warningThreshold?: number;
    warningMessage?: string;
}

export function useRangeFilters(filters, emit) {
    // Константы для валидации
    const VALIDATION_RULES = {
        year: {
            min: 1900,
            max: new Date().getFullYear(),
            format: /^\d{4}$/,
            warningThreshold: null,
            warningMessage: null
        },
        powerHP: {
            min: 1,
            max: 10000,
            format: /^\d+$/,
            warningThreshold: 500,
            warningMessage: 'Мощность более 500 л.с., проверьте значение'
        },
        powerKW: {
            min: 1,
            max: 7500,
            format: /^\d+$/,
            warningThreshold: 400,
            warningMessage: 'Мощность более 400 кВт, проверьте значение'
        },
        mileage: {
            min: 0,
            max: 10000000,
            format: /^\d+$/,
            warningThreshold: 1000000,
            warningMessage: 'Введен пробег больше 1 млн. км, проверьте значение'
        },
        engineHours: {
            min: 0,
            max: 10000000,
            format: /^\d+$/,
            warningThreshold: 100000,
            warningMessage: 'Введено очень большое значение наработки, проверьте значение'
        }
    };

    // Определение всех полей
    const FIELD_CONFIGS: FieldConfig[] = [
        {
            name: 'dateOfSeizure',
            label: 'Дата изъятия',
            type: 'date',
            minLabel: 'с',
            maxLabel: 'по',
            minValue: '1900-01-01',
            validation: 'date'
        },
        {
            name: 'mileage',
            label: 'Пробег',
            type: 'text',
            minLabel: 'от',
            maxLabel: 'до',
            validation: 'mileage'
        },
        {
            name: 'engineHours',
            label: 'Наработка',
            type: 'text',
            minLabel: 'от',
            maxLabel: 'до',
            validation: 'engineHours'
        },
        {
            name: 'year',
            label: 'Год выпуска',
            type: 'text',
            minLabel: 'от',
            maxLabel: 'до',
            maxLength: 4,
            validation: 'year'
        },
        {
            name: 'powerHP',
            label: 'Мощность (л/с)',
            type: 'number',
            minLabel: 'от',
            maxLabel: 'до',
            minValue: '0',
            validation: 'powerHP'
        },
        {
            name: 'powerKW',
            label: 'Мощность (кВт)',
            type: 'number',
            minLabel: 'от',
            maxLabel: 'до',
            minValue: '0',
            validation: 'powerKW'
        }
    ];

    // Создаем структуру для значений и ошибок
    const inputs = {};
    const errors = {};

    // Инициализируем поля на основе конфигурации
    FIELD_CONFIGS.forEach(field => {
        inputs[field.name] = { min: ref(''), max: ref('') };
        errors[field.name] = { min: ref(''), max: ref('') };
    });

    // Создаем функцию выполнения валидации по типу поля
    const validateField = (fieldName, boundType) => {
        const fieldConfig = FIELD_CONFIGS.find(f => f.name === fieldName);
        if (!fieldConfig) return;

        const value = inputs[fieldName][boundType].value;
        errors[fieldName][boundType].value = '';

        // Пустое значение всегда валидно
        if (!value) return true;

        // Получаем правила валидации в зависимости от типа поля
        if (fieldConfig.validation === 'date') {
            return validateDate(fieldName, boundType);
        } else {
            const rules = VALIDATION_RULES[fieldConfig.validation];
            return validateNumericField(fieldName, boundType, rules);
        }
    };

    // Валидация числового поля
    const validateNumericField = (fieldName, boundType, rules) => {
        const value = inputs[fieldName][boundType].value;

        // Проверка формата
        if (rules.format && !rules.format.test(value)) {
            errors[fieldName][boundType].value =
                fieldName === 'year'
                    ? 'Год должен содержать 4 цифры'
                    : 'Поле должно содержать только цифры';
            return false;
        }

        // Преобразуем и проверяем диапазон
        const numValue = parseInt(value, 10);

        if (numValue < rules.min) {
            errors[fieldName][boundType].value = `Значение должно быть не меньше ${rules.min}`;
            return false;
        }

        if (numValue > rules.max) {
            errors[fieldName][boundType].value = `Значение должно быть не больше ${rules.max}`;
            return false;
        }

        // Проверка с min только для max
        if (boundType === 'max' && inputs[fieldName].min.value) {
            const minValue = parseInt(inputs[fieldName].min.value, 10);
            if (!errors[fieldName].min.value && numValue < minValue) {
                errors[fieldName][boundType].value = 'Значение "до" не может быть меньше значения "от"';
                return false;
            }
        }

        // Предупреждения для больших значений
        if (rules.warningThreshold && numValue >= rules.warningThreshold) {
            errors[fieldName][boundType].value = rules.warningMessage;
            // Это предупреждение, а не ошибка, поэтому возвращаем true
            return true;
        }

        return true;
    };

    // Валидация даты
    const validateDate = (fieldName, boundType) => {
        const value = inputs[fieldName][boundType].value;

        try {
            const date = new Date(value);
            const year = date.getFullYear();
            if (year < 1900 || year > new Date().getFullYear()) {
                errors[fieldName][boundType].value = 'Дата должна быть между 1900 и текущим годом';
                return false;
            }

            // Проверка с min только для max
            if (boundType === 'max' && inputs[fieldName].min.value) {
                const minDate = new Date(inputs[fieldName].min.value);
                if (!errors[fieldName].min.value && date < minDate) {
                    errors[fieldName][boundType].value = 'Дата "по" не может быть раньше даты "с"';
                    return false;
                }
            }

            return true;
        } catch (e) {
            errors[fieldName][boundType].value = 'Некорректный формат даты';
            return false;
        }
    };

    // Функция валидации всех полей
    const validateAll = () => {
        let isValid = true;
        FIELD_CONFIGS.forEach(field => {
            const minValid = validateField(field.name, 'min');
            const maxValid = validateField(field.name, 'max');
            // Если есть ошибка валидации (не предупреждение), отмечаем как невалидно
            if (minValid === false || maxValid === false) {
                isValid = false;
            }
        });
        return isValid;
    };

    // Проверка наличия ошибок
    const hasValidationErrors = computed(() => {
        return Object.values(errors).some(group =>
            group.min.value || group.max.value
        );
    });

    // Синхронизация значений из фильтров
    function syncInputValues() {
        FIELD_CONFIGS.forEach(field => {
            // Общая логика для числовых полей
            ['min', 'max'].forEach(boundType => {
                const propKey = `${field.name}${boundType === 'min' ? 'Min' : 'Max'}`;

                if (filters[propKey] !== null && filters[propKey] !== undefined) {
                    if (field.type === 'date') {
                        // Особая обработка для дат
                        inputs[field.name][boundType].value = filters[propKey].includes('T')
                            ? filters[propKey].split('T')[0]
                            : filters[propKey];
                    } else {
                        // Обработка для числовых полей
                        inputs[field.name][boundType].value = String(filters[propKey]);
                    }
                }
            });
        });

        // Валидация всех полей после синхронизации
        validateAll();
    }

    // Применение диапазонных фильтров
    function applyRangeFilters() {
        const isValid = validateAll();
        if (!isValid) return false;

        FIELD_CONFIGS.forEach(field => {
            ['min', 'max'].forEach(boundType => {
                const propKey = `${field.name}${boundType === 'min' ? 'Min' : 'Max'}`;
                const value = inputs[field.name][boundType].value;

                let processedValue;
                if (field.type === 'date') {
                    processedValue = value || null;
                } else {
                    processedValue = value ? parseInt(value, 10) : null;
                }

                emit('update:filter', propKey, processedValue);
            });
        });

        return true;
    }

    // Сброс диапазонных фильтров
    function resetRangeFilters() {
        // Сброс всех полей ввода и ошибок
        Object.values(inputs).forEach(group => {
            group.min.value = '';
            group.max.value = '';
        });

        Object.values(errors).forEach(group => {
            group.min.value = '';
            group.max.value = '';
        });
    }

    // Подсчет активных диапазонных фильтров
    function countActiveRangeFilters() {
        return Object.values(inputs).reduce((count, group) => {
            return count + (group.min.value ? 1 : 0) + (group.max.value ? 1 : 0);
        }, 0);
    }

    // Настройка наблюдателей за изменениями
    FIELD_CONFIGS.forEach(field => {
        ['min', 'max'].forEach(boundType => {
            watch(inputs[field.name][boundType], () => {
                validateField(field.name, boundType);
            });
        });
    });

    // Слежение за изменениями в фильтрах
    watch(
        () => Object.entries(filters)
            .filter(([key]) => key.endsWith('Min') || key.endsWith('Max'))
            .map(([_, value]) => value),
        syncInputValues,
        { deep: true }
    );

    // Создаем экспортируемый объект с необходимыми полями и методами
    const returnObject = {
        hasValidationErrors,
        syncInputValues,
        applyRangeFilters,
        resetRangeFilters,
        countActiveRangeFilters,
        fieldConfigs: FIELD_CONFIGS,
        validateField
    };

    // Добавляем ссылки на все поля ввода
    FIELD_CONFIGS.forEach(field => {
        returnObject[`${field.name}MinInput`] = inputs[field.name].min;
        returnObject[`${field.name}MaxInput`] = inputs[field.name].max;
        returnObject[`${field.name}MinError`] = errors[field.name].min;
        returnObject[`${field.name}MaxError`] = errors[field.name].max;
    });

    return returnObject;
}