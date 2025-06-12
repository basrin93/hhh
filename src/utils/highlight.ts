export interface HighlightOptions {
    searchValue: string;
    highlightClass?: string;
}

function escapeRegExp(string: string): string {
    return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

export function highlightText(text: any, options: HighlightOptions): string {
    const { searchValue, highlightClass = 'search-highlight' } = options;

    if (!searchValue || !text) {
        return String(text || '');
    }

    const normalizedSearch = searchValue.toLowerCase();
    const normalizedText = String(text).toLowerCase();

    if (!normalizedText.includes(normalizedSearch)) {
        return String(text);
    }

    const regex = new RegExp(`(${escapeRegExp(searchValue)})`, 'gi');
    return String(text).replace(regex, `<mark class="${highlightClass}">$1</mark>`);
}

export function getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((acc, part) => acc && acc[part], obj);
}