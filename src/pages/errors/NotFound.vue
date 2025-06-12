<template>
  <error-view
    title="Страница не найдена"
    description="Был введён некорректный адрес или страница была удалена"
  ></error-view>
</template>

<script>
import ErrorView from '@/views/ErrorView.vue';
export default {
  components: {
    name: 'NotFound',
    ErrorView,
  },
};
</script>