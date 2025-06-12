import {defineStore} from 'pinia';
import {computed, nextTick, ref} from 'vue';
import {useHeaders} from '@/Domains/Stock/Composables/useHeaders';
import {useFormatters} from '@/Domains/Stock/Composables/useFormatters';
import {useFilters} from '../Composables/store/useFilters';
import {usePriceImport} from '../Composables/store/usePriceImport';
import {usePagination} from '../Composables/store/usePagination';
import {useSorting} from '../Composables/store/useSorting';
import {useSearch} from '../Composables/store/useSearch';
import {useTabManagement} from '../Composables/store/useTabManagement';
import {currentStatusGroup} from '@/stores/Shared/statusGroup';
import {useVehicleFiltersStore} from './vehicleFiltersStore';
import SearchService from '@/services/Stock/SearchService';
import ExcelExportService from "@/Domains/Stock/API/ExcelExportService";
import SeizedPropertiesService from "@/Domains/Stock/API/SeizedPropertiesService";
import SeizedPropertiesAggregateService from "@/Domains/Stock/API/SeizedPropertiesAggregateService";
import {localStorageUtils} from '@/utils/localStorage';
import type {FilterRequest, Item} from '@/types/filters';

export const useStockStore = defineStore('stock', () => {
    const { headers, visibleHeaders, updateHeadersVisibility } = useHeaders();
    const { formatItems } = useFormatters();
    const {
        filters,
        statusFilter,
        activeFiltersCount,
        loadFiltersFromStorage,
        saveFiltersToStorage,
        clearFiltersFromStorage,
        hasActiveFiltersInGroup,
        createServerFilters
    } = useFilters();
    const {
        isImportLoading,
        showImportDialog,
        importResult,
        handlePriceImport,
        handleImportDialogClose: baseHandleImportDialogClose
    } = usePriceImport();
    const {
        page,
        itemsPerPage,
        count,
        maxPage,
        footerProps,
        loadPaginationSettings,
        resetToFirstPage,
        setPageSafe,
        setItemsPerPage,
        updateCount
    } = usePagination();
    const {
        sortBy,
        sortDesc,
        prepareSortFields,
        loadSortSettings,
        loadTabSortSettings,
        updateSort
    } = useSorting();
    const {
        search,
        isSearchLoading,
        onSearchInput,
        resetSearch
    } = useSearch();
    const {
        activeTab,
        tabs,
        loadActiveTab,
        setActiveTabByName,
        setActiveTabByGroup,
        fetchTabs
    } = useTabManagement();
    const vehicleFiltersStore = useVehicleFiltersStore();

    const settingsDialog = ref(false);
    const filterDialog = ref(false);
    const isLoading = ref(false);
    const isInitialized = ref(false);
    const isInitializing = ref(false);
    const items = ref<Item[]>([]);
    const filteredItems = ref<Item[]>([]);

    async function initialize() {
        if (isInitialized.value || isInitializing.value) return;

        try {
            isInitializing.value = true;

            const savedHeaders = localStorageUtils.getData('table-headers');
            if (savedHeaders) {
                updateHeadersVisibility(savedHeaders);
            }

            loadPaginationSettings();
            loadSortSettings();
            loadActiveTab();
            await fetchTabs();
            setActiveTabByGroup();
            loadFiltersFromStorage(currentStatusGroup.value);

            const serverFilters = {
                ...createServerFilters(filters.value, search.value),
                status_group: currentStatusGroup.value
            };

            await fetchData(serverFilters);
            isInitialized.value = true;
        } catch (error) {
            clearStoreData();
        } finally {
            isInitializing.value = false;
        }
    }

    const formattedItems = computed(() => formatItems(filteredItems.value));

    async function handleTabChange(tabName: string) {
        try {
            isLoading.value = true;
            setActiveTabByName(tabName);
            clearStoreData();
            loadFiltersFromStorage(currentStatusGroup.value);
            loadTabSortSettings(currentStatusGroup.value);

            const serverFilters = {
                status_group: currentStatusGroup.value,
                ...createServerFilters(filters.value, search.value)
            };

            const { columns, directions } = prepareSortFields(sortBy.value, sortDesc.value);

            const response = await SeizedPropertiesService.fetchSeizedProperties(
                serverFilters,
                1,
                itemsPerPage.value,
                currentStatusGroup.value === 'Archive',
                columns,
                directions
            );

            updateStoreData(response);
            await nextTick();
        } catch (error) {
            clearStoreData();
        } finally {
            isLoading.value = false;
        }
    }

    async function handlePageChange(newPage: number) {
        if (!isInitialized.value) return;

        try {
            isLoading.value = true;
            setPageSafe(newPage);

            const serverFilters = createServerFilters(filters.value, search.value);
            const { columns, directions } = prepareSortFields(sortBy.value, sortDesc.value);

            const response = await SeizedPropertiesService.fetchSeizedProperties(
                serverFilters,
                page.value,
                itemsPerPage.value,
                currentStatusGroup.value === 'Archive',
                columns,
                directions
            );
            updateStoreData(response);
        } catch (error) {
            clearStoreData();
        } finally {
            isLoading.value = false;
        }
    }

    async function handleSortChange({ column, desc }: { column: string, desc: boolean }) {
        try {
            isLoading.value = true;
            updateSort(column, desc);
            resetToFirstPage();

            const serverFilters = createServerFilters(filters.value, search.value);
            const { columns, directions } = prepareSortFields(sortBy.value, sortDesc.value);

            const response = await SeizedPropertiesService.fetchSeizedProperties(
                serverFilters,
                1,
                itemsPerPage.value,
                currentStatusGroup.value === 'Archive',
                columns,
                directions
            );

            updateStoreData(response);
        } catch (error) {
            clearStoreData();
        } finally {
            isLoading.value = false;
        }
    }

    function updateStoreData(response: any) {
        if (response && typeof response === 'object') {
            const newItems = Array.isArray(response.items) ? response.items : [];
            const newCount = typeof response.count === 'number' ? response.count : 0;

            items.value = newItems;
            filteredItems.value = [...newItems];
            updateCount(newCount);
        }
    }

    async function handleItemsPerPageChange(newItemsPerPage: number) {
        if (!isInitialized.value) return;

        try {
            isLoading.value = true;
            setItemsPerPage(newItemsPerPage);

            const serverFilters = createServerFilters(filters.value, search.value);
            const { columns, directions } = prepareSortFields(sortBy.value, sortDesc.value);

            const response = await SeizedPropertiesService.fetchSeizedProperties(
                serverFilters,
                1,
                newItemsPerPage,
                currentStatusGroup.value === 'Archive',
                columns,
                directions
            );
            updateStoreData(response);
        } catch (error) {
            clearStoreData();
        } finally {
            isLoading.value = false;
        }
    }

    function clearStoreData() {
        items.value = [];
        filteredItems.value = [];
        updateCount(0);
    }

    async function fetchData(serverFilters?: FilterRequest) {
        try {
            isLoading.value = true;

            const filtersToUse = serverFilters || {
                status_group: currentStatusGroup.value
            };

            const { columns, directions } = prepareSortFields(sortBy.value, sortDesc.value);

            const response = await SeizedPropertiesService.fetchSeizedProperties(
                filtersToUse,
                page.value,
                itemsPerPage.value,
                currentStatusGroup.value === 'Archive',
                columns,
                directions
            );

            if (response.count !== items.value.length) {
                SearchService.invalidateCache();
            }

            updateStoreData(response);
        } catch (error) {
            clearStoreData();
        } finally {
            isLoading.value = false;
        }
    }

    async function applyFilters(newFilters: any) {
        if (!isInitialized.value) return;

        try {
            isLoading.value = true;
            filters.value = newFilters;
            saveFiltersToStorage(currentStatusGroup.value);
            resetToFirstPage();

            const serverFilters = createServerFilters(newFilters, search.value);
            await fetchData(serverFilters);
        } catch (error) {
            clearStoreData();
        } finally {
            isLoading.value = false;
            filterDialog.value = false;
        }
    }

    async function resetFilters() {
        if (!isInitialized.value) return;

        try {
            isLoading.value = true;
            clearFiltersFromStorage(currentStatusGroup.value);
            resetToFirstPage();

            const emptyFilters = createServerFilters(filters.value, search.value);
            await fetchData(emptyFilters);
            await vehicleFiltersStore.$reset();
        } catch (error) {
            clearStoreData();
        } finally {
            isLoading.value = false;
            filterDialog.value = false;
        }
    }

    async function handleSearchInput(value: string) {
        await onSearchInput(value, async (searchValue: string) => {
            const serverFilters = createServerFilters(filters.value, searchValue);
            const { columns, directions } = prepareSortFields(sortBy.value, sortDesc.value);

            const [searchResponse, aggregateResponse] = await Promise.all([
                SeizedPropertiesService.fetchSeizedProperties(
                    serverFilters,
                    1,
                    itemsPerPage.value,
                    currentStatusGroup.value === 'Archive',
                    columns,
                    directions
                ),
                SeizedPropertiesAggregateService.fetchAggregate(serverFilters)
            ]);

            resetToFirstPage();
            updateStoreData(searchResponse);

            if (aggregateResponse.tabs?.length > 0) {
                tabs.value = aggregateResponse.tabs;
            }
        });
    }

    async function handleResetSearch() {
        await resetSearch(async () => {
            const serverFilters = createServerFilters(filters.value, '');
            const { columns, directions } = prepareSortFields(sortBy.value, sortDesc.value);

            const response = await SeizedPropertiesService.fetchSeizedProperties(
                serverFilters,
                page.value,
                itemsPerPage.value,
                currentStatusGroup.value === 'Archive',
                columns,
                directions
            );

            updateStoreData(response);
        });
    }

    function handleImportDialogClose() {
        baseHandleImportDialogClose(() => fetchData());
    }

    async function refreshWithCurrentState() {
        if (!isInitialized.value) return;

        const serverFilters = createServerFilters(filters.value, search.value);
        await fetchData(serverFilters);
    }

    return {
        headers,
        visibleHeaders,
        search,
        activeTab,
        tabs,
        count,
        settingsDialog,
        filterDialog,
        statusFilter,
        filters,
        items,
        filteredItems,
        footerProps,
        formattedItems,
        isSearchLoading,
        activeFiltersCount,
        page,
        maxPage,
        itemsPerPage,
        isLoading,
        currentStatusGroup,
        sortBy,
        sortDesc,
        isImportLoading,
        showImportDialog,
        importResult,
        isInitialized,

        initialize,
        fetchData,
        refreshWithCurrentState,
        handleItemsPerPageChange,
        fetchTabs,
        handlePageChange,
        handleTabChange,
        hasActiveFiltersInGroup,
        onSearchInput: handleSearchInput,
        resetSearch: handleResetSearch,
        openSettings: () => settingsDialog.value = true,
        applySettings: updateHeadersVisibility,
        handleExcelDownload: async () => {
            try {
                isLoading.value = true;
                const serverFilters = createServerFilters(filters.value, search.value);
                const { columns, directions } = prepareSortFields(sortBy.value, sortDesc.value);

                const response = await ExcelExportService.exportToExcel(
                    serverFilters,
                    page.value,
                    itemsPerPage.value,
                    currentStatusGroup.value,
                    columns,
                    directions
                );

                if (response) {
                    ExcelExportService.downloadFile(response);
                }
            } catch (error) {
            } finally {
                isLoading.value = false;
            }
        },
        openFilters: async () => {
            filterDialog.value = true;
            await vehicleFiltersStore.loadStatuses(currentStatusGroup.value);
        },

        handlePriceImport,
        handleImportDialogClose,
        applyFilters,
        resetFilters,
        handleSortChange
    };
});