import {computed} from 'vue';

export function useProgressiveSkeleton(items, itemsPerPage, isLoading, headers = null) {
    // Генерация скелетон-элементов только для видимых заголовков
    const generateSkeletonItems = (count) => {
        return Array.from({ length: count }, (_, index) => {
            const skeletonItem = {
                uid: `skeleton-${index}`,
                _skeleton: true,
                status: { name: '' },
                vin: '',
                lot_number: '',
                state_number: '',
                leasing_contract: { leasing_contract_number: '' }
            };

            // Добавляем поля только для видимых заголовков
            if (headers?.value) {
                headers.value.forEach(header => {
                    if (header.visible && header.value && !skeletonItem.hasOwnProperty(header.value)) {
                        // Поддерживаем вложенные поля
                        if (header.value.includes('.')) {
                            const [parent, child] = header.value.split('.');
                            if (!skeletonItem[parent]) {
                                skeletonItem[parent] = {};
                            }
                            skeletonItem[parent][child] = '';
                        } else {
                            skeletonItem[header.value] = '';
                        }
                    }
                });
            }

            return skeletonItem;
        });
    };

    // Элементы для отображения (реальные или скелетоны)
    const displayItems = computed(() => {
        if (isLoading.value) {
            return generateSkeletonItems(itemsPerPage.value);
        }
        return items.value;
    });

    // Определение класса скелетона в зависимости от типа поля
    const getSkeletonClass = (fieldName) => {
        if (fieldName.includes('date') || fieldName.includes('created') || fieldName.includes('updated')) {
            return 'skeleton-text-medium';
        }
        if (fieldName.includes('price') || fieldName.includes('amount') || fieldName.includes('year')) {
            return 'skeleton-text-short';
        }
        if (fieldName.includes('description') || fieldName.includes('comment')) {
            return 'skeleton-text-long';
        }
        if (fieldName.includes('name') || fieldName.includes('title')) {
            return 'skeleton-text-medium';
        }
        if (fieldName.includes('vin') || fieldName.includes('number')) {
            return 'skeleton-text-long';
        }
        return 'skeleton-text-medium';
    };

    return {
        displayItems,
        getSkeletonClass,
        generateSkeletonItems
    };
}