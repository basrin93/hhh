export function useFilterDependencies() {
    const dependencyMap = {
        vehicleType: ['vehicleKind', 'vehicleSubKind', 'brand', 'model', 'equipment'],
        vehicleKind: ['vehicleSubKind', 'brand', 'model', 'equipment'],
        vehicleSubKind: ['brand', 'model', 'equipment'],
        brand: ['model', 'equipment'],
        model: ['equipment']
    };

    const clearDependentFields = (filterType: string, filters: any) => {
        console.log('🧹 Очистка зависимых фильтров:', {
            filterType,
            dependentFields: dependencyMap[filterType],
            timestamp: new Date().toISOString()
        });

        dependencyMap[filterType]?.forEach(field => {
            filters[field] = [];
        });
    };

    const getDependentFields = (filterType: string) => {
        return dependencyMap[filterType] || [];
    };

    return {
        clearDependentFields,
        getDependentFields
    };
}