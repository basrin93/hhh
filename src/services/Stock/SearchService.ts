import {Item} from "@/types";
import SeizedPropertiesService from "@/Domains/Stock/API/SeizedPropertiesService";

interface SearchResult {
    items: Item[];
    count: number;
    timestamp: number;
}

interface CacheEntry {
    result: SearchResult;
    expires: number;
}

class SmartSearchService {
    private seizedPropertiesService: typeof SeizedPropertiesService;
    private cache: Map<string, CacheEntry>;
    private readonly CACHE_TTL = 5 * 60 * 1000; // 5 минут
    private readonly MAX_CACHE_SIZE = 50;
    private lastRequestTime: number = 0;

    constructor() {
        this.seizedPropertiesService = SeizedPropertiesService;
        this.cache = new Map();
        setInterval(() => this.cleanExpiredCache(), 60 * 1000);
    }

// В SmartSearchService
    async search(filters: any): Promise<SearchResult> {
        try {
            const query = filters.query || '';
            const normalizedQuery = this.normalizeSearchQuery(query);
            const cacheKey = this.getCacheKey(normalizedQuery, filters);

            const cached = this.cache.get(cacheKey);
            if (cached && cached.expires > Date.now()) {
                console.log('🎯 Найдено в кеше:', {
                    query: normalizedQuery,
                    resultCount: cached.result.count
                });
                return cached.result;
            }

            console.log('🔍 Получен поисковый запрос:', {
                query: normalizedQuery,
                filters,
                time: new Date().toISOString()
            });

            const now = Date.now();
            const timeSinceLastRequest = this.lastRequestTime ? now - this.lastRequestTime : 0;

            this.lastRequestTime = now;

            const result = await this.performSearch(normalizedQuery, filters);

            if (result.count > 0) {
                const cacheEntry: CacheEntry = {
                    result: { ...result, timestamp: Date.now() },
                    expires: Date.now() + this.CACHE_TTL
                };
                this.cache.set(cacheKey, cacheEntry);

                if (this.cache.size > this.MAX_CACHE_SIZE) {
                    const entries = Array.from(this.cache.entries());
                    entries.sort((a, b) => a[1].result.timestamp - b[1].result.timestamp);
                    const entriesToDelete = entries.slice(0, entries.length - this.MAX_CACHE_SIZE);
                    entriesToDelete.forEach(([key]) => this.cache.delete(key));
                }
            }

            return result;
        } catch (error) {
            console.error('❌ Ошибка при поиске:', error);
            return {
                items: [],
                count: 0,
                timestamp: Date.now()
            };
        }
    }

    private async performSearch(query: string, filters: any): Promise<SearchResult> {
        const response = await this.seizedPropertiesService.fetchSeizedProperties({
            ...filters,
            query: query || null,
        });

        return {
            items: response.items || [],
            count: response.count || 0,
            timestamp: Date.now()
        };
    }

    private normalizeSearchQuery(query: string): string {
        if (!query) return '';
        let normalized = query.toUpperCase();
        normalized = normalized.replace(/\s+/g, ' ').trim();
        return normalized;
    }


    private getCacheKey(query: string, filters?: any): string {
        return JSON.stringify({ q: query, f: filters });
    }

    private cleanExpiredCache(): void {
        const now = Date.now();
        let expiredCount = 0;
        //@ts-ignore
        for (const [key, entry] of this.cache.entries()) {
            if (entry.expires <= now) {
                this.cache.delete(key);
                expiredCount++;
            }
        }
        if (expiredCount > 0) {
            console.log(`🧹 Удалено ${expiredCount} устаревших записей кеша`);
        }
    }

    invalidateCache(): void {
        this.cache.clear();
        console.log('🔄 Кеш инвалидирован');
    }

    getCacheStats(): {
        size: number,
        entries: Array<{
            key: string,
            count: number,
            expires: string
        }>
    } {
        return {
            size: this.cache.size,
            entries: Array.from(this.cache.entries()).map(([key, entry]) => ({
                key,
                count: entry.result.count,
                expires: new Date(entry.expires).toISOString()
            }))
        };
    }
}

export default new SmartSearchService();