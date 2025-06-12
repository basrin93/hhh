import {useAuthenticatedRequest} from '@/composables/Auth/useAuthenticatedRequest';

interface PhotoSlotDefinition {
    order: number;
    description: string;
    is_required: boolean;
}

interface PhotoData {
    slot_number: number;
    name: string | null;
    url: string | null;
    is_main: boolean | null;
}

interface UploadResponse {
    photos: Array<{
        url: string;
        alt?: string;
    }>;
}

class PhotosService {
    private authenticatedRequest;

    constructor() {
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });
    }

    async fetchPhotoSlots(
        type?: string,
        subtype1?: string,
        subtype2?: string
    ): Promise<PhotoSlotDefinition[]> {
        try {
            const params: Record<string, string> = {};
            if (type) params.type = type;
            if (subtype1) params.subtype1 = subtype1;
            if (subtype2) params.subtype2 = subtype2;

            const response = await this.authenticatedRequest.makeRequest<PhotoSlotDefinition[]>(
                'v1/seized-property-items/photos',
                {
                    method: 'GET',
                    params
                }
            );

            return response || [];
        } catch (error) {
            console.error("❌ Ошибка при загрузке слотов для фотографий:", error);
            return [];
        }
    }

    async uploadImage(file: File): Promise<any> {
        try {
            console.log('📤 Загрузка изображения:', file.name);

            const formData = new FormData();
            formData.append('files', file, file.name);

            const response = await this.authenticatedRequest.makeRequest<UploadResponse>(
                'v1/external/images',
                {
                    method: 'POST',
                    headers: {
                        'Accept': 'application/json'
                    },
                    body: formData
                }
            );

            console.log('✅ Изображение загружено:', response);

            if (!response) {
                throw new Error('Пустой ответ от сервера');
            }

            return response.photos && response.photos.length
                ? {
                    url: response.photos[0].url,
                    alt: response.photos[0].alt || file.name
                }
                : response;

        } catch (error) {
            console.error("❌ Ошибка при загрузке изображения:", error);
            throw error;
        }
    }

    async updatePhotos(uid: string, photos: PhotoData[]): Promise<any> {
        try {
            if (!uid) throw new Error("UID не указан");

            const photosPayload = photos
                .filter(photo => photo.url !== undefined)
                .map(photo => ({
                    slot_number: photo.slot_number,
                    name: photo.name,
                    url: photo.url,
                    is_main: photo.is_main
                }));

            const payload = { photos: photosPayload };

            console.log('📝 Обновление фотографий:', payload);

            const response = await this.authenticatedRequest.makeRequest(
                `v1/seized-property-items/${uid}/photos`,
                {
                    method: 'PATCH',
                    body: payload
                }
            );

            console.log('✅ Фотографии обновлены:', response);

            return response;
        } catch (error) {
            console.error("❌ Ошибка при обновлении фотографий:", error);
            throw error;
        }
    }
}

export default new PhotosService();