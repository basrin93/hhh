<template>
  <v-card outlined class="pa-5 access-restricted-card">
    <div class="text-center">
      <v-icon size="64" color="grey lighten-1" class="mb-4">mdi-lock-outline</v-icon>
      <h3 class="text-h5 font-weight-medium grey--text text--darken-2 mb-2">{{ title }}</h3>
      <p class="grey--text text--darken-1">{{ message }}</p>
    </div>
  </v-card>
</template>

<script setup lang="ts">
interface Props {
  title?: string;
  message?: string;
}

withDefaults(defineProps<Props>(), {
  title: 'Доступ ограничен',
  message: 'У вас нет прав для доступа к этому разделу. Для получения доступа обратитесь к руководителю.'
});
</script>

<style scoped>
.access-restricted-card {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
}
</style>