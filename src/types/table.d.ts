/**
 * Описание заголовка таблицы
 */
export interface Header {
    text: string;
    value: string;
    sortable: boolean;
    visible: boolean;
    align?: string;
    required?: boolean;
}

/**
 * Описание элемента данных таблицы
 */
export interface Item {
    [key: string]: any;
}