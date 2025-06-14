import {Header} from '@/types';

export const headers: Header[] = [
    { text: 'Номер договора', value: 'leasing_contract.leasing_contract_number', sortable: true, visible: true, align: 'start' },
    { text: '№ Лота', value: 'lot_number', sortable: true, visible: true, align: 'start' },
    { text: 'Статус', value: 'status.name', sortable: true, visible: true, align: 'start' },
    { text: 'Допуск к реализации', value: 'approved_for_sale', sortable: true, visible: true, align: 'start' },
    { text: 'VIN', value: 'vin', sortable: true, visible: true, align: 'start' },
    { text: 'Тип ТС', value: 'equipment.type_ts', sortable: true, visible: true, align: 'start' },
    { text: 'Вид ТС', value: 'equipment.subtype1', sortable: true, visible: true, align: 'start' },
    { text: 'Подвид ТС', value: 'equipment.subtype2', sortable: true, visible: true, align: 'start' },
    { text: 'Бренд', value: 'equipment.brand', sortable: true, visible: true, align: 'start' },
    { text: 'Модель', value: 'equipment.model.name', sortable: true, visible: true, align: 'start' },
    { text: 'Дата оценки', value: 'valuation_details.valuation_date', sortable: true, visible: true, align: 'start' },
    { text: 'Актуальная оценка', value: 'valuation', sortable: true, visible: true, align: 'start' },
    { text: 'Нижняя граница рынка', value: 'market_bottom', sortable: true, visible: true, align: 'start' },
    { text: 'Актуальная стоимость', value: 'price', sortable: true, visible: true, align: 'start' },
    { text: 'Город', value: 'parking.region', sortable: true, visible: true, align: 'start' },
    { text: 'Адрес стоянки', value: 'parking.address', sortable: false, visible: true, align: 'start' },
    { text: 'Год выпуска', value: 'year', sortable: true, visible: true, align: 'start' },
    { text: 'Мощность (л.с.)', value: 'equipment.engine_power_hp', sortable: true, visible: true, align: 'start' },
    { text: 'Мощность (кВт)', value: 'equipment.engine_power_kw', sortable: true, visible: true, align: 'start' },
    { text: 'Трансмиссия', value: 'equipment.transmission', sortable: true, visible: true, align: 'start' },
    { text: 'Гос.номер', value: 'state_number', sortable: true, visible: true, align: 'start' },
    { text: 'Тип кузова', value: 'equipment.body_type', sortable: true, visible: true, align: 'start' },
    { text: 'Комплектация', value: 'equipment.name', sortable: true, visible: true, align: 'start' },
    { text: 'Ликвидность', value: 'equipment.liquidity', sortable: true, visible: true, align: 'start' },
    { text: 'Тип ПТС', value: 'pts.name', sortable: true, visible: true, align: 'start' },
    { text: 'Тип двигателя', value: 'equipment.type_fuel', sortable: true, visible: true, align: 'start' },
    { text: 'Категория', value: 'equipment.category', sortable: true, visible: true, align: 'start' },
    { text: 'Модельный ряд', value: 'equipment.model.model_group_name', sortable: true, visible: true, align: 'start' },
    { text: 'Колесная формула', value: 'equipment.wheel_formula', sortable: true, visible: true, align: 'start' },
    { text: 'Объем двигателя', value: 'equipment.engine_volume', sortable: true, visible: true, align: 'start' },
    { text: 'Тип движителя', value: 'equipment.mover_type.name', sortable: true, visible: true, align: 'start' },
    { text: 'Снаряженная масса', value: 'equipment.curb_weight', sortable: true, visible: true, align: 'start' },
    { text: 'Вес', value: 'equipment.weigth', sortable: true, visible: true, align: 'start' },
    { text: 'Количество мест', value: 'equipment.seats_number', sortable: true, visible: true, align: 'start' },
    { text: 'Габариты', value: 'equipment.dimensions', sortable: true, visible: true, align: 'start' },
    { text: 'Привод', value: 'equipment.drive_unit', sortable: true, visible: true, align: 'start' },
    { text: 'Подвижность', value: 'equipment.move_ability', sortable: true, visible: true, align: 'start' },
    { text: 'Страна производства', value: 'equipment.brand_country', sortable: true, visible: true, align: 'start' },
    { text: 'Поставщик', value: 'leasing_contract.supplier.name', sortable: true, visible: true, align: 'start' },
    { text: 'Стоимость по ДКП', value: 'leasing_contract.purchase_price', sortable: true, visible: true, align: 'start' },
    { text: 'ИНН поставщика', value: 'leasing_contract.supplier.inn', sortable: true, visible: true, align: 'start' },
    { text: 'Лизингополучатель', value: 'leasing_contract.lessee.name', sortable: true, visible: true, align: 'start' },
    { text: 'ИНН лизингополучателя', value: 'leasing_contract.lessee.inn', sortable: true, visible: true, align: 'start' },
    { text: 'Лизингодатель', value: 'leasing_contract.lessor.name', sortable: true, visible: true, align: 'start' },
    { text: 'ИНН лизингодателя', value: 'leasing_contract.lessor.inn', sortable: true, visible: true, align: 'start' },
    { text: 'Дата расторжения', value: 'leasing_contract.contract_termination_date', sortable: true, visible: true, align: 'start' },
    { text: 'Дата изъятия', value: 'leasing_contract.seizure_date', sortable: true, visible: true, align: 'start' },
    { text: 'Дата выкупа', value: 'leasing_contract.lease_repurchase_date', sortable: true, visible: true, align: 'start' },
    { text: 'Количество владельцев', value: 'owners_count', sortable: true, visible: true, align: 'start' },
    { text: 'Пробег', value: 'mileage', sortable: true, visible: true, align: 'start' },
    { text: 'Состояние', value: 'condition_status', sortable: true, visible: true, align: 'start' },
    { text: 'Наработка', value: 'engine_hours', sortable: true, visible: true, align: 'start' },
    { text: 'Количество ключей', value: 'keys_count', sortable: true, visible: true, align: 'start' },
    { text: 'Ограничения', value: 'restrictions', sortable: false, visible: true, align: 'start' },
    { text: 'Цвет', value: 'color', sortable: true, visible: true, align: 'start' },
    { text: 'Дата реализации', value: 'realization_date', sortable: true, visible: true, align: 'start' },
    { text: 'Цена реализации', value: 'realization_cost', sortable: true, visible: true, align: 'start' },
    { text: 'Ответственный', value: 'responsible.employee_display', sortable: true, visible: true, align: 'start' },
    { text: 'Альфа-лизинг', value: 'classifidesAds.alfa', sortable: true, visible: true, align: 'start' },
    { text: 'Авито', value: 'classifidesAds.avito', sortable: true, visible: true, align: 'start' },
    { text: 'Auto.ru', value: 'classifidesAds.autoru', sortable: true, visible: true, align: 'start' },
    { text: 'ТГ', value: 'classifidesAds.tg', sortable: true, visible: true, align: 'start' },
    { text: 'Дром', value: 'classifidesAds.drom', sortable: true, visible: true, align: 'start' },

];