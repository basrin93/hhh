import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

export enum SeizedPropertyStatus {
    TerminatedNotSeized = 'TerminatedNotSeized',
    TerminatedSeized = 'TerminatedSeized',
    TerminatedImpossibleSeized = 'TerminatedImpossibleSeized',
    TerminatedSelling = 'TerminatedSelling',
    Returned = 'Returned',
    Leased = 'Leased',
    Sold = 'Sold',
    TransferredToCorpPark = 'TransferredToCorpPark',
    Valuated = 'Valuated',
    PreparationForSale = 'PreparationForSale',
    FreeSale = 'FreeSale',
    Reserved = 'Reserved'
}

export enum StatusGroup {
    All = 'Active',
    Archive = 'Archive'
}

interface Status {
    code: SeizedPropertyStatus;
    name: string;
}

interface AvailableStatus {
    code: string;
    name: string;
    standard: boolean;
}

class SeizedPropertyStatusService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async getAvailableStatuses(currentStatus: Status, group: StatusGroup = StatusGroup.All): Promise<AvailableStatus[]> {
        try {
            console.log(`Запрос доступных статусов: status_group=${group}, current_status=${currentStatus.code}`);

            return await this.authenticatedRequest.makeRequest(
                'v1/seized-property-items/statuses',
                {
                    method: 'GET',
                    params: {
                        status_group: group,
                        current_status: currentStatus.code
                    }
                }
            );
        } catch (error) {
            console.error("Ошибка получения статусов:", error);
            return [];
        }
    }

    async updateStatus(uid: string, status: SeizedPropertyStatus): Promise<void> {
        try {
            console.log(`Обновление статуса: uid=${uid}, новый статус=${status}`);

            const response = await this.authenticatedRequest.makeRequest(
                `v1/seized-property-items/${uid}/status`,
                {
                    method: 'PATCH',
                    body: { status },
                    ignoreResponseBody: true
                }
            );

            if (response === null) {
                console.log('Статус успешно обновлен');
            }
        } catch (error) {
            console.error("Ошибка обновления статуса:", error);
            throw error;
        }
    }
}

export default new SeizedPropertyStatusService();