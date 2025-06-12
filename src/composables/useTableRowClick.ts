import {getCurrentInstance} from 'vue';
import {useCharacteristicsStore} from '@/Domains/StockDetails/Stores/characteristics';
import {usePropertyDetailStore} from '@/Domains/StockDetails/Stores/PropertyDetailStore';
import SeizedPropertyStateService from '@/Domains/StockDetails/API/Main/SeizedPropertyShortState';

export function useTableRowClick() {
    const { proxy } = getCurrentInstance();
    const router = proxy.$router;
    const characteristicsStore = useCharacteristicsStore();
    const propertyDetailStore = usePropertyDetailStore();

    async function navigateToProperty(uid: string, event?: Event, loadingCallback?: (loading: boolean) => void) {
        if (!uid) return;

        const isControlClick = event ? (event.ctrlKey || event.metaKey) : false;

        try {
            if (loadingCallback) {
                loadingCallback(true);
            }

            const [stateData, detailData] = await Promise.all([
                SeizedPropertyStateService.fetchPropertyState(uid),
                propertyDetailStore.fetchPropertyDetail(uid)
            ]);

            characteristicsStore.setPropertyState(stateData);

            let vinPath = 'no-vin';
            if (stateData.vin) {
                vinPath = stateData.vin.trim();
                if (vinPath.includes('/')) {
                    vinPath = encodeURIComponent(vinPath);
                }
            }

            let targetUrl = `/stock/${vinPath}?uid=${uid}`;

            if (detailData?.status?.code) {
                targetUrl += `&status=${detailData.status.code}`;
            }

            if (isControlClick) {
                window.open(targetUrl, '_blank');
            } else {
                await router.push(targetUrl);
            }
        } catch (error) {
            console.error('Ошибка при переходе к имуществу:', error);
        } finally {
            if (loadingCallback) {
                loadingCallback(false);
            }
        }
    }

    async function handleRowClick(event: any, row: any) {
        const selection = window.getSelection();
        const selectedText = selection ? selection.toString().trim() : '';

        if (selectedText.length > 0) {
            const nativeEvent = event?.originalEvent || event?.nativeEvent || event;
            if (nativeEvent?.stopPropagation) {
                nativeEvent.stopPropagation();
            }
            return;
        }

        if (!row?.item?.uid) return;

        const nativeEvent = event?.originalEvent || event?.nativeEvent || window.event;
        await navigateToProperty(row.item.uid, nativeEvent);
    }

    return {
        handleRowClick,
        navigateToProperty
    };
}