import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

export interface LeasingParty {
    uid: string;
    name: string;
    inn: string;
}

export interface LeasingAgreement {
    uid: string;
    number: string;
    lessee: LeasingParty;
    lessor: LeasingParty;
    supplier: LeasingParty;
    purchase_price: number;
    termination_date: string | null;
    seizure_date: string | null;
}

interface LeasingAgreementsResponse {
    items: LeasingAgreement[];
}

class LeasingAgreementsService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async fetchLeasingAgreements(itemUid: string): Promise<LeasingAgreement[]> {
        try {
            const response = await this.authenticatedRequest.makeRequest<LeasingAgreementsResponse>(
                `v1/seized-property-items/${itemUid}/leasing-agreements`,
                {
                    method: 'GET'
                }
            );

            console.log('Leasing agreements response:', response);

            if (!response || !response.items) {
                return [];
            }

            return response.items;
        } catch (error) {
            console.error("Ошибка при загрузке договоров лизинга:", error);
            throw error;
        }
    }
}

export default new LeasingAgreementsService();