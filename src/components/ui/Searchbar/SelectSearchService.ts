import {reactive} from 'vue';

export class SelectSearchService {
    private searchValues: Record<string, string>;

    constructor(filterNames: string[]) {
        this.searchValues = reactive(
            filterNames.reduce((acc, name) => {
                acc[name] = '';
                return acc;
            }, {} as Record<string, string>)
        );
    }

    getSearchValues() {
        return this.searchValues;
    }

    filterItems(items: any[], filterName: string) {
        const searchQuery = this.searchValues[filterName]?.toLowerCase() || '';

        if (!searchQuery) return items;

        return items.filter(item => {
            const itemText = (item.text || '').toLowerCase();
            return itemText.includes(searchQuery);
        });
    }

    clearSearch(filterName: string) {
        this.searchValues[filterName] = '';
    }

    clearAllSearches() {
        Object.keys(this.searchValues).forEach(key => {
            this.searchValues[key] = '';
        });
    }
}