import {ref} from 'vue';
import SeizedPropertyFiltersService from '@/Domains/Stock/API/Filters/SeizedPropertyFiltersService';
import UsersService from '@/services/Stock/api/Shared/UsersService';

export function useAdditionalFilters(filters, emit) {
    const isLoading = ref({
        engineTypes: false,
        wheelFormulas: false,
        transmissionTypes: false,
        driveUnits: false,
        responsibles: false,
        lessors: false,
        lessees: false,
        keysCount: false,
        fuelTypes: false
    });

    const engineTypeItems = ref([]);
    const wheelFormulaItems = ref([]);
    const transmissionTypeItems = ref([]);
    const driveUnitItems = ref([]);
    const responsibleItems = ref([]);
    const lessorItems = ref([]);
    const lesseeItems = ref([]);
    const keysCountItems = ref([]);
    const fuelTypeItems = ref([]);

    const engineType = ref([]);
    const wheelFormula = ref([]);
    const transmissionType = ref([]);
    const driveUnit = ref([]);
    const responsible = ref([]);
    const lessor = ref([]);
    const lessee = ref([]);
    const keysCount = ref([]);
    const fuelType = ref([]);
    const region = ref('');
    const address = ref('');

    const countActiveFilters = () => {
        let count = 0;

        if (engineType.value.length) count += engineType.value.length;
        if (wheelFormula.value.length) count += wheelFormula.value.length;
        if (transmissionType.value.length) count += transmissionType.value.length;
        if (driveUnit.value.length) count += driveUnit.value.length;
        if (responsible.value.length) count += responsible.value.length;
        if (lessor.value.length) count += lessor.value.length;
        if (lessee.value.length) count += lessee.value.length;
        if (keysCount.value.length) count += keysCount.value.length;
        if (fuelType.value.length) count += fuelType.value.length;
        if (region.value) count += 1;
        if (address.value) count += 1;

        return count;
    };

    const syncInputValues = () => {
        engineType.value = filters.engineType || [];
        wheelFormula.value = filters.wheelFormula || [];
        transmissionType.value = filters.transmissionType || [];
        driveUnit.value = filters.driveUnit || [];
        responsible.value = filters.responsible || [];
        lessor.value = filters.lessor || [];
        lessee.value = filters.lessee || [];
        keysCount.value = filters.keysCount || [];
        fuelType.value = filters.fuelType || [];
        region.value = filters.region || '';
        address.value = filters.address || '';
    };

    const loadFilterData = async () => {
        try {
            isLoading.value.engineTypes = true;
            const fuelTypesResponse = await SeizedPropertyFiltersService.fetchFuelTypes();
            fuelTypeItems.value = fuelTypesResponse.map(item => ({
                text: item.name,
                value: item.uid
            }));
            isLoading.value.engineTypes = false;

            isLoading.value.wheelFormulas = true;
            const wheelFormulasResponse = await SeizedPropertyFiltersService.fetchWheelFormulas();
            wheelFormulaItems.value = wheelFormulasResponse.map(item => ({
                text: item.name,
                value: item.uid
            }));
            isLoading.value.wheelFormulas = false;

            isLoading.value.transmissionTypes = true;
            const transmissionTypesResponse = await SeizedPropertyFiltersService.fetchTransmissionTypes();
            transmissionTypeItems.value = transmissionTypesResponse.map(item => ({
                text: item.name,
                value: item.uid
            }));
            isLoading.value.transmissionTypes = false;

            isLoading.value.driveUnits = true;
            const driveUnitsResponse = await SeizedPropertyFiltersService.fetchDriveUnits();
            driveUnitItems.value = driveUnitsResponse.map(item => ({
                text: item.name,
                value: item.uid
            }));
            isLoading.value.driveUnits = false;

            isLoading.value.responsibles = true;
            const usersResponse = await UsersService.fetchUsers();
            responsibleItems.value = usersResponse.map(user => ({
                text: user.employeeDisplay || user.uid,
                value: user.uid
            }));
            isLoading.value.responsibles = false;

            isLoading.value.lessors = true;
            const lessorsResponse = await SeizedPropertyFiltersService.fetchParticipants('lessor');
            lessorItems.value = lessorsResponse.map(item => ({
                text: item.name,
                value: item.uid
            }));
            isLoading.value.lessors = false;

            isLoading.value.lessees = true;
            const lesseesResponse = await SeizedPropertyFiltersService.fetchParticipants('lessee');
            lesseeItems.value = lesseesResponse.map(item => ({
                text: item.name,
                value: item.uid
            }));
            isLoading.value.lessees = false;

            isLoading.value.keysCount = true;
            const keysCountResponse = await SeizedPropertyFiltersService.fetchKeysCount();
            keysCountItems.value = keysCountResponse.map(item => ({
                text: item.name,
                value: item.uid
            }));
            isLoading.value.keysCount = false;

        } catch (error) {
            console.error('Ошибка при загрузке данных для дополнительных фильтров:', error);
        }
    };

    const applyAdditionalFilters = () => {
        // НЕ ПЕРЕЗАПИСЫВАЕМ filters и НЕ ЭМИТИМ - это уже делает компонент!
    };

    const resetAdditionalFilters = () => {
        engineType.value = [];
        wheelFormula.value = [];
        transmissionType.value = [];
        driveUnit.value = [];
        responsible.value = [];
        lessor.value = [];
        lessee.value = [];
        keysCount.value = [];
        fuelType.value = [];
        region.value = '';
        address.value = '';
    };

    return {
        isLoading,
        engineTypeItems,
        wheelFormulaItems,
        transmissionTypeItems,
        driveUnitItems,
        responsibleItems,
        lessorItems,
        lesseeItems,
        keysCountItems,
        fuelTypeItems,
        engineType,
        wheelFormula,
        transmissionType,
        driveUnit,
        responsible,
        lessor,
        lessee,
        keysCount,
        fuelType,
        region,
        address,
        syncInputValues,
        loadFilterData,
        applyAdditionalFilters,
        resetAdditionalFilters,
        countActiveFilters
    };
}