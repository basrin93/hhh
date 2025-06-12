export function useFormValidation() {
    /**
     * Валидация числового поля с ограничением по максимальному значению
     * @param maxValue Максимально допустимое значение
     * @returns Массив правил валидации для компонентов Vuetify
     */
    const createNumberValidationRules = (maxValue: number = 999999999) => {
        return [
            (value: string | number | null | undefined) => {
                if (!value && value !== 0) return 'Поле обязательно для заполнения';

                if (typeof value === 'string') {
                    let numericValue;

                    if (value.includes(',') || value.includes('.')) {
                        const normalizedValue = value.replace(/,/g, '.');
                        const parts = normalizedValue.split('.');

                        const integerPart = parts[0].replace(/\D/g, '');
                        const fractionalPart = parts.length > 1 ? parts[1].replace(/\D/g, '') : '';

                        const floatValue = parseFloat(`${integerPart}.${fractionalPart}`);
                        numericValue = Math.round(floatValue);
                    } else {
                        numericValue = parseInt(value.replace(/\D/g, ''), 10);
                    }

                    if (isNaN(numericValue)) return 'Введите корректное число';
                    if (numericValue > maxValue) return `Максимальное значение: ${maxValue.toLocaleString('ru-RU')}`;
                }
                else if (typeof value === 'number') {
                    if (value > maxValue) return `Максимальное значение: ${maxValue.toLocaleString('ru-RU')}`;
                }

                return true;
            }
        ];
    };

    /**
     * Валидация текстового поля с ограничением по длине
     * @param maxLength Максимальная длина текста
     * @param required Является ли поле обязательным
     * @returns Массив правил валидации для компонентов Vuetify
     */
    const createTextValidationRules = (maxLength: number = 128, required: boolean = false) => {
        const rules = [];

        if (required) {
            rules.push((value: string | null | undefined) => {
                return (value && value.trim().length > 0) || 'Поле обязательно для заполнения';
            });
        }

        rules.push((value: string | null | undefined) => {
            if (!value) return true;
            return value.length <= maxLength || `Максимальная длина: ${maxLength} символов`;
        });

        return rules;
    };

    /**
     * Генерирует текст подсказки для максимальной длины текста
     * @param maxLength Максимальная длина текста
     * @returns Текст подсказки
     */
    const getTextLengthHint = (maxLength: number) => {
        return `Максимум ${maxLength} символов`;
    };

    /**
     * Генерирует текст подсказки для максимального значения числа
     * @param maxValue Максимальное значение
     * @returns Текст подсказки
     */
    const getNumberValueHint = (maxValue: number) => {
        return `Максимальное значение: ${maxValue.toLocaleString('ru-RU')}`;
    };

    return {
        createNumberValidationRules,
        createTextValidationRules,
        getTextLengthHint,
        getNumberValueHint
    };
}