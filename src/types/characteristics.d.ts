// Базовые типы характеристик
export interface CharacteristicItem {
    label: string;
    value: string;
}

export interface CharacteristicSection {
    title: string;
    items: CharacteristicItem[];
}

export interface CharacteristicGroup {
    title: string;
    items: CharacteristicSection[];
}

// Типы пользователей
export interface User {
    uid: string;
    employeeDisplay: string | null;
    location?: {
        city: string | null;
        timezone: string | null;
    };
}

// Типы элементов быстрой информации
export interface QuickInfoItem {
    label: string;
    value: string;
}

export interface QuickInfoStructureItem {
    label: string;
    field: string;
}

// Типы профиля и состояния
export interface ProfileInfo {
    image: string;
    title: string;
    lot: string;
    price: string;
    realization_price: string;
    vin: string;
    gos_number: string;
    location: string;
    state?: string;
    stateCode?: number;
    stateMessage?: string | null;
}

export interface PropertyState {
    state: string;
    stateCode: number;
    message: string | null;
}

// Тип состояния стора
export interface CharacteristicsState {
    isEditing: boolean;
    isSaving: boolean;
    isLoading: boolean;
    availableStatuses: string[];
    statusCodesMap: Record<string, string>;
    activeTab: number;
    users: User[];
    currentUid: string | null;
    quickInfo: QuickInfoItem[];
    characteristics: CharacteristicGroup[];
    originalData: CharacteristicGroup[] | null;
    profileInfo: ProfileInfo;
    propertyState: PropertyState | null;
}