import {ref} from 'vue';
import {AuthService} from '@/services/core/AuthService';
import {useAuthenticatedRequest} from '@/composables/Auth/useAuthenticatedRequest';
import container from '@/inversify.config';

interface UserInfo {
    user_uid: string;
    full_name: string;
    role: string;
}

interface PermissionsResponse {
    user: UserInfo;
    permissions: string[];
}

class PermissionsService {
    private authService: AuthService;
    private authenticatedRequest;

    public permissions = ref<string[]>([]);
    public userRole = ref<string>('');
    public isLoading = ref<boolean>(false);
    public isInitialized = ref<boolean>(false);
    public lastError = ref<Error | null>(null);

    private _isManagerFlag = ref<boolean>(false);

    constructor() {
        this.authService = container.get('AuthService');
        this.authenticatedRequest = useAuthenticatedRequest({
            baseURL: window.SERVICE_ENVS.API_URL
        });

        this.setupEventListeners();
    }

    private setupEventListeners() {
        if (typeof window !== 'undefined') {
            window.addEventListener('user-authenticated', this.handleUserAuthenticated.bind(this));
            window.addEventListener('user-logged-out', this.handleUserLoggedOut.bind(this));
        }
    }

    private async handleUserAuthenticated() {
        await this.reinitialize();
    }

    private handleUserLoggedOut() {
        this.reset();
    }

    private reset() {
        this.permissions.value = [];
        this.userRole.value = '';
        this.isInitialized.value = false;
        this.lastError.value = null;
        this._isManagerFlag.value = false;
    }

    async reinitialize(): Promise<boolean> {
        this.reset();
        return await this.initialize();
    }

    async initialize(): Promise<boolean> {
        if (this.isInitialized.value) {
            return true;
        }

        try {
            this.isLoading.value = true;
            this.lastError.value = null;

            const user = await this.authService.getUser();

            if (!user) {
                this.lastError.value = new Error('User not authenticated');
                return false;
            }

            if (!user.profile) {
                this.lastError.value = new Error('User profile not found');
                return false;
            }

            const userGuid = user.profile.employee_uid;
            if (!userGuid) {
                const alternativeId = user.profile.sub || user.profile.id || user.profile.uuid;

                if (alternativeId) {
                    const success = await this.getUserPermissions(alternativeId);
                    if (success) {
                        this.isInitialized.value = true;
                        return true;
                    }
                }

                this.lastError.value = new Error('Employee UID not found in user profile');
                return false;
            }

            const success = await this.getUserPermissions(userGuid);

            if (success) {
                this.isInitialized.value = true;
                return true;
            }

            return false;
        } catch (error) {
            this.lastError.value = error instanceof Error ? error : new Error('Unknown error');
            return false;
        } finally {
            this.isLoading.value = false;
        }
    }

    async getUserPermissions(userId: string): Promise<boolean> {
        try {
            const response = await this.authenticatedRequest.makeRequest<PermissionsResponse>(
                `v1/users/${userId}/permissions`,
                { method: 'GET' }
            );

            if (!response) {
                throw new Error('Не удалось получить права пользователя');
            }

            this.userRole.value = response.user.role;
            this.permissions.value = response.permissions;
            this._isManagerFlag.value = this.userRole.value === 'Manager';

            return true;
        } catch (error) {
            this.lastError.value = error instanceof Error ? error : new Error('Unknown error');

            const errorMsg = error instanceof Error ? error.message : 'Unknown error';

            if (errorMsg.includes('401')) {
                this.showAuthError('Вероятно, Ваша сессия истекла. Пожалуйста, обновите страницу и введите корректные учетные данные', 'session_expired');
            } else if (errorMsg.includes('403')) {
                this.showAuthError('К сожалению, у Вас нет доступа к этой странице. Для получения доступа обратитесь, пожалуйста, к Вашему руководителю', 'access_denied');
            }

            return false;
        }
    }

    hasPermission(permission: string): boolean {
        return this.permissions.value.includes(permission);
    }

    isManager(): boolean {
        return this._isManagerFlag.value;
    }

    private showAuthError(message: string, type: string): void {
        window.dispatchEvent(new CustomEvent('auth-error', {
            detail: { message, type }
        }));
    }

    destroy() {
        if (typeof window !== 'undefined') {
            window.removeEventListener('user-authenticated', this.handleUserAuthenticated.bind(this));
            window.removeEventListener('user-logged-out', this.handleUserLoggedOut.bind(this));
        }
    }
}

export default new PermissionsService();