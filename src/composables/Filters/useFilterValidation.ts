import { computed } from 'vue';

export function useFilterValidation() {
    const currentYear = new Date().getFullYear();
    const currentDate = new Date();

    const formattedCurrentDate = computed(() => {
        const year = currentDate.getFullYear();
        const month = String(currentDate.getMonth() + 1).padStart(2, '0');
        const day = String(currentDate.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    });

    const filterNumericInput = (e: KeyboardEvent) => {
        // Разрешаем только цифры
        const char = String.fromCharCode(e.keyCode || e.charCode);
        if (!/^[0-9]$/.test(char)) {
            e.preventDefault();
        }
    };

    return {
        filterNumericInput,
        formattedCurrentDate,
        currentYear
    };
}