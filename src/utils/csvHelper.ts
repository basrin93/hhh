import * as XLSX from "xlsx";
import { Header, Item } from "@/types";

// Генерация Excel-файла с настройкой ширины колонок
export function generateExcel(items: Item[], headers: Header[]): XLSX.WorkSheet {
    const visibleHeaders = headers.filter((header) => header.visible);

    // Заголовки (верхняя строка)
    const excelHeader = visibleHeaders.map((header) => header.text);

    // Данные (строки таблицы)
    const excelRows = items.map((item) =>
        visibleHeaders.map((header) => {
            const value = header.value
                .split(".")
                .reduce((acc: any, key: string) => (acc && acc[key] !== undefined ? acc[key] : ""), item);
            return value || ""; // Если значения нет, заменяем на пустую строку
        })
    );

    // Создаем лист Excel
    const worksheet = XLSX.utils.aoa_to_sheet([excelHeader, ...excelRows]);

    // Настройка ширины колонок
    worksheet["!cols"] = visibleHeaders.map(() => ({ wch: 20 })); // Устанавливаем ширину в 20 символов

    return worksheet;
}

// Скачивание Excel-файла
export function downloadExcelFile(worksheet: XLSX.WorkSheet, filename = "export.xlsx"): void {
    const workbook = XLSX.utils.book_new(); // Создаем новую книгу
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1"); // Добавляем лист

    // Сохраняем и скачиваем файл
    XLSX.writeFile(workbook, filename);
}