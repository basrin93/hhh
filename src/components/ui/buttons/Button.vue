<template>
  <v-btn
      class="ml-3"
      outlined
      :loading="loading"
      :class="{ 'has-filters': badge }"
      @click="$emit('click')"
  >
    <v-icon left>{{ icon }}</v-icon>
    {{ label }}
    <div v-if="badge" class="filter-badge">
      {{ badge }}
    </div>
  </v-btn>
</template>

<script lang="ts">
import { defineComponent } from "vue";

export default defineComponent({
  name: "Button",
  props: {
    label: {
      type: String,
      default: "Кнопка",
    },
    icon: {
      type: String,
      default: "",
    },
    loading: {
      type: Boolean,
      default: false
    },
    badge: {
      type: Number,
      default: undefined
    }
  },
});
</script>

<style lang="sass" scoped>
.v-btn
  position: relative

  .filter-badge
    position: absolute
    top: -10px
    right: -19px
    background-color: $alfa_friendly_red
    color: $alfa_friendly_white
    border-radius: 50%
    min-width: 20px
    height: 20px
    display: flex
    align-items: center
    justify-content: center
    font-size: 12px
    font-weight: bold

  &.has-filters
    background-color: $alfa_friendly_light_blue !important
    border-color: $alfa_friendly_light_blue !important
    color: $alfa_primary-blue !important

    .v-icon
      color: $alfa_primary-blue !important
</style>