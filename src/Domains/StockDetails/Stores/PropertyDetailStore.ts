// stores/Components/PropertyDetailStore.ts
import {defineStore} from 'pinia';
import {computed, ref} from 'vue';
import SeizedPropertyDetailService from '@/Domains/StockDetails/API/Main/SeizedPropertyDetailService';
import type {PropertyDetail} from '@/types';

export const usePropertyDetailStore = defineStore('propertyDetail', () => {
    // Текущие данные
    const currentPropertyDetail = ref<PropertyDetail | null>(null);
    // Текущий UID
    const currentUid = ref<string | null>(null);
    // Статус загрузки
    const isLoading = ref<Record<string, boolean>>({});
    // Ошибки
    const errors = ref<Record<string, Error | null>>({});

    /**
     * Получение данных о имуществе (БЕЗ КЕШИРОВАНИЯ)
     */
    async function fetchPropertyDetail(uid: string): Promise<PropertyDetail | null> {
        if (!uid) return null;

        try {
            isLoading.value[uid] = true;
            errors.value[uid] = null;
            currentUid.value = uid;

            const data = await SeizedPropertyDetailService.fetchPropertyDetail(uid);
            currentPropertyDetail.value = data;
            return data;
        } catch (error) {
            console.error(`Ошибка при загрузке данных о имуществе (${uid}):`, error);
            errors.value[uid] = error instanceof Error ? error : new Error('Неизвестная ошибка');
            currentPropertyDetail.value = null;
            return null;
        } finally {
            isLoading.value[uid] = false;
        }
    }

    /**
     * Получает данные - ВСЕГДА ЗАГРУЖАЕТ ЗАНОВО
     */
    const getPropertyDetail = computed(() => (uid: string) => {
        if (!uid) return null;

        // Если это новый UID или данных нет, загружаем
        if (currentUid.value !== uid) {
            fetchPropertyDetail(uid);
        }

        return currentPropertyDetail.value;
    });

    /**
     * Проверка статуса загрузки
     */
    const getLoadingStatus = computed(() => (uid: string) => isLoading.value[uid] || false);

    /**
     * Получение ошибки
     */
    const getError = computed(() => (uid: string) => errors.value[uid] || null);

    return {
        fetchPropertyDetail,
        getPropertyDetail,
        getLoadingStatus,
        getError
    };
});