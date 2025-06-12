import { useAuthenticatedRequest } from '@/composables/Auth/useAuthenticatedRequest';

interface DocumentTabOwner {
    name: string;
    uid: string;
}

interface DocumentTab {
    code: string;
    name: string;
    owners: DocumentTabOwner[];
}

interface DocumentTabsResponse {
    tabs: DocumentTab[];
}

interface DocumentType {
    name: string;
    code: string;
}

interface DocumentFile {
    name: string;
    guid: string;
    creation_date: string;
}

interface DocumentOwner {
    guid: string;
    type: string;
}

interface Document {
    validity: string;
    type: DocumentType;
    guid: string;
    is_deleted: boolean;
    doc_date: string;
    files: DocumentFile[];
    owners: DocumentOwner[];
    properties: string;
}

class DocumentsService {
    private authenticatedRequest;
    private fileStoreBaseUrl: string;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });

        this.fileStoreBaseUrl = window.SERVICE_ENVS.fileStoreBaseUrl || 'https://file-store.yc.alfaleasing.ru';
    }

    async fetchDocumentTabs(propertyUid: string): Promise<DocumentTabsResponse> {
        try {
            if (!propertyUid) {
                throw new Error('Отсутствует идентификатор имущества');
            }

            const response = await this.authenticatedRequest.makeRequest<DocumentTabsResponse>(
                `v1/seized-property/${propertyUid}/document-tabs`
            );

            return response || { tabs: [] };
        } catch (error) {
            console.error("Ошибка при получении вкладок документов:", error);
            return { tabs: [] };
        }
    }

    async fetchOwnerDocuments(tab: DocumentTab, ownerUid: string): Promise<any[]> {
        if (!ownerUid) {
            return [];
        }

        try {
            const typeMapping: Record<string, string> = {
                'LeasingAgreement': 'leasing_agreement',
                'Parkings': 'pl_on_parking'
            };

            let documentType = typeMapping[tab.code];
            if (!documentType) {
                documentType = tab.code
                    .replace(/([A-Z])/g, '_$1')
                    .toLowerCase()
                    .replace(/^_/, '');
            }

            const url = `${this.fileStoreBaseUrl}/store/${documentType}/${ownerUid}/list`;

            const response = await fetch(url, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: '[]'
            });

            if (!response.ok) {
                if (response.status === 404) {
                    return [];
                }
                throw new Error(`Ошибка при получении документов: ${response.status}`);
            }

            let data: Document[] = await response.json();

            const ownerInfo = tab.owners.find(owner => owner.uid === ownerUid);
            const ownerName = ownerInfo ? ownerInfo.name : 'Неизвестный владелец';

            return data
                .filter(doc => !doc.is_deleted)
                .flatMap(doc => {
                    if (!doc.files || !Array.isArray(doc.files)) {
                        return [];
                    }

                    return doc.files.map(file => ({
                        uid: file.guid,
                        title: file.name,
                        file_name: file.name,
                        file_size: 0,
                        created_at: file.creation_date,
                        updated_at: doc.doc_date,
                        is_deleted: doc.is_deleted,
                        document_type: doc.type?.name || 'Unknown',
                        document_code: doc.type?.code || 'unknown',
                        owner_uid: ownerUid,
                        owner_name: ownerName
                    }));
                });
        } catch (error) {
            console.error(`Ошибка при получении документов для владельца ${ownerUid}:`, error);
            return [];
        }
    }

    async fetchTabDocuments(tab: DocumentTab): Promise<any[]> {
        if (!tab.owners || tab.owners.length === 0) {
            return [];
        }

        try {
            const promises = tab.owners.map(owner => this.fetchOwnerDocuments(tab, owner.uid));
            const results = await Promise.all(promises);

            return results.flat();
        } catch (error) {
            console.error(`Ошибка при получении документов для вкладки ${tab.code}:`, error);
            return [];
        }
    }

    openDocumentPreview(fileGuid: string): void {
        if (!fileGuid) return;

        const previewUrl = `${this.fileStoreBaseUrl}/file/preview?guid=${fileGuid}`;
        window.open(previewUrl, '_blank');
    }

    async downloadFile(fileGuid: string, fileName: string = '', convertToPdf: boolean = false): Promise<void> {
        if (!fileGuid) return;

        try {
            let url = `${this.fileStoreBaseUrl}/file/download/${fileGuid}`;
            if (convertToPdf) {
                url += '?convert_type=PDF';
            }

            const response = await fetch(url, { method: 'GET' });
            if (!response.ok) {
                throw new Error(`Ошибка при скачивании файла: ${response.status}`);
            }

            const blob = await response.blob();

            let downloadFileName = fileName;
            const contentDisposition = response.headers.get('Content-Disposition');
            if (contentDisposition) {
                const fileNameMatch = contentDisposition.match(/filename="?([^"]*)"?/);
                if (fileNameMatch && fileNameMatch[1]) {
                    downloadFileName = fileNameMatch[1];
                }
            }

            if (!downloadFileName) {
                downloadFileName = `file_${fileGuid}`;
            }

            const downloadUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = downloadUrl;
            a.download = downloadFileName;
            document.body.appendChild(a);
            a.click();

            window.URL.revokeObjectURL(downloadUrl);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Ошибка при скачивании файла:', error);
        }
    }
}

export default new DocumentsService();