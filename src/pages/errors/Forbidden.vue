<template>
  <error-view
    title="Страница недоступна"
    description="Не хватает прав для просмотра данной страницы"
    disable-button
  ></error-view>
</template>

<script>
import ErrorView from '@/views/ErrorView.vue';
export default {
  name: 'Forbidden',
  components: {
    ErrorView,
  },
};
</script>