<template>
  <div class="profile-block" :class="{ 'profile-block--collapsed': isCollapsed }">
    <v-tooltip
        :disabled="!isCollapsed"
        right
    >
      <template #activator="{ on, attrs }">
        <div class="image-wrapper" v-bind="attrs" v-on="on">
          <v-img
              :src="image"
              :width="isCollapsed ? 50 : 220"
              :height="isCollapsed ? 50 : 150"
              cover
              class="image-container"
          >
            <template v-slot:placeholder>
              <div class="image-placeholder">
                <v-icon
                    :size="isCollapsed ? 30 : 50"
                    color="grey-lighten-1"
                    class="placeholder-icon"
                >
                  mdi-image
                </v-icon>
              </div>
            </template>
          </v-img>
        </div>
      </template>

      <div class="tooltip-content">
        <h3 class="tooltip-title">{{ title }}</h3>
        <div class="tooltip-lot">Договор лизинга:{{ lot }}</div>
        <div class="tooltip-price">{{ price }}</div>
        <div class="tooltip-details">
          <div class="tooltip-detail-item">
            <span class="tooltip-detail-label">VIN:</span>
            <span class="tooltip-detail-value">{{ vin }}</span>
          </div>
          <div class="tooltip-detail-item">
            <span class="tooltip-detail-label">Гос.номер:</span>
            <span class="tooltip-detail-value">{{ gos_number }}</span>
          </div>
          <div class="tooltip-detail-item">
            <span class="tooltip-detail-label">Местоположение:</span>
            <span class="tooltip-detail-value">{{ location }}</span>
          </div>
        </div>
      </div>
    </v-tooltip>

    <div class="profile-info" v-show="!isCollapsed">
      <div class="main-info">
        <h3 class="profile-title">{{ title }}</h3>
      </div>

      <div class="profile-details">
        <div class="detail-row">
          <span class="detail-label">Договор лизинга:</span>
          <span class="detail-value">{{ lot }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">VIN:</span>
          <span class="detail-value">{{ vin }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Гос.номер:</span>
          <span class="detail-value">{{ gos_number }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">Местоположение:</span>
          <span class="detail-value">{{ location }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface ProfileCardProps {
  image: string
  title: string
  lot: string
  price: string
  vin: string
  gos_number: string
  isCollapsed: boolean
  location: string
}

defineProps<ProfileCardProps>()
</script>

<style lang="sass" scoped>
// Миксин для градиентного фона
@mixin subtle-gradient($color)
  background: linear-gradient(to right, $color 0%, transparent 3%)

.profile-block
  background-color: $alfa_friendly_white
  padding: 16px
  position: relative
  overflow: hidden

  &--collapsed
    padding: 0

.image-wrapper
  @include flex-center
  margin-bottom: 12px
  cursor: pointer

  .profile-block--collapsed &
    margin-bottom: 0

.image-container
  border-radius: 4px
  overflow: hidden
  background-color: $alfa_friendly_background_light

.image-placeholder
  @include flex-center
  width: 100%
  height: 100%

.placeholder-icon
  opacity: 0.5

.profile-info
  @include flex-col
  gap: 8px

.main-info
  @include flex-col
  gap: 2px

.profile-title
  font-size: 16px
  font-weight: 500
  color: $alfa_friendly_background_hard
  margin: 0
  line-height: 1.2

.profile-details
  @include flex-col
  gap: 12px
  margin-top: 4px

.detail-row
  display: flex
  flex-direction: column
  border-left: 2px solid $alfa_friendly_background_hard
  padding-left: 8px
  max-width: 100%

  .detail-label
    text-transform: uppercase
    font-size: 11px
    letter-spacing: 0.5px
    color: $alfa_friendly_background_hard
    min-width: auto
    font-weight: 600
    background: #E9EEF4

  .detail-value
    color: $alfa_friendly_background_hard
    font-size: 15px
    font-weight: 600
    word-break: break-word
    overflow-wrap: break-word

.tooltip-content
  max-width: 300px

.tooltip-title
  font-size: 14px
  font-weight: 500
  margin-bottom: 8px

.tooltip-lot, .tooltip-price
  font-size: 13px
  margin-bottom: 6px

.tooltip-details
  margin-top: 10px

.tooltip-detail-item
  margin-bottom: 6px

.tooltip-detail-label
  font-size: 12px
  font-weight: 500
  margin-right: 4px

.tooltip-detail-value
  font-size: 12px
  word-break: break-word
  overflow-wrap: break-word
  max-width: 200px
</style>