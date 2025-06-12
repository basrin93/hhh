/**
 * Маппинг полей фронтенда к именам полей на бэкенде
 */
export const sortFieldMapping: Record<string, string> = {
    'leasing_contract.leasing_contract_number': 'leasingcontractnumber',
    'lot_number': 'lotnumber',
    'price': 'price',
    'realization_cost': 'realizationcost',
    'vin': 'vin',
    'equipment.type_ts': 'typets',
    'equipment.subtype1': 'subtype1',
    'equipment.subtype2': 'subtype2',
    'equipment.brand': 'brand',
    'equipment.model.name': 'modelname',
    'valuation_details.valuation_date': 'valuationdate',
    'valuation': 'valuation',
    'market_bottom': 'marketbottom',
    'realization_date': 'realizationdate',
    'parking.region': 'parkingregion',
    'year': 'year',
    'equipment.engine_power_hp': 'enginepowerhp',
    'equipment.engine_power_kw': 'enginepowerkw',
    'equipment.transmission': 'transmission',
    'state_number': 'statenumber',
    'equipment.body_type': 'bodytype',
    'equipment.name': 'equipmentname',
    'equipment.liquidity': 'liquidity',
    'equipment.type_fuel': 'typefuel',
    'equipment.category': 'category',
    'equipment.model.model_group_name': 'modelgroupname',
    'equipment.wheel_formula': 'wheelformula',
    'equipment.engine_volume': 'enginevolume',
    'equipment.mover_type.name': 'movertypename',
    'equipment.curb_weight': 'curbweight',
    'equipment.weigth': 'weight',
    'equipment.seats_number': 'seatsnumber',
    'equipment.dimensions': 'dimensions',
    'equipment.drive_unit': 'driveunit',
    'equipment.move_ability': 'moveability',
    'equipment.brand_country': 'brandcountry',
    'leasing_contract.supplier.name': 'suppliername',
    'leasing_contract.purchase_price': 'purchaseprice',
    'leasing_contract.supplier.inn': 'supplierinn',
    'leasing_contract.lessee.name': 'lesseename',
    'leasing_contract.lessee.inn': 'lesseeinn',
    'leasing_contract.lessor.name': 'lessorname',
    'leasing_contract.lessor.inn': 'lessorinn',
    'leasing_contract.contract_termination_date': 'contractterminationdate',
    'leasing_contract.seizure_date': 'seizuredate',
    'leasing_contract.lease_repurchase_date': 'leaserepurchasedate',
    'owners_count': 'ownerscount',
    'mileage': 'mileage',
    'engine_hours': 'enginehours',
    'color': 'color',
    'responsible.employee_display': 'employeedisplay'
};

/**
 * Преобразует имя поля с фронтенда в соответствующее имя на бэкенде
 * @param frontendField Имя поля на фронтенде
 * @returns Имя поля на бэкенде
 */
export function mapSortFieldName(frontendField: string): string {
    return sortFieldMapping[frontendField] || frontendField;
}