export interface CategoryValue {
    name: string
    value: string
}

export interface CategoryOption {
    option_name: string
    option_sysname: string
    option_category: string | null
    option_values: CategoryValue[]
    is_required: boolean
    input_type: string
    value?: string | number | boolean
}