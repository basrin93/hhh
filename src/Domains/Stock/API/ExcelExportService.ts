import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

class ExcelExportService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async exportToExcel(
        filters: any,
        page: number = 1,
        perPage: number = 100,
        statusGroup: string = 'Active',
        sortColumns: string[] = [],
        sortDirections: boolean[] = []
    ): Promise<Blob> {
        try {
            const requestBody = {
                filter: filters,
                page,
                per_page: perPage,
                sort_column: sortColumns.length > 0 ? sortColumns : undefined,
                sort_desc: sortDirections.length > 0 ? sortDirections : undefined
            };

            console.log('📊 Excel Export запрос с сортировкой:', {
                sort_column: sortColumns,
                sort_desc: sortDirections
            });

            const response = await this.authenticatedRequest.makeRequest<Blob>(
                'v1/seized-property-items/xlsx',
                {
                    method: 'POST',
                    body: requestBody,
                    responseType: 'blob',
                    headers: {
                        'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
                    },
                    params: {
                        status_group: statusGroup
                    }
                }
            );

            if (!response) {
                throw new Error('Не удалось получить данные');
            }

            return response;
        } catch (error) {
            console.error("Ошибка при экспорте в Excel:", error);
            throw error;
        }
    }

    downloadFile(blob: Blob, filename: string = 'export.xlsx'): void {
        // Генерируем имя файла с датой и временем в указанном формате
        const now = new Date();
        const dateStr = now.toLocaleDateString('ru-RU', {
            day: '2-digit',
            month: '2-digit',
            year: '2-digit'
        }).replace(/\./g, '_');

        const timeStr = now.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        }).replace(':', '_');

        // Формируем имя в соответствии с требованием
        const finalFilename = `Выгрузка стока РМ ОРИИ_${dateStr}_${timeStr}.xlsx`;

        const url = window.URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', finalFilename);

        try {
            document.body.appendChild(link);
            link.click();
        } finally {
            document.body.removeChild(link);
            window.URL.revokeObjectURL(url);
        }
    }
}

export default new ExcelExportService();