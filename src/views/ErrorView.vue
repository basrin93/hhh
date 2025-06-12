<template>
  <v-card
    class="justify-center align-center fill-height text-center error-container"
    tile
  >
    <v-card-title
      class="justify-center align-center text-center align-self-center error-card-title"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="64"
        height="64"
        viewBox="0 0 64 64"
        fill="none"
      >
        <path
          fill-rule="evenodd"
          clip-rule="evenodd"
          d="M46.4917 37.2361C46.23 36.5239 37.5063 12.7934 37.1318 11.7819C36.2494 9.38972 35.1934 7 31.8346 7C28.4772 7 27.383 9.42809 26.5333 11.7819C26.3191 12.3728 24.1752 18.2038 21.9933 24.1384C19.6908 30.4011 17.3459 36.7791 17.1814 37.2361C17.0883 37.4843 17.208 37.7795 17.469 37.877C17.5289 37.9001 17.8013 38.005 18.1914 38.1553C19.5535 38.6799 22.3512 39.7573 22.5581 39.8391C22.823 39.9434 23.0945 39.7836 23.1813 39.5471C23.2238 39.4323 23.7084 38.1028 24.2219 36.6942C24.7708 35.1883 25.3527 33.5919 25.4626 33.2927H38.4996C38.6243 33.6324 39.2556 35.6406 39.7749 37.2928C40.1409 38.4574 40.4514 39.4452 40.4897 39.5471C40.582 39.7935 40.8642 39.9325 41.115 39.8391C41.2532 39.7872 42.7019 39.2285 44.0215 38.7196C45.0881 38.3083 46.0703 37.9295 46.2082 37.877C46.5162 37.7606 46.5644 37.4324 46.4917 37.2361ZM16 55.5455V50.4793C16 50.2273 16.2211 50.0244 16.4948 50.0244H47.5087C47.7805 50.0244 48 50.2273 48 50.4793V55.5455C48 55.7979 47.7805 56 47.5087 56H16.4948C16.2211 56 16 55.7979 16 55.5455ZM27.4378 27.7855H36.2494L31.8633 14.7496H31.8087L27.4378 27.7855Z"
          fill="#CCCCCC"
        />
      </svg>
    </v-card-title>
    <v-card-title
      class="justify-center align-center text-center align-self-center font-weight-black"
    >
      {{ title }}
    </v-card-title>
    <v-card-subtitle>
      {{ description }}
    </v-card-subtitle>
    <v-card-actions
      class="justify-center align-center text-center align-self-center"
    >
      <v-btn v-if="!disableButton && reload" @click="reloadPage" tile outlined>
        Перезагрузить
      </v-btn>
      <v-btn v-else-if="!disableButton" to="/" tile outlined>
        Вернуться на главную
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
export default {
  name: 'ErrorView',
  props: {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    reload: {
      type: Boolean,
      required: false,
      default: false,
    },
    disableButton: {
      type: Boolean,
      required: false,
      default: false,
    },
  },
  methods: {
    reloadPage() {
      window.location.reload();
    },
  },
};
</script>

<style scoped>
.error-container {
  height: calc(100vh - 100px);
  width: 100vw;
}
.error-card-title {
  padding-top: calc(50vh - 180px);
}
</style>