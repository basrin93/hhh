import {computed, ref} from 'vue';
import {Header} from '@/types';
import {headers as defaultHeaders} from '@/Domains/Stock/Constants/headers';

export function useHeaders() {
    const headers = ref<Header[]>([...defaultHeaders]);

    const visibleHeaders = computed(() => {
        const visible = headers.value.filter(header => header.visible);
        console.log('👁️ Видимые заголовки:', visible);
        return visible;
    });

    const updateHeaderVisibility = (headerValue: string, isVisible: boolean) => {
        const header = headers.value.find(h => h.value === headerValue);
        if (header) {
            header.visible = isVisible;
        }
    };

    const updateHeadersVisibility = (updatedHeaders: Header[]) => {
        updatedHeaders.forEach(updatedHeader => {
            updateHeaderVisibility(updatedHeader.value, updatedHeader.visible);
        });
    };

    const resetHeadersVisibility = () => {
        headers.value = [...defaultHeaders];
    };

    return {
        headers,
        visibleHeaders,
        updateHeaderVisibility,
        updateHeadersVisibility,
        resetHeadersVisibility
    };
}