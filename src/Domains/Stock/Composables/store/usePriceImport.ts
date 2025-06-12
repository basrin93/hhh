import {ref} from 'vue';
import type {PriceImportResponse} from '@/Domains/Stock/API/Valuation/PriceImportService';
import PriceImportService from '@/Domains/Stock/API/Valuation/PriceImportService';

export function usePriceImport() {
    const isImportLoading = ref(false);
    const showImportDialog = ref(false);
    const importResult = ref<PriceImportResponse>({
        all: 0,
        processed: 0,
        successed: 0,
        failed: 0,
        warning: 0,
        report: []
    });

    function handlePriceImport(): void {
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = '.xlsx,.xls,.csv';

        fileInput.onchange = async (event) => {
            const target = event.target as HTMLInputElement;
            if (!target.files || target.files.length === 0) return;

            const file = target.files[0];

            showImportDialog.value = true;
            isImportLoading.value = true;

            try {
                const result = await PriceImportService.importPrices(file);
                importResult.value = result;
            } catch (error) {
                importResult.value = {
                    all: 0,
                    processed: 0,
                    successed: 0,
                    failed: 1,
                    warning: 0,
                    report: [{
                        messageType: 'ERROR',
                        message: error instanceof Error ? error.message : 'Неизвестная ошибка',
                        items: []
                    }]
                };
            } finally {
                isImportLoading.value = false;
            }
        };

        fileInput.click();
    }

    function handleImportDialogClose(onSuccess?: () => void): void {
        showImportDialog.value = false;

        if (importResult.value && importResult.value.processed > 0 && onSuccess) {
            onSuccess();
        }
    }

    return {
        isImportLoading,
        showImportDialog,
        importResult,
        handlePriceImport,
        handleImportDialogClose
    };
}