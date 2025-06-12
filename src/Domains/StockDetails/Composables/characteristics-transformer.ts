import type {Item} from '@/types';
import {formatter} from '@/utils/FormatterService';

interface CharacteristicsSection {
    title: string;
    items: {
        title: string;
        value: string;
    }[];
}

interface CharacteristicsData {
    title: string;
    items: CharacteristicsSection[];
}

export function transformPropertyToCharacteristics(response: Item | null): CharacteristicsData[] {
    if (!response) return [];

    const { equipment, leasing_contract, pts } = response;
    if (!equipment) return [];

    const getVehicleType = (equipment: any): string => {
        const type = equipment.type_ts?.name;
        return type || '-';
    };

    const formatNamedObject = (obj: { name?: string } | null | undefined): string => {
        if (!obj || !obj.name) return '-';
        return obj.name;
    };

    const sections = [
        {
            title: "Основная информация",
            items: [
                {
                    title: 'Наименование ТС',
                    value: equipment.name || '-',
                },
                {
                    title: '№ Лота',
                    value: response.lot_number || '-',
                },
                {
                    title: 'Марка',
                    value: formatNamedObject(equipment.brand),
                },
                {
                    title: 'Модель',
                    value: formatNamedObject(equipment.model),
                },
                {
                    title: 'Модельный ряд',
                    value: formatNamedObject(equipment.model?.model_group),
                },
                {
                    title: 'Год выпуска',
                    value: response.year?.toString() || '-',
                },
                {
                    title: 'VIN',
                    value: response.vin || '-',
                },
                {
                    title: 'Гос. номер',
                    value: response.state_number || '-',
                },
                {
                    title: 'ПТС',
                    value: formatNamedObject(pts),
                }
            ]
        },
        {
            title: "Технические характеристики",
            items: [
                {
                    title: 'Тип ТС',
                    value: getVehicleType(equipment),
                },
                {
                    title: 'Вид ТС',
                    value: formatNamedObject(equipment.subtype1),
                },
                {
                    title: 'Подвид ТС',
                    value: formatNamedObject(equipment.subtype2),
                },
                {
                    title: 'Тип кузова',
                    value: formatNamedObject(equipment.body_type),
                },
                {
                    title: 'Категория',
                    value: formatNamedObject(equipment.category),
                },
                {
                    title: 'Страна производства',
                    value: equipment.brand_country
                        ? `${equipment.brand_country.short_name || '-'} (${equipment.brand_country.name || '-'})`
                        : '-',
                },
                {
                    title: 'Колесная формула',
                    value: formatNamedObject(equipment.wheel_formula),
                },
                {
                    title: 'Привод',
                    value: formatNamedObject(equipment.drive_unit),
                },
                {
                    title: 'Тип двигателя',
                    value: formatNamedObject(equipment.mover_type),
                }
            ]
        },
        {
            title: "Двигатель и трансмиссия",
            items: [
                {
                    title: 'Мощность двигателя (л.с.)',
                    value: equipment.engine_power_hp?.toString() || '-',
                },
                {
                    title: 'Мощность двигателя (кВт)',
                    value: equipment.engine_power_kw?.toFixed(2) || '-',
                },
                {
                    title: 'Объем двигателя (см³)',
                    value: equipment.engine_volume?.toString() || '-',
                },
                {
                    title: 'Тип топлива',
                    value: formatNamedObject(equipment.type_fuel),
                },
                {
                    title: 'КПП',
                    value: formatNamedObject(equipment.transmission),
                }
            ]
        },
        {
            title: "Массогабаритные характеристики",
            items: [
                {
                    title: 'Снаряженная масса (кг)',
                    value: equipment.curb_weight?.toString() || '-',
                },
                {
                    title: 'Полная масса (кг)',
                    value: equipment.weigth?.toString() || '-',
                },
                {
                    title: 'Габариты',
                    value: equipment.dimensions?.toString() || '-',
                },
                {
                    title: 'Количество мест',
                    value: equipment.seats_number?.toString() || '-',
                }
            ]
        },
        {
            title: "Состояние и статус",
            items: [
                {
                    title: 'Ликвидность',
                    value: formatNamedObject(equipment.liquidity),
                },
                {
                    title: 'Допуск к реализации',
                    value: response.approved_for_sale === true
                        ? 'Да'
                        : (response.approved_for_sale === false ? 'Нет' : '-'),
                },
                {
                    title: 'Статус',
                    value: formatNamedObject(response.status),
                },
                {
                    title: 'Возможность движения',
                    value: formatNamedObject(equipment.move_ability),
                },
                {
                    title: 'Ограничения',
                    value: response.restrictions === true
                        ? 'Да'
                        : (response.restrictions === false ? 'Нет' : '-'),
                }
            ]
        }
    ];

    // Добавляем секцию лизинга только если есть данные о договоре
    if (leasing_contract) {
        sections.push({
            title: "Лизинговая информация",
            items: [
                {
                    title: 'Номер договора лизинга',
                    value: leasing_contract.leasing_contract_number || '-',
                },
                {
                    title: 'Лизингодатель',
                    value: formatNamedObject(leasing_contract.lessor),
                },
                {
                    title: 'Лизингополучатель',
                    value: formatNamedObject(leasing_contract.lessee),
                },
                {
                    title: 'Поставщик',
                    value: formatNamedObject(leasing_contract.supplier),
                },
                {
                    title: 'Стоимость покупки',
                    value: formatter.formatCurrency(leasing_contract.purchase_price),
                },
                {
                    title: 'Дата расторжения договора',
                    value: formatter.formatDate(leasing_contract.contract_termination_date, false),
                },
                {
                    title: 'Дата изъятия',
                    value: formatter.formatDate(leasing_contract.seizure_date, false),
                },
                {
                    title: 'Дата выкупа',
                    value: formatter.formatDate(leasing_contract.lease_repurchase_date, false),
                }
            ]
        });
    }

    return [
        {
            title: 'Основные характеристики',
            items: sections
        }
    ];
}