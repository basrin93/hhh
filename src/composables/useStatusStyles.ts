import { computed, Ref, isRef, ref, watch } from 'vue';

/**
 * Композабл для стилизации статусов
 * @param statusValue - статус (строка или ref)
 */
export function useStatusStyles(statusValue: string | Ref<string>) {
    // Создаем ref для отслеживания изменений, если передана обычная строка
    const statusRef = isRef(statusValue) ? statusValue : ref(statusValue);

    // Вычисляемое свойство для определения класса на основе текущего значения статуса
    const statusClass = computed(() => {
        const status = statusRef.value;
        if (!status) return 'status-default';

        switch (status.toLowerCase()) {
            case "расторгнут, не изъят":
                return "status-not-seized";
            case "расторгнут, изъят":
                return "status-seized";
            case "расторгнут, невозможно изъять":
                return "status-impossible";
            case "расторгнут, реализован":
                return "status-sold";
            case "оценен":
                return "status-evaluated";
            case "подготовка к продаже":
                return "status-preparing";
            case "в свободной продаже":
                return "status-on-sale";
            case "резерв":
                return "status-reserved";
            default:
                return "status-default";
        }
    });

    // Определяем цвета и стили для статуса
    const statusColors = computed(() => {
        const className = statusClass.value;

        switch (className) {
            case 'status-not-seized':
                return {
                    bgColor: 'rgba(232, 208, 185, 0.2)',
                    textColor: 'var(--status-not-seized-color, #8B6B4F)',
                    borderColor: 'var(--alfa_friendly_brow, #E8D0B9)'
                };
            case 'status-seized':
                return {
                    bgColor: 'rgba(120, 121, 207, 0.2)',
                    textColor: 'var(--status-seized-color, #44458E)',
                    borderColor: 'var(--alfa_friendly_indigo, #7879CF)'
                };
            case 'status-impossible':
                return {
                    bgColor: 'rgba(255, 92, 92, 0.15)',
                    textColor: 'var(--status-impossible-color, #C11E1E)',
                    borderColor: 'var(--alfa_friendly_red, #FF5C5C)'
                };
            case 'status-sold':
                return {
                    bgColor: 'rgba(76, 175, 80, 0.15)',
                    textColor: 'var(--status-sold-color, #2E7D32)',
                    borderColor: 'var(--alfa_friendly_succes, #4CAF50)'
                };
            case 'status-evaluated':
                return {
                    bgColor: 'rgba(67, 208, 196, 0.15)',
                    textColor: 'var(--status-evaluated-color, #1B8A80)',
                    borderColor: 'var(--alfa_friendly_turquoise, #43D0C4)'
                };
            case 'status-preparing':
                return {
                    bgColor: 'rgba(126, 179, 255, 0.15)',
                    textColor: 'var(--status-preparing-color, #2C64CA)',
                    borderColor: 'var(--alfa_friendly_blue, #7EB3FF)'
                };
            case 'status-on-sale':
                return {
                    bgColor: 'rgba(25, 118, 210, 0.15)',
                    textColor: 'var(--status-on-sale-color, #0D4787)',
                    borderColor: 'var(--alfa_primary-blue, #1976d2)'
                };
            case 'status-reserved':
                return {
                    bgColor: 'rgba(254, 233, 132, 0.25)',
                    textColor: 'var(--status-reserved-color, #9B8602)',
                    borderColor: 'var(--alfa_friendly_yellow, #FEE984)'
                };
            default:
                return {
                    bgColor: 'rgba(173, 178, 189, 0.15)',
                    textColor: 'var(--status-default-color, #232B34)',
                    borderColor: 'var(--alfa_friendly_background_medium, #ADB2BD)'
                };
        }
    });

    // Инлайн стили для компонентов, не использующих классы
    const badgeStyle = computed(() => {
        const colors = statusColors.value;
        return {
            backgroundColor: colors.bgColor,
            color: colors.textColor,
            borderColor: colors.borderColor,
            borderWidth: '1px',
            borderStyle: 'solid',
            borderRadius: '16px',
            padding: '6px 12px',
            display: 'inline-flex',
            alignItems: 'center',
            fontSize: '13px',
            fontWeight: 500
        };
    });

    // Если statusValue не Ref, то устанавливаем наблюдатель для изменения значения
    if (!isRef(statusValue)) {
        watch(() => statusValue, (newValue) => {
            statusRef.value = newValue;
        });
    }

    return {
        statusClass,
        statusColors,
        badgeStyle,
        currentStatus: statusRef
    };
}