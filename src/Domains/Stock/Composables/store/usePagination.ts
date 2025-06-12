import {computed, ref} from 'vue';
import {localStorageUtils} from '@/utils/localStorage';

export function usePagination() {
    const page = ref(1);
    const itemsPerPage = ref(10);
    const count = ref(0);

    const footerProps = ref({
        itemsPerPageOptions: [10, 25, 50, 75, 100],
        itemsPerPageText: 'Показать по',
    });

    const maxPage = computed(() => Math.ceil(count.value / itemsPerPage.value) || 1);

    function savePaginationSettings(): void {
        localStorageUtils.saveData('table-pagination', {
            itemsPerPage: itemsPerPage.value,
            page: page.value
        });
    }

    function loadPaginationSettings(): void {
        const savedPagination = localStorageUtils.getData('table-pagination');
        if (savedPagination) {
            itemsPerPage.value = savedPagination.itemsPerPage || 10;
            page.value = savedPagination.page || 1;
        }
    }

    function resetToFirstPage(): void {
        page.value = 1;
        savePaginationSettings();
    }

    function setPageSafe(newPage: number): void {
        const safePage = Math.max(1, Math.min(newPage, maxPage.value));
        page.value = safePage;
        savePaginationSettings();
    }

    function setItemsPerPage(newItemsPerPage: number): void {
        itemsPerPage.value = newItemsPerPage;
        page.value = 1;
        savePaginationSettings();
    }

    function updateCount(newCount: number): void {
        count.value = newCount;

        // Если текущая страница больше максимальной, переходим на максимальную
        const newMaxPage = Math.ceil(newCount / itemsPerPage.value) || 1;
        if (page.value > newMaxPage && newMaxPage > 0) {
            page.value = newMaxPage;
            savePaginationSettings();
        }
    }

    return {
        page,
        itemsPerPage,
        count,
        maxPage,
        footerProps,
        savePaginationSettings,
        loadPaginationSettings,
        resetToFirstPage,
        setPageSafe,
        setItemsPerPage,
        updateCount
    };
}