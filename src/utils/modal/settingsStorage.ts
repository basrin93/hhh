// utils/settingsStorage.ts
import { Header } from '@/types';

const COLUMNS_SETTINGS_KEY = 'table-columns-settings';

export interface ColumnsSettings {
    visibilityState: Record<string, boolean>;
    timestamp: number;
}

export const localStorageUtils = {
    saveColumnsSettings(headers: Header[]): void {
        try {
            const settings: ColumnsSettings = {
                visibilityState: headers.reduce((acc, header) => ({
                    ...acc,
                    [header.text]: header.visible
                }), {}),
                timestamp: Date.now()
            };

            localStorage.setItem(COLUMNS_SETTINGS_KEY, JSON.stringify(settings));
        } catch (error) {
            console.error('Ошибка сохранения настроек колонок:', error);
        }
    },

    getColumnsSettings(): ColumnsSettings | null {
        try {
            const settings = localStorage.getItem(COLUMNS_SETTINGS_KEY);
            return settings ? JSON.parse(settings) : null;
        } catch (error) {
            console.error('Ошибка получения настроек колонок:', error);
            return null;
        }
    },

    applyStoredSettings(headers: Header[]): Header[] {
        const settings = this.getColumnsSettings();

        if (!settings) return headers;

        return headers.map(header => ({
            ...header,
            visible: header.required ? true : (settings.visibilityState[header.text] ?? header.visible)
        }));
    }
};