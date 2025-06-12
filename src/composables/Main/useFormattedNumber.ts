import { ref, computed } from 'vue';

/**
 * Композабл для управления форматированием чисел с разделителями разрядов
 * @param initialValue Начальное значение (опционально)
 * @returns Объект с методами и реактивными свойствами для работы с форматированными числами
 */
export function useFormattedNumber(initialValue: string = '') {
    const rawValue = ref(getRawValue(initialValue));

    const formattedValue = ref(formatNumberWithSeparators(rawValue.value));


    /**
     * Получение сырого числового значения с корректной обработкой дробных чисел
     */
    function getRawValue(value: string): string {
        if (!value) return '';

        let processedValue = value.replace(/[^\d.,]/g, '');

        if (processedValue.includes(',') || processedValue.includes('.')) {

            const lastDotIndex = processedValue.lastIndexOf('.');
            const lastCommaIndex = processedValue.lastIndexOf(',');

            let decimalValue: number;

            if (lastDotIndex > -1 && lastCommaIndex > -1) {
                if (lastDotIndex > lastCommaIndex) {
                    processedValue = processedValue.replace(/,/g, '');
                } else {
                    processedValue = processedValue.replace(/\./g, '').replace(',', '.');
                }
            } else if (lastCommaIndex > -1) {
                processedValue = processedValue.replace(/,/g, (match, offset) =>
                    offset === lastCommaIndex ? '.' : '');
            }

            decimalValue = parseFloat(processedValue);
            if (!isNaN(decimalValue)) {
                return Math.round(decimalValue).toString();
            }
        }
        return value.replace(/\D/g, '');
    }

    /**
     * Форматирование числового значения с разделителями разрядов
     */
    function formatNumberWithSeparators(value: string): string {
        if (!value) return '';
        const numericValue = value.replace(/\D/g, '');
        return numericValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    }

    /**
     * Обработчик ввода: форматирует значение при изменении
     */
    function updateValue(value: string): void {
        rawValue.value = getRawValue(value);
        formattedValue.value = formatNumberWithSeparators(rawValue.value);
    }

    /**
     * Обработчик вставки текста с поддержкой форматированных чисел и дробной части
     */
    function handlePaste(event: ClipboardEvent): void {
        event.preventDefault();
        const pastedText = (event.clipboardData || window.clipboardData).getData('text');
        updateValue(pastedText);
    }

    /**
     * Обработчик нажатия клавиш: допускает только цифры
     */
    function filterNumericInput(event: KeyboardEvent): void {
        const char = String.fromCharCode(event.keyCode || event.charCode);
        if (!/^[0-9]$/.test(char)) {
            event.preventDefault();
        }
    }

    /**
     * Установка курсора в конец текстового поля
     */
    function setCursorToEnd(event: FocusEvent): void {
        setTimeout(() => {
            if (event.target instanceof HTMLInputElement) {
                event.target.selectionStart = event.target.value.length;
                event.target.selectionEnd = event.target.value.length;
            }
        }, 0);
    }

    /**
     * Сброс значений
     */
    function reset(): void {
        rawValue.value = '';
        formattedValue.value = '';
    }

    const numericValue = computed(() => rawValue.value ? parseInt(rawValue.value, 10) : 0);

    return {
        rawValue,
        formattedValue,
        numericValue,
        updateValue,
        handlePaste,
        filterNumericInput,
        setCursorToEnd,
        reset
    };
}