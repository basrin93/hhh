export interface Item {
    id?: string | number;
    [key: string]: any;
}

// Types for filters
export type ApprovedForSaleStatus = 'true' | 'false' | 'unknown';

export interface Filters {
    status: string[];
    vehicleType: string[];
    vehicleKind: string[];
    vehicleSubKind: string[];
    brand: string[];
    model: string[];
    equipment: string[];
    year: number[];
    liquidity: string[];
    powerHP: number[];
    powerKW: number[];
    yearMin: number | null;
    yearMax: number | null;
    powerHPMin: number | null;
    powerHPMax: number | null;
    powerKWMin: number | null;
    powerKWMax: number | null;
    dateOfSeizureMin: string | null;
    dateOfSeizureMax: string | null;
    // Дополнительные фильтры
    engineType: string[];
    wheelFormula: string[];
    transmissionType: string[];
    driveUnit: string[];
    responsible: string[];
    lessor: string[];
    lessee: string[];
    keysCount: string[];
    fuelType: string[];
    mileageMin: number | null;
    mileageMax: number | null;
    engineHoursMin: number | null;
    engineHoursMax: number | null;
    region: string;
    address: string;
    approved_for_sale: ApprovedForSaleStatus | null;
}

export interface FilterRequest {
    query?: string | null;
    type?: string;
    subtype1?: string;
    subtype2?: string;
    brand?: string;
    model?: string;
    equipment?: string;
    liquidity?: string;
    status?: string;
    status_group?: string;
    year_min?: number;
    year_max?: number;
    engine_power_hp_min?: number;
    engine_power_hp_max?: number;
    engine_power_kw_min?: number;
    engine_power_kw_max?: number;
    date_of_seizure_min?: string;
    date_of_seizure_max?: string;
    statuses?: string[];
    types?: string[];
    subtypes1?: string[];
    subtypes2?: string[];
    brands?: string[];
    models?: string[];
    equipments?: string[];
    liquidities?: string[];
    // Дополнительные поля для запроса
    fuel_types?: string[];
    transmission_types?: string[];
    wheel_formulas?: string[];
    lessors?: string[];
    lessees?: string[];
    drive_units?: string[];
    keys_counts?: string[];
    responsible_users?: string[];
    mileage_min?: number | null;
    mileage_max?: number | null;
    engine_hours_min?: number | null;
    engine_hours_max?: number | null;
    region?: string;
    address?: string;
    approved_for_sale?: ApprovedForSaleStatus | null;
}