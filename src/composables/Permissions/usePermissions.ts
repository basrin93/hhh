import { computed } from 'vue';
import PermissionsService from '@/services/Stock/api/Shared/PermissionsService';

export function usePermissions() {
    // Проверка прав
    const can = (permission: string) => PermissionsService.hasPermission(permission);

    // Проверка роли
    const isManager = computed(() => PermissionsService.isManager());

    return {
        can,
        isManager,
        permissions: PermissionsService.permissions
    };
}