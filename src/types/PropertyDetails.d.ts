// types/index.ts
export interface BaseEntity {
    uid: string;
    name: string;
}

export interface ParentEntity {
    parent: {
        uid: string;
        name: string;
    } | null;
    uid: string;
    name: string;
}

export interface BrandCountry {
    code: string;
    short_name: string;
    uid: string;
}

export interface ModelGroup {
    uid: string;
    name: string;
}

export interface Model {
    model_group: ModelGroup;
    uid: string;
    name: string;
}

export interface MoverType {
    name: string;
    code: string;
}

export interface Equipment {
    body_type: string | null;
    brand: BaseEntity;
    brand_country: BrandCountry;
    category: BaseEntity;
    curb_weight: number | null;
    dimensions: string | null;
    drive_unit: string | null;
    engine_power_hp: number | null;
    engine_power_kw: number | null;
    engine_volume: number | null;
    liquidity: BaseEntity;
    model: Model;
    move_ability: string | null;
    mover_type: MoverType;
    name: string;
    seats_number: number | null;
    subtype1: ParentEntity;
    subtype2: ParentEntity;
    transmission: string | null;
    type_fuel: string | null;
    type_ts: ParentEntity;
    uid: string;
    weigth: number | null;
    wheel_formula: string | null;
}

export interface LeasingContract {
    leasing_contract_number: string;
    lessor: string | null;
    lessee: string | null;
}

export interface Status {
    name: string;
    code: string;
}

interface ClassifiedAd {
    uid: string;
    classified: ClassifiedInfo;
    link: string;
    status?: AdStatus;
    editable: boolean;
}

interface ClassifiedInfo {
    code: string;
    value: string;
}

interface AdStatus {
    code?: string;
    value?: string;
}

export interface PropertyDetail {
    color: string | null;
    condition_status: string | null;
    description: string | null;
    details: string | null;
    engine_hours: number | null;
    equipment: Equipment;
    interior_type: string | null;
    keys_number: number | null;
    leasing_contract: LeasingContract;
    mileage: number | null;
    owners_count: number | null;
    pts: string | null;
    responsible: string | null;
    restrictions: string | null;
    state_number: string | null;
    status: Status;
    uid: string;
    vin: string;
    year: number | null;
    classified_ads: ClassifiedAd[];
}