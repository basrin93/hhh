import { ref } from 'vue';

interface ErrorHandlerOptions {
    logPrefix?: string;
    onError?: (error: Error) => void;
}

export function useErrorHandler(options: ErrorHandlerOptions = {}) {
    const { logPrefix = '🔄', onError } = options;
    const isLoading = ref(false);
    const error = ref<Error | null>(null);

    const handleAsync = async <T>(
        action: () => Promise<T>,
        actionName: string
    ): Promise<T | null> => {
        console.log(`${logPrefix} Начало операции:`, {
            action: actionName,
            timestamp: new Date().toISOString()
        });

        isLoading.value = true;
        error.value = null;

        try {
            const result = await action();
            return result;
        } catch (e) {
            const err = e instanceof Error ? e : new Error('Неизвестная ошибка');
            console.error(`❌ Ошибка в ${actionName}:`, err);
            error.value = err;

            if (onError) {
                onError(err);
            }

            return null;
        } finally {
            isLoading.value = false;
        }
    };

    return {
        isLoading,
        error,
        handleAsync
    };
}