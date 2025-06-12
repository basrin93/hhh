<template>
  <div class="not-found">
    <v-sheet class="content" elevation="0">
    <InProgress/>
          <v-btn
              color="primary"
              variant="flat"
              :to="{ path: '/stock' }"
          >
            Перейти в сток
          </v-btn>

    </v-sheet>
  </div>
</template>

<script setup lang="ts">

import InProgress from "../components/ui/banners/InProgress.vue";
</script>

<style lang="sass" scoped>
.v-btn
  display: block
  width: 30%
  margin: 0 auto
</style>