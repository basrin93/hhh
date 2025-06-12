import {computed, ref} from 'vue';
import {localStorageUtils} from '@/utils/localStorage';
import {currentStatusGroup} from '@/stores/Shared/statusGroup';
import type {FilterRequest, Filters, ApprovedForSaleStatus} from '@/types/filters';

const getFiltersStorageKey = (group: string) => `vehicle-filters-${group.toLowerCase()}`;

export function useFilters() {
    const filters = ref<Filters>({
        status: [],
        vehicleType: [],
        vehicleKind: [],
        vehicleSubKind: [],
        brand: [],
        model: [],
        equipment: [],
        year: [],
        liquidity: [],
        powerHP: [],
        powerKW: [],
        yearMin: null,
        yearMax: null,
        powerHPMin: null,
        powerHPMax: null,
        powerKWMin: null,
        powerKWMax: null,
        dateOfSeizureMin: null,
        dateOfSeizureMax: null,
        engineType: [],
        wheelFormula: [],
        transmissionType: [],
        driveUnit: [],
        responsible: [],
        lessor: [],
        lessee: [],
        keysCount: [],
        fuelType: [],
        mileageMin: null,
        mileageMax: null,
        engineHoursMin: null,
        engineHoursMax: null,
        region: null,
        approved_for_sale: null,
        address: null,
    });

    function getEmptyFilters(): Filters {
        return {
            status: [],
            vehicleType: [],
            vehicleKind: [],
            vehicleSubKind: [],
            brand: [],
            model: [],
            equipment: [],
            year: [],
            liquidity: [],
            powerHP: [],
            powerKW: [],
            yearMin: null,
            yearMax: null,
            powerHPMin: null,
            powerHPMax: null,
            powerKWMin: null,
            powerKWMax: null,
            dateOfSeizureMin: null,
            dateOfSeizureMax: null,
            engineType: [],
            wheelFormula: [],
            transmissionType: [],
            driveUnit: [],
            responsible: [],
            lessor: [],
            lessee: [],
            keysCount: [],
            fuelType: [],
            mileageMin: null,
            mileageMax: null,
            engineHoursMin: null,
            engineHoursMax: null,
            region: null,
            approved_for_sale: undefined,
            address: null,
        };
    }

    function loadFiltersFromStorage(group: string): void {
        const savedFilters = localStorageUtils.getData(getFiltersStorageKey(group));
        if (savedFilters) {
            filters.value = savedFilters;
        } else {
            filters.value = getEmptyFilters();
        }
    }

    function saveFiltersToStorage(group: string): void {
        localStorageUtils.saveData(getFiltersStorageKey(group), filters.value);
    }

    function clearFiltersFromStorage(group: string): void {
        localStorageUtils.clearData(getFiltersStorageKey(group));
        filters.value = getEmptyFilters();
    }

    function hasActiveFiltersInGroup(group: 'Active' | 'Archive'): boolean {
        const savedFilters = localStorageUtils.getData(getFiltersStorageKey(group));
        if (!savedFilters) return false;

        return Object.values(savedFilters).some(filterValues => {
            if (Array.isArray(filterValues)) {
                return filterValues.length > 0;
            } else {
                return filterValues !== null && filterValues !== undefined;
            }
        });
    }

    const activeFiltersCount = computed(() => {
        const savedFilters = localStorageUtils.getData(getFiltersStorageKey(currentStatusGroup.value));

        if (savedFilters) {
            return Object.entries(savedFilters).reduce((count, [key, filterValues]) => {
                const isRangeFilter = [
                    'yearMin', 'yearMax', 'powerHPMin', 'powerHPMax',
                    'powerKWMin', 'powerKWMax', 'dateOfSeizureMin', 'dateOfSeizureMax',
                    'mileageMin', 'mileageMax', 'engineHoursMin', 'engineHoursMax'
                ].includes(key);

                if (isRangeFilter) {
                    return filterValues !== null && filterValues !== undefined ? count + 1 : count;
                }

                if (Array.isArray(filterValues)) {
                    return count + filterValues.length;
                }

                return filterValues !== null && filterValues !== undefined ? count + 1 : count;
            }, 0) || undefined;
        }

        return undefined;
    });

    function createServerFilters(storeFilters: Filters, searchValue?: string): FilterRequest {
        const extractValues = (items: any[]) => {
            if (!items || !items.length) return [];

            if (typeof items[0] === 'object' && items[0] !== null && 'value' in items[0]) {
                return items.map(item => item.value);
            }

            return items;
        };

        const processKeysCount = (keys: string[]) => {
            if (!keys || !keys.length) return [];

            const keyMapping: Record<string, string> = {
                'Не применимо': 'NONE',
                '1 ключ': 'ONE',
                '2 ключа': 'TWO',
            };

            return keys.map(key => keyMapping[key] || key);
        };

        const getApprovedForSaleValue = (): ApprovedForSaleStatus | undefined => {
            const value = storeFilters.approved_for_sale;
            return value !== null ? value : undefined;
        };

        const serverFilters: FilterRequest = {
            query: searchValue || null,
            statuses: extractValues(storeFilters.status || []),
            types: extractValues(storeFilters.vehicleType || []),
            subtypes1: extractValues(storeFilters.vehicleKind || []),
            subtypes2: extractValues(storeFilters.vehicleSubKind || []),
            brands: extractValues(storeFilters.brand || []),
            models: extractValues(storeFilters.model || []),
            equipments: extractValues(storeFilters.equipment || []),
            liquidities: extractValues(storeFilters.liquidity || []),

            year_min: storeFilters.yearMin || null,
            year_max: storeFilters.yearMax || null,
            engine_power_hp_min: storeFilters.powerHPMin || null,
            engine_power_hp_max: storeFilters.powerHPMax || null,
            engine_power_kw_min: storeFilters.powerKWMin || null,
            engine_power_kw_max: storeFilters.powerKWMax || null,
            date_of_seizure_min: storeFilters.dateOfSeizureMin || null,
            date_of_seizure_max: storeFilters.dateOfSeizureMax || null,
            mileage_min: storeFilters.mileageMin || null,
            mileage_max: storeFilters.mileageMax || null,
            engine_hours_min: storeFilters.engineHoursMin || null,
            engine_hours_max: storeFilters.engineHoursMax || null,

            fuel_types: extractValues(storeFilters.fuelType || []),
            transmission_types: extractValues(storeFilters.transmissionType || []),
            wheel_formulas: extractValues(storeFilters.wheelFormula || []),
            lessors: extractValues(storeFilters.lessor || []),
            lessees: extractValues(storeFilters.lessee || []),
            drive_units: extractValues(storeFilters.driveUnit || []),
            keys_counts: processKeysCount(storeFilters.keysCount || []),
            responsible_users: extractValues(storeFilters.responsible || []),
            region: storeFilters.region || null,
            address: storeFilters.address || null,

            status_group: currentStatusGroup.value
        };

        const approvedValue = getApprovedForSaleValue();
        if (approvedValue !== undefined) {
            serverFilters.approved_for_sale = approvedValue;
        }

        return serverFilters;
    }

    const statusFilter = computed({
        get: () => filters.value.status,
        set: (value) => filters.value.status = value
    });

    return {
        filters,
        statusFilter,
        activeFiltersCount,
        getEmptyFilters,
        loadFiltersFromStorage,
        saveFiltersToStorage,
        clearFiltersFromStorage,
        hasActiveFiltersInGroup,
        createServerFilters
    };
}