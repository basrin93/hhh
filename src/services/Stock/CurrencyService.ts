// src/services/CurrencyService.ts
class CurrencyService {
    formatToRubles(number?: number): string {
        if (!number) return "0 руб.";
        return new Intl.NumberFormat("ru-RU", {
            style: "currency",
            currency: "RUB",
            minimumFractionDigits: 0,
        }).format(number);
    }
}

export default new CurrencyService();