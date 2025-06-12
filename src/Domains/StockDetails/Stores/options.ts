import {defineStore} from 'pinia'
import SeizedPropertyOptionsService from '@/Domains/StockDetails/API/Options/SeizedPropertyOptionsService'

interface OptionValue {
    name: any
    value: any
}

interface OptionItem {
    option_name: string
    option_sysname: string
    option_category: string | null
    option_values: OptionValue[]
    is_required: boolean
    input_type: string
    value?: any
}

interface State {
    isEditing: boolean
    isSaving: boolean
    options: OptionItem[]
    originalOptions: OptionItem[] | null
    colorOptions: Array<{
        code: string
        uid: string
        name: string
    }>
    values: Record<string, any>
    isDirty: boolean
    isLoadingOptions: boolean
    isLoadingColors: boolean
}

export const useOptionsStore = defineStore('options', {
    state: (): State => ({
        isEditing: false,
        isSaving: false,
        options: [],
        originalOptions: null,
        colorOptions: [],
        values: {},
        isDirty: false,
        isLoadingOptions: false,
        isLoadingColors: false
    }),

    getters: {
        getOptions: (state) => state.options || [],
        getColorOptions: (state) => state.colorOptions || [],
        getValue: (state) => (sysname: string) => {
            return state.values[sysname]
        },
        getAllValues: (state) => state.values,
        hasChanges: (state) => state.isDirty,
        getIsEditing: (state) => state.isEditing,
        getIsSaving: (state) => state.isSaving
    },

    actions: {
        async loadColors() {
            if (!this.options?.length) return;

            this.isLoadingColors = true;
            try {
                const colors = await SeizedPropertyOptionsService.fetchColors('')
                this.colorOptions = colors || []
            } catch (error) {
                this.colorOptions = []
            } finally {
                this.isLoadingColors = false;
            }
        },

        async loadOptions() {
            this.isLoadingOptions = true;
            try {
                const storedTypes = localStorage.getItem('property-types')
                if (!storedTypes) return;

                const types = JSON.parse(storedTypes)
                if (!types.type && !types.subtype1 && !types.subtype2) return;

                const options = await SeizedPropertyOptionsService.fetchPropertyOptions({
                    type: types.type,
                    subtype1: types.subtype1,
                    subtype2: types.subtype2
                })

                if (options) {
                    this.setOptions(options)
                    await this.loadColors()
                }
            } catch (error) {
                // Ошибка при загрузке опций
            } finally {
                this.isLoadingOptions = false;
            }
        },

        initializeOptionsValues(initialData: any) {
            if (!initialData || !this.options.length) return;

            // Сохраняем все исходные данные для доступа из компонентов
            this.values = { ...initialData };

            // Обработка поля details, если оно существует в строковом формате
            if (initialData.details && typeof initialData.details === 'string') {
                try {
                    const detailsObj = JSON.parse(initialData.details);
                    // Объединяем данные из details с основными данными
                    Object.assign(this.values, detailsObj);
                } catch (e) {
                    // Ошибка при парсинге details
                }
            }

            // Обработка поля options, если оно существует в строковом формате
            if (initialData.options && typeof initialData.options === 'string') {
                try {
                    const optionsObj = JSON.parse(initialData.options);
                    // Объединяем данные из options с основными данными
                    Object.assign(this.values, optionsObj);
                } catch (e) {
                    // Ошибка при парсинге options
                }
            }

            // Обновляем опции значениями из дополненного values
            this.options = this.options.map(option => {
                const { option_sysname, input_type } = option;
                let value = this.values[option_sysname];

                // Обработка объектных полей
                if (value !== undefined && typeof value === 'object' && value !== null) {
                    if (option_sysname === 'color' && 'uid' in value) {
                        value = value.uid;
                    }
                    else if (['condition_status', 'keys_count', 'interior_type', 'wheels', 'glasses'].includes(option_sysname) && 'value' in value) {
                        value = value.value;
                    }
                }

                // Преобразование типов данных
                if (value !== undefined && value !== null) {
                    if (input_type === 'bool') {
                        value = value === 'true' ? true : Boolean(value);
                    }
                    else if (input_type === 'int') {
                        value = isNaN(Number(value)) ? 0 : Number(value);
                    }
                    // Для строковых полей оставляем как есть
                }
                // Значения по умолчанию для null полей
                else {
                    if (input_type === 'bool') value = false;
                    else if (input_type === 'int') value = 0;
                    else if (isArrayType(input_type) && option.option_values && option.option_values.length > 0) {
                        // Установим дефолтное значение для селектов (первый элемент из списка)
                        value = option.option_values[0].value;
                    }
                    else value = null;
                }

                return { ...option, value };
            });

            this.originalOptions = JSON.parse(JSON.stringify(this.options));
            this.isDirty = false;
        },

        setOptions(options: OptionItem[]) {
            if (!options || !Array.isArray(options)) return;

            this.options = options;
            this.values = {};

            // Инициализируем значения в едином цикле
            options.forEach(option => {
                const { option_sysname, input_type, value } = option;

                // Значения из опций или значения по умолчанию
                if (value !== undefined) {
                    // Обрабатываем специальные поля
                    if (typeof value === 'object' && value !== null) {
                        if (option_sysname === 'color' && 'uid' in value) {
                            option.value = value.uid;
                            this.values[option_sysname] = value.uid;
                        }
                        else if (['keys_count', 'condition_status', 'interior_type', 'wheels', 'glasses'].includes(option_sysname) && 'value' in value) {
                            option.value = value.value;
                            this.values[option_sysname] = value.value;
                        }
                        else {
                            this.values[option_sysname] = value;
                        }
                    }
                    else {
                        this.values[option_sysname] = value;
                    }
                }
                else {
                    // Инициализация значениями по умолчанию
                    let defaultValue = null;
                    if (input_type === 'bool') defaultValue = false;
                    else if (input_type === 'int') defaultValue = 0;

                    option.value = defaultValue;
                    this.values[option_sysname] = defaultValue;
                }
            });

            this.originalOptions = JSON.parse(JSON.stringify(options));
            this.isDirty = false;
        },

        updateOption(sysname: string, value: any) {
            if (!this.isEditing) return;

            // Обновляем значение в values
            this.values[sysname] = value;

            // Обновляем в options
            const option = this.options.find(opt => opt.option_sysname === sysname);
            if (option) {
                option.value = value;
            }

            this.isDirty = true;
        },

        startEditing() {
            this.isEditing = true;
            this.isDirty = false;

            // Создаем глубокую копию для originalOptions
            this.originalOptions = JSON.parse(JSON.stringify(this.options));
        },

        cancelEditing() {
            if (this.originalOptions) {
                // Восстанавливаем опции из оригинала
                this.options = JSON.parse(JSON.stringify(this.originalOptions));

                // Восстанавливаем значения
                this.values = {};
                this.options.forEach(option => {
                    this.values[option.option_sysname] = option.value;
                });
            }

            this.isEditing = false;
            this.isDirty = false;
            this.originalOptions = null;
        }
    }
})

// Вспомогательная функция для проверки типа массива
function isArrayType(inputType: string): boolean {
    return inputType.startsWith('array');
}