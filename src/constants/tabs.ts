import {type Component} from 'vue'
import GeneralCharacteristics from '@/Domains/StockDetails/Components/TabsContent/GeneralCharacteristics.vue'
import DocumentsViewer from '@/Domains/StockDetails/Components/Documents/DocumentsViewer.vue'
import ValuationHistory from "@/Domains/StockDetails/Components/Valuation/ValuationHistory.vue";
import Photo from '@/Domains/StockDetails/Components/Photo/Photo.vue'
import Realization from "@/Domains/StockDetails/Components/Realization/Realization.vue";

export interface Tab {
    id: number
    name: string
    icon: string
    component: Component
}

export const tabs: Tab[] = [
    {
        id: 0,
        name: 'Общие характеристики',
        icon: 'mdi-car',
        component: GeneralCharacteristics
    },
    {
        id: 1,
        name: 'Документы',
        icon: 'mdi-file-document',
        component: DocumentsViewer
    },
    {
        id: 2,
        name: 'Оценка',
        icon: 'mdi-calculator',
        component: ValuationHistory
    },

    {
        id: 3,
        name: 'Фото',
        icon: 'mdi-camera',
        component: Photo
    },
    {
        id: 4,
        name: 'Реализация',
        icon: 'mdi-camera',
        component: Realization
    },

]