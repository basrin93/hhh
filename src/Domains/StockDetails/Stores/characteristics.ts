import {defineStore} from 'pinia'
import SeizedPropertyStatusService, {
    SeizedPropertyStatus,
    StatusGroup
} from "@/Domains/StockDetails/API/Status/SeizedPropertyStatusService"
import {useOptionsStore} from "@/Domains/StockDetails/Stores/options";
import UsersService from "@/services/Stock/api/Shared/UsersService";
import {
    CharacteristicGroup,
    CharacteristicItem,
    CharacteristicsState,
    ProfileInfo,
    QuickInfoItem,
    QuickInfoStructureItem,
    User
} from '@/types/characteristics';

const QUICK_INFO_STRUCTURE: QuickInfoStructureItem[] = [
    { label: 'Допуск к реализации', field: 'approved_for_sale' },
    { label: 'Статус', field: 'status' },
    { label: 'Юридическое лицо', field: 'lessor' },
    { label: 'Договор лизинга', field: 'contract_number' },
    { label: 'Ответственный', field: 'responsible.employee_display' },
    { label: 'Актуальная стоимость', field: 'price' }
]

const getValueByPath = (obj: any, path: string): string => {
    return path.split('.').reduce((acc, part) => (acc ? acc[part] : ''), obj) || ''
}

const formatPrice = (value: any): string => {
    return value !== null && value !== undefined ? `${value.toLocaleString()} ₽` : '-'
}

const getInitialProfileInfo = (): ProfileInfo => ({
    image: '',
    title: '',
    lot: '',
    price: '',
    realization_price: '',
    vin: '',
    gos_number: '',
    location: '',
    state: '',
    stateCode: 0,
    stateMessage: null
})

const getInitialState = (): CharacteristicsState => ({
    isEditing: false,
    isSaving: false,
    availableStatuses: [],
    users: [],
    statusCodesMap: {},
    isLoading: true,
    activeTab: 0,
    currentUid: null,
    quickInfo: QUICK_INFO_STRUCTURE.map(item => ({
        label: item.label,
        value: ''
    })),
    characteristics: [],
    originalData: null,
    propertyState: null,
    profileInfo: getInitialProfileInfo()
})

export const useCharacteristicsStore = defineStore('characteristics', {
    state: (): CharacteristicsState => getInitialState(),

    getters: {
        transformedTabs: (state) => {
            useOptionsStore();
            let tabs = [];
            if (state.characteristics && state.characteristics.length > 0) {
                tabs = tabs.concat(state.characteristics.map(group => ({ title: group.title })))
            } else {
                tabs.push({ title: 'Основные характеристики' })
            }
            tabs.push({ title: 'Эксплуатационные характеристики' })

            tabs.push({ title: 'Договора лизинга' })
            
            tabs.push({ title: 'Объявления' })

            return tabs
        },

        getUrlParams: () => {
            const queryParams = new URLSearchParams(window.location.search);
            const uid = queryParams.get('uid');
            const statusCode = queryParams.get('status');

            if (uid) {
                return {
                    uid,
                    statusCode: statusCode || ''
                };
            }

            return null;
        }
    },

    actions: {
        resetState() {
            Object.assign(this, getInitialState())
        },

        setLoading(value: boolean) {
            this.isLoading = value
        },

        processQuickInfoItem(item: QuickInfoStructureItem, data: any): QuickInfoItem {
            if (item.field === 'price' || item.field === 'realization_cost') {
                return {
                    label: item.label,
                    value: formatPrice(data[item.field])
                }
            }

            if (item.field === 'approved_for_sale') {
                const approved = data[item.field];
                return {
                    label: item.label,
                    value: approved === true ? 'Да' : (approved === false ? 'Нет' : '-')
                }
            }

            return {
                label: item.label,
                value: getValueByPath(data, item.field) || ''
            }
        },

        updateProfileInfo(data: Partial<ProfileInfo>) {
            this.profileInfo = {
                ...this.profileInfo,
                ...data
            }
        },

        async setPropertyState(stateData: any) {
            if (!stateData) return

            const locationString = [
                stateData.city,
                stateData.parking_name
            ].filter(Boolean).join(', ')

            const statusCode = stateData.statusCode || stateData.status_code || '';

            this.updateProfileInfo({
                title: `${stateData.brand} ${stateData.model}`,
                lot: stateData.contract_number || '',
                vin: stateData.vin || '',
                gos_number: stateData.state_number || '',
                location: locationString,
                state: stateData.status || '',
                stateCode: statusCode,
                stateMessage: stateData.message || null,
                realization_price: formatPrice(stateData.price).replace(' ₽', '')
            })

            this.quickInfo = QUICK_INFO_STRUCTURE.map(item =>
                this.processQuickInfoItem(item, stateData)
            )

            await this.loadAvailableStatuses()
        },

        async loadUsers() {
            try {
                const users = await UsersService.fetchUsers()
                this.users = users.filter(u => u.employee_display || u.employeeDisplay)
            } catch (error) {
                console.error('❌ Ошибка при загрузке пользователей:', error)
            }
        },

        async loadAvailableStatuses() {
            try {
                const currentStatus = this.quickInfo.find(item => item.label === 'Статус')?.value;

                if (!currentStatus) {
                    return;
                }

                let statusCode = '';

                const statusNameToCode = {
                    'Расторгнут, не изъят': 'TerminatedNotSeized',
                    'Расторгнут, изъят': 'TerminatedSeized',
                    'Расторгнут, невозможно изъять': 'TerminatedImpossibleSeized',
                    'Расторгнут, реализован': 'TerminatedSelling',
                    'Возвращен/Выкуплен ЛП': 'Returned',
                    'Передан в лизинг': 'Leased',
                    'Реализован в деньги': 'Sold',
                    'Передан в кор. парк': 'TransferredToCorpPark',
                    'Оценен': 'Valuated',
                    'Подготовка к продаже': 'PreparationForSale',
                    'В свободной продаже': 'FreeSale',
                    'Резерв': 'Reserved'
                };

                if (currentStatus && statusNameToCode[currentStatus]) {
                    statusCode = statusNameToCode[currentStatus];
                }
                else if (currentStatus && this.statusCodesMap[currentStatus]) {
                    statusCode = this.statusCodesMap[currentStatus];
                }
                else if (this.profileInfo?.stateCode) {
                    statusCode = String(this.profileInfo.stateCode);
                }
                else {
                    const urlParams = this.getUrlParams;
                    if (urlParams?.statusCode) {
                        statusCode = urlParams.statusCode;
                    } else {
                        statusCode = currentStatus && currentStatus.includes('Расторгнут')
                            ? 'TerminatedNotSeized'
                            : 'Valuated';
                    }
                }

                const group = statusCode.includes('Terminated') ? StatusGroup.Archive : StatusGroup.All;

                const availableStatuses = await SeizedPropertyStatusService.getAvailableStatuses(
                    { code: statusCode as SeizedPropertyStatus, name: currentStatus || '' },
                    group
                );

                this.statusCodesMap = {};
                availableStatuses.forEach(status => {
                    this.statusCodesMap[status.name] = status.code;
                });

                if (currentStatus && !this.statusCodesMap[currentStatus]) {
                    this.statusCodesMap[currentStatus] = statusCode;
                }

                if (currentStatus && !availableStatuses.map(s => s.name).includes(currentStatus)) {
                    this.availableStatuses = [currentStatus, ...availableStatuses.map(s => s.name)];
                } else {
                    this.availableStatuses = availableStatuses.map(s => s.name);
                }
            } catch (error) {
                console.error('Ошибка загрузки статусов:', error);
                this.availableStatuses = [];
                this.statusCodesMap = {};
            }
        },

        async updateResponsible(user: User) {
            try {
                const urlParams = this.getUrlParams;
                const propertyUid = urlParams?.uid;

                if (!propertyUid || !user.uid) {
                    console.error('Отсутствует property-uid в URL или uid пользователя')
                    return
                }

                await UsersService.updateResponsible([{
                    seizedPropertyUid: propertyUid,
                    userUid: user.uid
                }])

                const responsibleInfo = this.quickInfo.find(item => item.label === 'Ответственный')
                if (responsibleInfo) {
                    responsibleInfo.value = user.employee_display || user.employeeDisplay || ''
                }
            } catch (error) {
                console.error('❌ Ошибка при обновлении ответственного:', error)
                throw error
            }
        },

        async updateStatusCode(newValue: string) {
            try {
                const code = this.statusCodesMap[newValue];
                const urlParams = this.getUrlParams;
                const propertyUid = urlParams?.uid;

                if (!code || !propertyUid) {
                    console.error('Отсутствует код статуса или property-uid в URL')
                    return
                }

                await SeizedPropertyStatusService.updateStatus(propertyUid, code as SeizedPropertyStatus)

                const statusInfo = this.quickInfo.find(item => item.label === 'Статус')
                if (statusInfo) {
                    statusInfo.value = newValue
                }

                await this.loadAvailableStatuses()
            } catch (error) {
                console.error('Ошибка при обновлении статуса:', error)
                throw error
            }
        },

        setCharacteristics(data: CharacteristicGroup[], rowData: any) {
            if (!data) return

            this.characteristics = data
            this.originalData = JSON.parse(JSON.stringify(data))
            this.isLoading = false
        },

        startEditing() {
            this.originalData = JSON.parse(JSON.stringify(this.characteristics))
            this.isEditing = true
        },

        cancelEditing() {
            if (this.originalData) {
                this.characteristics = JSON.parse(JSON.stringify(this.originalData))
            }
            this.isEditing = false
            this.originalData = null
        },

        validateField(item: CharacteristicItem) {
            if (!item.value.trim() && this.originalData) {
                const originalItem = this.findOriginalItem(item)
                if (originalItem) {
                    item.value = originalItem.value
                }
            }
        },

        findOriginalItem(item: CharacteristicItem) {
            if (!this.originalData) return null

            for (const group of this.originalData) {
                for (const section of group.items) {
                    const found = section.items.find(i => i.value === item.value)
                    if (found) return found
                }
            }

            return null
        }
    }
})