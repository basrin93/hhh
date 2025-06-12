import {computed, ComputedRef, Ref, ref} from 'vue';
import PhotosService from '@/Domains/StockDetails/API/Photos/PhotosService';
import {usePropertyDetailStore} from "@/Domains/StockDetails/Stores/PropertyDetailStore";

const propertyDetailStore = usePropertyDetailStore();

export interface PhotoSlotDefinition {
    order: number;
    description: string;
    is_required: boolean;
    url?: string | null;
}

export interface PhotoData {
    slot_number: number;
    name: string | null;
    url: string | null;
    is_main: boolean | null;
}

export interface OperationResult {
    success: boolean;
    message?: string;
    error?: string;
}

export class PhotoManager {
    private propertyUid: string;
    private minioHost: string;

    public isLoading: Ref<boolean>;
    public isSaving: Ref<boolean>;
    public photoSlotDefinitions: Ref<PhotoSlotDefinition[]>;
    public photos: Ref<PhotoData[]>;

    public requiredPhotoSlots: ComputedRef<PhotoSlotDefinition[]>;
    public additionalPhotoSlots: ComputedRef<PhotoSlotDefinition[]>;

    constructor(propertyUid: string) {
        this.propertyUid = propertyUid;
        this.minioHost = window['SERVICE_ENVS'].MINIO_HOST;

        this.isLoading = ref(false);
        this.isSaving = ref(false);
        this.photoSlotDefinitions = ref<PhotoSlotDefinition[]>([]);
        this.photos = ref<PhotoData[]>([]);

        // Вычисляемые свойства
        this.requiredPhotoSlots = computed(() =>
            this.photoSlotDefinitions.value.filter(slot => slot.is_required)
        );

        this.additionalPhotoSlots = computed(() =>
            this.photoSlotDefinitions.value.filter(slot => !slot.is_required)
        );
    }

    /**
     * Обрабатывает URL изображения для корректного отображения
     */
    public getProperImageUrl(url: string | null): string | null {
        if (!url) return null;

        if (url.startsWith('http://') || url.startsWith('https://')) {
            return url;
        }

        if (url.startsWith('s3://')) {
            return url.replace('s3://', this.minioHost);
        }

        return url;
    }

    /**
     * Возвращает фото для конкретного слота
     */
    public getPhotoForSlot(slotNumber: number): PhotoData | null {
        const realPhoto = this.photos.value.find(photo => photo.slot_number === slotNumber);
        if (realPhoto?.url) {
            return realPhoto;
        }

        const slotWithPlaceholder = this.photoSlotDefinitions.value.find(
            slot => slot.order === slotNumber && slot.url
        );

        if (slotWithPlaceholder?.url) {
            return {
                slot_number: slotNumber,
                name: slotWithPlaceholder.description,
                url: slotWithPlaceholder.url,
                is_main: false
            };
        }

        return realPhoto || null;
    }

    /**
     * Инициализирует пустые слоты для фотографий
     */
    public initializePhotoSlots(): void {
        this.photoSlotDefinitions.value.forEach(slot => {
            const existingPhoto = this.photos.value.find(p => p.slot_number === slot.order);
            if (!existingPhoto) {
                this.photos.value.push({
                    slot_number: slot.order,
                    name: null,
                    url: null,
                    is_main: null
                });
            }
        });
    }

    /**
     * Инициализирует данные с использованием переданных деталей объекта
     * Избегает повторной загрузки данных, если они уже доступны
     */
    public async initializeWithDetails(propertyDetails: any): Promise<OperationResult> {
        try {
            this.isLoading.value = true;

            if (!propertyDetails) {
                throw new Error('Не переданы данные о транспортном средстве');
            }

            // Извлекаем тип ТС из переданных данных
            const vehicleType = propertyDetails?.equipment?.type_ts?.uid || null;
            const vehicleSubtype1 = propertyDetails?.equipment?.subtype1?.uid || null;
            const vehicleSubtype2 = propertyDetails?.equipment?.subtype2?.uid || null;

            // Загружаем слоты фотографий
            let slots: PhotoSlotDefinition[] = [];
            if (vehicleType) {
                slots = await PhotosService.fetchPhotoSlots(vehicleType, vehicleSubtype1, vehicleSubtype2);
            }

            this.photoSlotDefinitions.value = slots;

            // Получаем существующие фотографии из переданных данных
            if (propertyDetails?.photos?.length > 0) {
                this.photos.value = propertyDetails.photos.map(photo => ({
                    slot_number: photo.slot_number,
                    name: photo.name,
                    url: photo.url,
                    is_main: photo.is_main
                }));
            } else {
                this.photos.value = [];
            }

            this.initializePhotoSlots();
            return { success: true };

        } catch (error) {
            console.error('Ошибка при инициализации фотографий:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        } finally {
            this.isLoading.value = false;
        }
    }

    /**
     * Загружает данные о фотографиях и слотах
     * Этот метод выполняет полную загрузку с сервера
     */
    public async loadData(): Promise<OperationResult> {
        try {
            this.isLoading.value = true;

            if (!this.propertyUid) {
                throw new Error('Не указан идентификатор транспортного средства');
            }

            // Загружаем детали ТС через авторизованный запрос
            const propertyDetailResponse = await propertyDetailStore.fetchPropertyDetail(this.propertyUid)

            if (!propertyDetailResponse) {
                throw new Error('Ошибка при загрузке данных ТС');
            }

            return this.initializeWithDetails(propertyDetailResponse);

        } catch (error) {
            console.error('Ошибка при загрузке данных:', error);
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Неизвестная ошибка'
            };
        } finally {
            this.isLoading.value = false;
        }
    }

    /**
     * Загружает новую фотографию
     */
    public async uploadPhoto(file: File, slotNumber: number): Promise<OperationResult> {
        if (!file || !file.type.startsWith('image/')) {
            return { success: false, message: 'Пожалуйста, выберите изображение' };
        }

        try {
            this.isLoading.value = true;

            const response = await PhotosService.uploadImage(file);

            if (!response) throw new Error('Ошибка при загрузке');

            const photoUrl = response.photos?.[0]?.url || response.url;
            const photoName = response.photos?.[0]?.alt || response.alt || file.name;

            if (!photoUrl) throw new Error('Отсутствует URL изображения');

            // Обновляем фото в коллекции
            const existingIndex = this.photos.value.findIndex(p => p.slot_number === slotNumber);
            const newPhoto = {
                slot_number: slotNumber,
                name: photoName,
                url: photoUrl,
                is_main: false
            };

            // Если это первое фото или если обновляем главное фото
            if (this.photos.value.filter(p => p.url !== null).length === 0 ||
                (existingIndex !== -1 && this.photos.value[existingIndex].is_main)) {
                newPhoto.is_main = true;
            }

            if (existingIndex !== -1) {
                this.photos.value[existingIndex] = newPhoto;
            } else {
                this.photos.value.push(newPhoto);
            }

            return { success: true, message: 'Фото успешно загружено' };
        } catch (error) {
            console.error('Ошибка загрузки:', error);
            return {
                success: false,
                message: 'Ошибка при загрузке изображения'
            };
        } finally {
            this.isLoading.value = false;
        }
    }

    /**
     * Удаляет фотографию из слота
     */
    public deletePhoto(slotNumber: number): OperationResult {
        const index = this.photos.value.findIndex(p => p.slot_number === slotNumber);

        if (index !== -1) {
            const wasMain = this.photos.value[index].is_main;

            // Удаляем фото из слота
            this.photos.value[index] = {
                slot_number: slotNumber,
                name: null,
                url: null,
                is_main: null
            };

            // Если удалили главное, назначаем новое
            if (wasMain) {
                const firstPhoto = this.photos.value.find(p => p.url !== null);
                if (firstPhoto) firstPhoto.is_main = true;
            }

            return { success: true, message: 'Фото удалено' };
        }

        return { success: false, message: 'Фото не найдено' };
    }

    /**
     * Устанавливает фото как главное
     */
    public setMainPhoto(slotNumber: number): OperationResult {
        // Сбрасываем флаг у всех
        this.photos.value.forEach(photo => {
            if (photo.url) photo.is_main = false;
        });

        // Устанавливаем для выбранного
        const index = this.photos.value.findIndex(p => p.slot_number === slotNumber);
        if (index !== -1) {
            this.photos.value[index].is_main = true;
            return { success: true, message: 'Установлено главное фото' };
        }

        return { success: false, message: 'Фото не найдено' };
    }

    /**
     * Сохраняет изменения фотографий на сервере
     */
    public async savePhotos(): Promise<OperationResult> {
        try {
            this.isSaving.value = true;

            if (!this.propertyUid) {
                return { success: false, message: 'Ошибка: не указан идентификатор' };
            }

            // Проверяем, что только одно фото главное
            const mainPhotos = this.photos.value.filter(p => p.is_main === true);
            if (mainPhotos.length > 1) {
                // Оставляем только первое главным
                for (let i = 1; i < mainPhotos.length; i++) {
                    const index = this.photos.value.findIndex(p => p.slot_number === mainPhotos[i].slot_number);
                    if (index !== -1) this.photos.value[index].is_main = false;
                }
            } else if (mainPhotos.length === 0 && this.photos.value.some(p => p.url !== null)) {
                // Если есть фото, но нет главного, делаем первое главным
                const firstPhoto = this.photos.value.find(p => p.url !== null);
                if (firstPhoto) firstPhoto.is_main = true;
            }

            // Фильтруем для сохранения (только реальные фото, не заглушки)
            const photosToSave = this.photos.value.filter(p => p.url !== undefined);

            await PhotosService.updatePhotos(this.propertyUid, photosToSave);

            return { success: true, message: 'Изменения сохранены' };
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            return {
                success: false,
                message: 'Ошибка при сохранении'
            };
        } finally {
            this.isSaving.value = false;
        }
    }
}