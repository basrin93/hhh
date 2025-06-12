import { ref, computed } from 'vue';
import InProgress from '@/components/ui/banners/InProgress.vue';

export function useFeatures() {
    const features = ref(window.SERVICE_ENVS?.FEATURES || {});

    const isEnabled = (featureName: string) => {
        return computed(() => {
            return !!features.value[featureName];
        });
    };

    // либо InProgress баннер в зависимости от статуса фичи
    const getComponentOrBanner = (featureName: string, component: any) => {
        return computed(() => {
            return !!features.value[featureName] ? component : InProgress;
        });
    };

    return {
        isEnabled,
        features,
        getComponentOrBanner
    };
}