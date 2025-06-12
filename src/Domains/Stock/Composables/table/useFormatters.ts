import CurrencyService from '@/services/Stock/CurrencyService';
import type {Item} from '@/types';

export function useFormatters() {
    const formatBasicField = (value: any, defaultValue = '-') => {
        return value ?? defaultValue;
    };

    const formatDate = (date: string) => {
        if (!date) return '-';

        try {
            return new Date(date).toLocaleDateString('ru-RU', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
        } catch (error) {
            return '-';
        }
    };

    const formatNamedObject = (obj: any) => {
        return obj?.name || '-';
    };

    const formatValue = (value: any, unit: string) => {
        return value !== null && value !== undefined ? `${value} ${unit}` : '-';
    };

    const formatPrice = (value: any) => {
        return (value && value > 0) ? CurrencyService.formatToRubles(value) : '0 ₽';
    };

    const formatMileage = (value: any) => {
        if (value === null || value === undefined || value === '') {
            return 'Не указан';
        }
        return `${value} км`;
    };

    const formatEngineVolume = (value: any) => {
        if (value === null || value === undefined) return '-';
        return `${value} см³`;
    };

    const formatPowerKw = (value: any) => {
        if (value === null || value === undefined) return '-';
        return `${parseFloat(value).toFixed(2)} кВт`;
    };

    const formatRestrictions = (value: boolean | null) => {
        if (value === null) return '-';
        return value ? 'Есть' : 'Нет';
    };

    const formatApprovedForSale = (value: boolean | null) => {
        if (value === null || value === undefined) return '-';
        return value ? 'Да' : 'Нет';
    };

    const formatRegion = (parkingObj: any) => {
        return parkingObj?.region || '-';
    };

    const formatResponsible = (value: any) => {
        return value?.employee_display || 'Не указан';
    };

    const formatTypeWithParent = (obj: any) => {
        if (!obj) return '-';
        return obj.parent ? `${formatNamedObject(obj.parent)} / ${formatNamedObject(obj)}` : formatNamedObject(obj);
    };

    const formatClassifiedAds = (classifiedAds: any[]) => {
        if (!classifiedAds || !Array.isArray(classifiedAds)) {
            return {
                alfa: '-',
                avito: '-',
                autoru: '-',
                tg: '-',
                drom: '-'
            };
        }

        const adsMap = {
            alfa: '-',
            avito: '-',
            autoru: '-',
            tg: '-',
            drom: '-'
        };

        classifiedAds.forEach(ad => {
            const code = ad?.classified?.code?.toLowerCase();
            const status = ad?.status?.value || ad?.status?.code;

            switch (code) {
                case 'alfa':
                case 'alfa-leasing':
                    adsMap.alfa = status || '-';
                    break;
                case 'avito':
                    adsMap.avito = status || '-';
                    break;
                case 'autoru':
                case 'auto.ru':
                    adsMap.autoru = status || '-';
                    break;
                case 'tg':
                case 'telegram':
                    adsMap.tg = status || '-';
                    break;
                case 'drom':
                    adsMap.drom = status || '-';
                    break;
            }
        });

        return adsMap;
    };

    const formatItems = (items: Item[]) => {
        console.log('📦 Начинаем форматирование списка, количество элементов:', items.length);

        return items.map(item => {
            return {
                uid: formatBasicField(item.uid),
                vin: formatBasicField(item.vin),
                lot_number: formatBasicField(item.lot_number),
                state_number: formatBasicField(item.state_number),
                year: formatBasicField(item.year),
                color: formatNamedObject(item.color),
                condition_status: typeof item.condition_status === 'object'
                    ? formatNamedObject(item.condition_status)
                    : formatBasicField(item.condition_status),
                engine_hours: formatValue(item.engine_hours, 'ч'),
                keys_count: typeof item.keys_count === 'object'
                    ? formatNamedObject(item.keys_count)
                    : formatBasicField(item.keys_count),
                mileage: formatMileage(item.mileage),
                owners_count: formatBasicField(item.owners_count),
                restrictions: formatRestrictions(item.restrictions),
                approved_for_sale: formatApprovedForSale(item.approved_for_sale),
                valuation: formatPrice(item.valuation?.valuation_cost),
                price: formatPrice(item.price),
                realization_date: formatDate(item.realization_date),
                realization_cost: formatPrice(item.realization_cost),
                parking: {
                    region: formatRegion(item.parking),
                    address: formatBasicField(item.parking?.address)
                },
                valuation_details: item.valuation ? {
                    uid: formatBasicField(item.valuation.uid),
                    valuation_cost: formatPrice(item.valuation.valuation_cost),
                    valuation_date: formatDate(item.valuation.valuation_date)
                } : null,
                market_bottom: formatPrice(item.market_bottom),
                responsible: {
                    employee_display: formatResponsible(item.responsible),
                    first_name: formatBasicField(item.responsible?.first_name),
                    last_name: formatBasicField(item.responsible?.last_name),
                },
                status: item.status ? {
                    name: formatBasicField(item.status.name),
                    code: formatBasicField(item.status.code)
                } : null,
                pts: item.pts ? {
                    name: formatBasicField(item.pts.name),
                    code: formatBasicField(item.pts.code)
                } : null,
                leasing_contract: item.leasing_contract ? {
                    leasing_contract_number: formatBasicField(item.leasing_contract.leasing_contract_number),
                    contract_termination_date: formatDate(item.leasing_contract.contract_termination_date),
                    lease_repurchase_date: formatDate(item.leasing_contract.lease_repurchase_date),
                    seizure_date: formatDate(item.leasing_contract.seizure_date),
                    purchase_price: formatPrice(item.leasing_contract.purchase_price),
                    lessor: item.leasing_contract.lessor ? {
                        name: formatBasicField(item.leasing_contract.lessor.name),
                        inn: formatBasicField(item.leasing_contract.lessor.inn)
                    } : null,
                    lessee: item.leasing_contract.lessee ? {
                        name: formatBasicField(item.leasing_contract.lessee.name),
                        inn: formatBasicField(item.leasing_contract.lessee.inn)
                    } : null,
                    supplier: item.leasing_contract.supplier ? {
                        name: formatBasicField(item.leasing_contract.supplier.name),
                        inn: formatBasicField(item.leasing_contract.supplier.inn)
                    } : null
                } : null,
                equipment: item.equipment ? {
                    uid: formatBasicField(item.equipment.uid),
                    name: formatBasicField(item.equipment.name),
                    liquidity: formatNamedObject(item.equipment.liquidity),
                    brand: formatNamedObject(item.equipment.brand),
                    model: item.equipment.model ? {
                        model_group_name: formatNamedObject(item.equipment.model.model_group),
                        name: formatNamedObject(item.equipment.model)
                    } : {
                        model_group_name: '-',
                        name: '-'
                    },
                    engine_volume: formatEngineVolume(item.equipment.engine_volume),
                    engine_power_hp: formatValue(item.equipment.engine_power_hp, 'л.с.'),
                    engine_power_kw: formatPowerKw(item.equipment.engine_power_kw),
                    transmission: formatNamedObject(item.equipment.transmission),
                    type_ts: formatTypeWithParent(item.equipment.type_ts),
                    subtype1: formatTypeWithParent(item.equipment.subtype1),
                    subtype2: formatNamedObject(item.equipment.subtype2),
                    body_type: formatNamedObject(item.equipment.body_type),
                    seats_number: formatBasicField(item.equipment.seats_number),
                    brand_country: item.equipment.brand_country ?
                        formatBasicField(item.equipment.brand_country.short_name || item.equipment.brand_country.name) : '-',
                    category: formatNamedObject(item.equipment.category),
                    type_fuel: formatNamedObject(item.equipment.type_fuel),
                    drive_unit: formatNamedObject(item.equipment.drive_unit),
                    curb_weight: formatValue(item.equipment.curb_weight, 'кг'),
                    dimensions: formatBasicField(item.equipment.dimensions),
                    weigth: formatValue(item.equipment.weigth, 'кг'),
                    wheel_formula: formatNamedObject(item.equipment.wheel_formula),
                    mover_type: item.equipment.mover_type ? {
                        name: formatBasicField(item.equipment.mover_type.name),
                        code: formatBasicField(item.equipment.mover_type.code)
                    } : null,
                    move_ability: formatNamedObject(item.equipment.move_ability)
                } : null,
                classifidesAds: formatClassifiedAds(item.classified_ads)
            };
        });
    };

    return { formatItems };
}