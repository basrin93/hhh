import {onUnmounted, ref} from 'vue';
import debounce from 'lodash/debounce';

export function useSearch() {
    const search = ref('');
    const isSearchLoading = ref(false);

    const debouncedSearchFn = debounce(async (callback: (value: string) => Promise<void>) => {
        try {
            isSearchLoading.value = true;
            await callback(search.value);
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            isSearchLoading.value = false;
        }
    }, 500, { leading: false, trailing: true, maxWait: 1500 });

    async function onSearchInput(value: string, callback: (value: string) => Promise<void>): Promise<void> {
        search.value = value;
        await debouncedSearchFn(callback);
    }

    async function resetSearch(callback: () => Promise<void>): Promise<void> {
        try {
            isSearchLoading.value = true;
            debouncedSearchFn.cancel();
            search.value = '';
            await callback();
        } catch (error) {
            console.error('Reset search error:', error);
        } finally {
            isSearchLoading.value = false;
        }
    }

    function cancelSearch(): void {
        debouncedSearchFn.cancel();
    }

    onUnmounted(() => {
        debouncedSearchFn.cancel();
    });

    return {
        search,
        isSearchLoading,
        onSearchInput,
        resetSearch,
        cancelSearch
    };
}