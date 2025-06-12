import { computed, ref, nextTick, watch, onMounted } from 'vue'
import type { CategoryOption, CategoryValue } from '@/types/options'

export function useCategoryOptions(options: CategoryOption[]) {
    const activeTab = ref<string>('')

    // Находим опцию категорий в массиве опций
    const categoryOption = computed(() => {
        return options.find(option => option.option_sysname === 'category_list')
    })

    // Получаем список категорий
    const categories = computed(() => {
        // Если найдена специальная опция с категориями
        if (categoryOption.value && categoryOption.value.option_values?.length) {
            return categoryOption.value.option_values.reduce((acc, category) => {
                acc[category.value] = category.name
                return acc
            }, {} as Record<string, string>)
        }

        // Резервный вариант: собираем уникальные категории из опций
        const uniqueCategories = [...new Set(options.map(option => option.option_category))].filter(Boolean)
        return uniqueCategories.reduce((acc, category) => {
            if (category) {
                // Преобразуем SNAKE_CASE в читаемый формат для отображения
                const readableName = category
                    .split('_')
                    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                    .join(' ')

                acc[category] = readableName
            }
            return acc
        }, {} as Record<string, string>)
    })

    // Группируем опции по категориям
    const groupedOptions = computed(() => {
        // Исключаем опцию с перечнем категорий из группировки
        const optionsToGroup = options.filter(option => option.option_sysname !== 'category_list')

        return optionsToGroup.reduce((acc, option) => {
            const category = option.option_category || 'MAIN'
            if (!acc[category]) {
                acc[category] = []
            }
            acc[category].push(option)
            return acc
        }, {} as Record<string, CategoryOption[]>)
    })

    // Следим за изменениями в опциях и доступных категориях
    watch(
        () => Object.keys(groupedOptions.value),
        (newCategories) => {
            if (newCategories.length > 0) {
                // Если текущая активная вкладка больше не существует в списке категорий,
                // или если активная вкладка еще не была установлена
                if (!newCategories.includes(activeTab.value)) {
                    // Устанавливаем первую доступную категорию как активную
                    activeTab.value = newCategories[0]
                }
            }
        },
        { immediate: true }
    )

    // Инициализируем активную вкладку при монтировании компонента
    onMounted(() => {
        const categories = Object.keys(groupedOptions.value)
        if (categories.length > 0 && !activeTab.value) {
            // Устанавливаем приоритет на категорию MAIN, если она существует
            const mainCategory = categories.find(category => category === 'MAIN')
            activeTab.value = mainCategory || categories[0]
        }
    })

    const handleTabChange = async (newTab: string) => {
        // Проверяем, что новая вкладка существует в списке категорий
        if (Object.keys(groupedOptions.value).includes(newTab)) {
            await nextTick()
            activeTab.value = newTab
            console.log('Переключение на вкладку:', newTab, 'Название:', getCategoryTitle(newTab))
        } else {
            console.warn('Попытка переключения на несуществующую вкладку:', newTab)
        }
    }

    const getCategoryTitle = (category: string): string => {
        return categories.value[category] || category
    }

    const isArrayType = (type: string): boolean => {
        return type === 'array[object]' || type === 'array[string]'
    }

    const formatSelectItems = (values: CategoryValue[]) => {
        return values.map(item => ({
            text: item.name,
            value: item.value
        }))
    }

    const isFieldInvalid = (item: CategoryOption): boolean => {
        if (!item.is_required) return false
        return !item.value && item.value !== 0 && item.value !== false
    }

    return {
        activeTab,
        categories,
        groupedOptions,
        handleTabChange,
        getCategoryTitle,
        isArrayType,
        formatSelectItems,
        isFieldInvalid
    }
}