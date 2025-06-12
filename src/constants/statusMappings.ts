/**
 * Сопоставление названий статусов с их кодами
 */
export const statusNameToCode = {
    'Расторгнут, не изъят': 'TerminatedNotSeized',
    'Расторгнут, изъят': 'TerminatedSeized',
    'Расторгнут, невозможно изъять': 'TerminatedImpossibleSeized',
    'Расторгнут, реализован': 'TerminatedSelling',
    'Возвращен/Выкуплен ЛП': 'Returned',
    'Передан в лизинг': 'Leased',
    'Реализован в деньги': 'Sold',
    'Передан в кор. парк': 'TransferredToCorpPark',
    'Оценен': 'Valuated',
    'Подготовка к продаже': 'PreparationForSale',
    'В свободной продаже': 'FreeSale',
    'Резерв': 'Reserved'
};

/**
 * Получение кода статуса по его названию
 * @param statusName Название статуса
 * @returns Код статуса или null, если статус не найден
 */
export function getStatusCodeByName(statusName: string): string | null {
    return statusNameToCode[statusName] || null;
}

/**
 * Сопоставление кодов статусов с их названиями (обратное отображение)
 */
export const statusCodeToName = Object.entries(statusNameToCode).reduce(
    (acc, [name, code]) => {
        acc[code] = name;
        return acc;
    },
    {} as Record<string, string>
);

/**
 * Получение названия статуса по его коду
 * @param statusCode Код статуса
 * @returns Название статуса или null, если код не найден
 */
export function getStatusNameByCode(statusCode: string): string | null {
    return statusCodeToName[statusCode] || null;
}