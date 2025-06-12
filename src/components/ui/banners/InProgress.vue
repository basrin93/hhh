<template>
  <div class="in-progress">
    <v-sheet class="content" elevation="0">
      <div class="header">
        <v-icon
            class="header__icon"
            icon="mdi-crane"
            size="32"
            color="primary"
        />
        <div class="header__text">
          <h2 class="text-h5 font-weight-bold">{{ tabName }}</h2>
          <span class="text-body-1 text-medium-emphasis">
            Раздел находится в разработке
          </span>
        </div>
      </div>

      <v-divider class="my-6" />

      <div class="loader">
        <alpha-loader />
      </div>

      <div class="info">
        <v-card
            class="info__card"
            elevation="0"
            border
        >
          <v-card-text>
            <div class="d-flex align-center mb-4">
              <v-icon
                  icon="mdi-information"
                  color="primary"
                  class="mr-2"
              />
              <span class="text-body-1 font-weight-medium">
                Информация
              </span>
            </div>
            <p class="text-body-2 text-medium-emphasis">
              Наша команда активно работает над этим разделом. Скоро здесь появится новый функционал, который поможет вам эффективнее управлять данными.
            </p>
          </v-card-text>
        </v-card>
      </div>
    </v-sheet>
  </div>
</template>

<script setup lang="ts">
import AlphaLoader from '@/components/ui/Loaders/AlphaLoader.vue'
</script>

<style lang="sass" scoped>
.in-progress
  @include flex-col
  height: 100%
  background-color: $alfa_friendly_white

  .content
    @include flex-col
    padding: 24px
    height: 100%
    gap: 24px

  .header
    @include flex(row, flex-start, center)
    gap: 16px

    &__icon
      padding: 12px
      border-radius: 8px
      background-color: rgba($alfa_friendly_red, 0.1)

    &__text
      @include flex-col
      gap: 4px

  .loader
    @include flex-center
    flex: 1
    width: 100%
    max-width: 768px
    margin: 0 auto

  .info
    width: 100%
    max-width: 768px
    margin: 0 auto

    &__card
      border-color: $alfa_friendly_background_light
      background-color: $alfa_friendly_background_ultra_light
</style>