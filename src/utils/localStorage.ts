// utils/localStorage.ts
export interface StorageData {
    data: any;
    timestamp: number;
}

export const localStorageUtils = {
    saveData(key: string, data: any): void {
        try {
            const storageData: StorageData = {
                data,
                timestamp: Date.now()
            };

            localStorage.setItem(key, JSON.stringify(storageData));
        } catch (error) {
            console.error(`Ошибка сохранения данных для ключа ${key}:`, error);
        }
    },

    getData(key: string): any | null {
        try {
            const storageData = localStorage.getItem(key);
            if (!storageData) return null;

            const parsed = JSON.parse(storageData) as StorageData;
            return parsed.data;
        } catch (error) {
            console.error(`Ошибка получения данных для ключа ${key}:`, error);
            return null;
        }
    },

    clearData(key: string): void {
        try {
            localStorage.removeItem(key);
        } catch (error) {
            console.error(`Ошибка очистки данных для ключа ${key}:`, error);
        }
    }
};