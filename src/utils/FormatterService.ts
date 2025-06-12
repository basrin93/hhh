// FormatterService.ts

/**
 * Класс для форматирования различных типов данных в приложении
 */
export class FormatterService {
    /**
     * Форматирует дату в российском формате с возможностью отображения времени
     * @param dateString - строка с датой или объект Date
     * @param withTime - включать ли время в результат
     * @param defaultValue - значение для пустой даты
     * @returns форматированная строка с датой
     */
    formatDate(
        dateString: string | Date | null | undefined,
        withTime: boolean = true,
        defaultValue: string = '—'
    ): string {
        if (!dateString) return defaultValue;

        try {
            const date = dateString instanceof Date ? dateString : new Date(dateString);

            if (isNaN(date.getTime())) return defaultValue;

            const formatOptions: Intl.DateTimeFormatOptions = {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            };

            if (withTime) {
                formatOptions.hour = '2-digit';
                formatOptions.minute = '2-digit';
            }

            return new Intl.DateTimeFormat('ru-RU', formatOptions).format(date);
        } catch {
            return defaultValue;
        }
    }

    /**
     * Форматирует число как валюту в рублях
     * @param value - числовое значение
     * @param defaultValue - значение по умолчанию для null/undefined
     * @returns отформатированная строка с валютой
     */
    formatCurrency(
        value: number | string | null | undefined,
        defaultValue: string = '—'
    ): string {
        if ((value === null || value === undefined) && value !== 0) return defaultValue;

        try {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;

            if (isNaN(numValue) && numValue !== 0) return defaultValue;

            return new Intl.NumberFormat('ru-RU', {
                style: 'currency',
                currency: 'RUB',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(numValue);
        } catch {
            return defaultValue;
        }
    }

    /**
     * Форматирует число с разделителями разрядов
     * @param value - числовое значение
     * @param decimals - количество десятичных знаков
     * @param defaultValue - значение по умолчанию для null/undefined
     * @returns отформатированная строка с числом
     */
    formatNumber(
        value: number | string | null | undefined,
        decimals: number = 0,
        defaultValue: string = '—'
    ): string {
        if ((value === null || value === undefined) && value !== 0) return defaultValue;

        try {
            const numValue = typeof value === 'string' ? parseFloat(value) : value;

            if (isNaN(numValue) && numValue !== 0) return defaultValue;

            return new Intl.NumberFormat('ru-RU', {
                style: 'decimal',
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            }).format(numValue);
        } catch {
            return defaultValue;
        }
    }

    /**
     * Форматирует строку, возвращая дефолтное значение для пустых строк
     * @param value - строковое значение
     * @param defaultValue - значение по умолчанию
     * @returns отформатированная строка или дефолтное значение
     */
    formatText(
        value: string | null | undefined,
        defaultValue: string = '—'
    ): string {
        if (!value || value.trim() === '') return defaultValue;
        return value;
    }
}

// Создаем и экспортируем инстанс сервиса для использования во всем приложении
export const formatter = new FormatterService();