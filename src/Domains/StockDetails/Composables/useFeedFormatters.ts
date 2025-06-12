import { format, isToday, isYesterday } from 'date-fns';
import { ru } from 'date-fns/locale';

export function useFeedFormatters() {
    function formatDateHeader(dateStr) {
        const date = new Date(dateStr);

        if (isToday(date)) {
            return 'Сегодня';
        } else if (isYesterday(date)) {
            return 'Вчера';
        } else {
            return format(date, 'd MMMM yyyy', { locale: ru });
        }
    }

    function formatTime(dateStr) {
        return format(new Date(dateStr), 'HH:mm');
    }

    function formatDateTime(dateStr) {
        return format(new Date(dateStr), 'd MMMM yyyy, HH:mm', { locale: ru });
    }

    function formatPayloadKey(key) {
        return key
            .replace(/_/g, ' ')
            .replace(/([A-Z])/g, ' $1')
            .replace(/^./, str => str.toUpperCase());
    }

    function formatPayloadValue(value) {
        if (value === null || value === undefined) {
            return '-';
        }

        if (typeof value === 'boolean') {
            return value ? 'Да' : 'Нет';
        }

        if (typeof value === 'string' && (value.includes('T') || value.includes('Z'))) {
            try {
                const date = new Date(value);
                if (!isNaN(date.getTime())) {
                    return format(date, 'd MMMM yyyy, HH:mm', { locale: ru });
                }
            } catch (e) {
                // Silent error
            }
        }

        return String(value);
    }

    return {
        formatDateHeader,
        formatTime,
        formatDateTime,
        formatPayloadKey,
        formatPayloadValue
    };
}