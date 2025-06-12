import {ref} from 'vue';
import {localStorageUtils} from '@/utils/localStorage';
import {mapSortFieldName} from '@/utils/shared/sortMapping';
import {currentStatusGroup} from '@/stores/Shared/statusGroup';

export function useSorting() {
    const sortBy = ref<string[]>([]);
    const sortDesc = ref<boolean[]>([]);

    function prepareSortFields(sortColumns: string[], sortDirections: boolean[]) {
        const validSortColumns = sortColumns.map(col => {
            const mappedName = mapSortFieldName(col);
            if (mappedName && !mappedName.includes('.')) {
                return mappedName;
            } else {
                return null;
            }
        }).filter(Boolean);

        const validSortDirections = sortDirections.slice(0, validSortColumns.length);

        return {
            columns: validSortColumns as string[],
            directions: validSortDirections
        };
    }

    function loadSortSettings(): void {
        const savedSort = localStorageUtils.getData('table-sort');
        if (savedSort) {
            sortBy.value = savedSort.sortBy || [];
            sortDesc.value = savedSort.sortDesc || [];
        }
    }

    function loadTabSortSettings(group: string): void {
        const tabSortKey = `table-sort-${group.toLowerCase()}`;
        const savedSort = localStorageUtils.getData(tabSortKey);
        if (savedSort) {
            sortBy.value = savedSort.sortBy || [];
            sortDesc.value = savedSort.sortDesc || [];
        } else {
            sortBy.value = [];
            sortDesc.value = [];
        }
    }

    function saveSortSettings(): void {
        const tabSortKey = `table-sort-${currentStatusGroup.value.toLowerCase()}`;
        localStorageUtils.saveData(tabSortKey, {
            sortBy: sortBy.value,
            sortDesc: sortDesc.value
        });
    }

    function updateSort(column: string, desc: boolean): void {
        if (!column) {
            sortBy.value = [];
            sortDesc.value = [];
        } else {
            const columnIndex = sortBy.value.indexOf(column);

            if (columnIndex === -1) {
                sortBy.value = [...sortBy.value, column];
                sortDesc.value = [...sortDesc.value, desc];
            } else if (sortDesc.value[columnIndex] !== desc) {
                const newSortDesc = [...sortDesc.value];
                newSortDesc[columnIndex] = desc;
                sortDesc.value = newSortDesc;
            } else {
                sortBy.value = sortBy.value.filter((_, i) => i !== columnIndex);
                sortDesc.value = sortDesc.value.filter((_, i) => i !== columnIndex);
            }

            if (sortBy.value.length > 3) {
                sortBy.value = sortBy.value.slice(-3);
                sortDesc.value = sortDesc.value.slice(-3);
            }
        }

        saveSortSettings();
    }

    function resetSort(): void {
        sortBy.value = [];
        sortDesc.value = [];
        saveSortSettings();
    }

    return {
        sortBy,
        sortDesc,
        prepareSortFields,
        loadSortSettings,
        loadTabSortSettings,
        updateSort,
        resetSort
    };
}