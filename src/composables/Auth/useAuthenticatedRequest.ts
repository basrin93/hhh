import {ref} from 'vue';
import {AuthService} from '@/services/core/AuthService';

interface RequestOptions {
    method?: string;
    headers?: Record<string, string>;
    body?: any;
    responseType?: string;
    params?: Record<string, string>;
    signal?: AbortSignal;
}

interface UseAuthenticatedRequestOptions {
    baseURL: string;
    authService?: AuthService;
}

interface RequestState {
    isLoading: boolean;
    promise?: Promise<any>;
    controller?: AbortController;
    timestamp: number;
}

class EnhancedAuthenticatedRequest {
    private baseURL: string;
    private authService: AuthService;
    private requestsMap = new Map<string, RequestState>();
    private isAuthenticating = false;

    public isLoading = ref(false);
    public error = ref<Error | null>(null);

    constructor({ baseURL, authService = new AuthService() }: UseAuthenticatedRequestOptions) {
        this.baseURL = baseURL;
        this.authService = authService;
        setInterval(() => this.cleanupOldRequests(), 30000);
    }

    private cleanupOldRequests(): void {
        const now = Date.now();
        Array.from(this.requestsMap.entries()).forEach(([key, request]) => {
            if (!request.isLoading && (now - request.timestamp > 30000)) {
                this.requestsMap.delete(key);
            }
        });
    }

    public abortRequest(endpoint: string, options: RequestOptions = {}): void {
        const requestKey = this.getRequestKey(endpoint, options);
        const request = this.requestsMap.get(requestKey);

        if (request?.controller) {
            request.controller.abort();
            this.requestsMap.delete(requestKey);
        }
    }

    public abortAllRequests(): void {
        Array.from(this.requestsMap.values()).forEach(request => {
            request.controller?.abort();
        });
        this.requestsMap.clear();
    }

    private getRequestKey(endpoint: string, options: RequestOptions): string {
        const params = options.params ?
            new URLSearchParams(
                Object.entries(options.params)
                    .filter(([_, value]) => value !== undefined)
                    .reduce((acc, [key, value]) => ({
                        ...acc,
                        [key]: value as string
                    }), {})
            ).toString() : '';

        const body = options.body ?
            JSON.stringify(options.body, Object.keys(options.body).sort()) : '';

        return `${options.method || 'GET'}:${endpoint}:${params}:${body}`;
    }

    private async ensureAuthenticated(): Promise<boolean> {
        // Предотвращаем одновременные попытки аутентификации
        if (this.isAuthenticating) {
            console.log('Аутентификация уже в процессе, ожидание...');
            return false;
        }

        try {
            const user = await this.authService.getUser();

            // Проверяем не только наличие токена, но и его валидность
            if (!user?.access_token || this.isTokenExpired(user)) {
                console.log('Токен отсутствует или истек, требуется аутентификация');

                this.isAuthenticating = true;
                await this.authService.login();
                return false;
            }

            return true;
        } catch (error) {
            console.error('Ошибка при проверке аутентификации:', error);
            return false;
        } finally {
            // Сбрасываем флаг через некоторое время
            setTimeout(() => {
                this.isAuthenticating = false;
            }, 1000);
        }
    }

    // Проверка истечения токена
    private isTokenExpired(user: any): boolean {
        if (!user.expires_at) return false;

        const now = Math.floor(Date.now() / 1000);
        const expiry = user.expires_at;

        // Считаем токен истекшим за 30 секунд до фактического истечения
        return (expiry - 30) <= now;
    }

    async makeRequest<T>(
        endpoint: string,
        options: RequestOptions = {}
    ): Promise<T | null> {
        const requestKey = this.getRequestKey(endpoint, options);

        const existingRequest = this.requestsMap.get(requestKey);
        if (existingRequest?.isLoading && existingRequest.promise) {
            return existingRequest.promise;
        }

        this.isLoading.value = true;
        this.error.value = null;

        const controller = new AbortController();

        const promise = (async () => {
            try {
                if (!(await this.ensureAuthenticated())) {
                    console.log('Аутентификация не пройдена, отменяем запрос');
                    return null;
                }

                const user = await this.authService.getUser();
                if (!user?.access_token) {
                    throw new Error('Отсутствует токен доступа после аутентификации');
                }

                const isFormData = options.body instanceof FormData;

                const headers: HeadersInit = {
                    'Authorization': `Bearer ${user.access_token}`,
                    'Cache-Control': 'no-store',
                    'Pragma': 'no-cache',
                    ...options.headers
                };

                if (!isFormData) {
                    headers['Content-Type'] = 'application/json';
                }

                const url = new URL(`${this.baseURL}${endpoint}`);
                if (options.params) {
                    Object.entries(options.params)
                        .filter(([_, value]) => value !== undefined)
                        .forEach(([key, value]) => {
                            url.searchParams.append(key, value);
                        });
                }

                let requestBody: BodyInit | undefined;
                if (options.body) {
                    if (isFormData) {
                        requestBody = options.body;
                    } else {
                        requestBody = JSON.stringify(options.body);
                    }
                }

                const response = await fetch(url.toString(), {
                    method: options.method || 'GET',
                    headers,
                    body: requestBody,
                    credentials: 'include',
                    cache: 'no-store',
                    mode: 'cors',
                    signal: options.signal || controller.signal
                });

                if (!response.ok) {
                    if (response.status === 401) {
                        console.log('Получен статус 401, токен недействителен');
                        // Не вызываем login() при 401, избегаем бесконечных редиректов
                        return null;
                    }

                    const errorText = await response.text();
                    throw new Error(`HTTP error! status: ${response.status}, details: ${errorText}`);
                }

                if (options.responseType === 'blob') {
                    return response.blob() as Promise<T>;
                }

                const contentType = response.headers.get('content-type');
                if (!contentType?.includes('application/json') || response.status === 204) {
                    return null;
                }

                return await response.json();
            } catch (e) {
                if ((e as Error)?.name === 'AbortError') {
                    return null;
                }

                this.error.value = e instanceof Error ? e : new Error('Unknown error occurred');
                throw this.error.value;
            } finally {
                setTimeout(() => {
                    this.isLoading.value = false;
                    this.requestsMap.delete(requestKey);
                }, 100);
            }
        })();

        this.requestsMap.set(requestKey, {
            isLoading: true,
            promise,
            controller,
            timestamp: Date.now()
        });

        return promise;
    }
}

export function useAuthenticatedRequest(options: UseAuthenticatedRequestOptions) {
    const service = new EnhancedAuthenticatedRequest(options);

    return {
        makeRequest: service.makeRequest.bind(service),
        abortRequest: service.abortRequest.bind(service),
        abortAllRequests: service.abortAllRequests.bind(service),
        isLoading: service.isLoading,
        error: service.error
    };
}