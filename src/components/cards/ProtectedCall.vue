<template>
  <v-card width="400px" :loading="loading">
    <v-card-title>Защищённое действие</v-card-title>
      <v-card-text>
        <v-text-field label="Имя" v-model="request.first_name"></v-text-field>
        <v-text-field label="Фамилия" v-model="request.last_name"></v-text-field>
        <v-text-field label="Почта" v-model="request.email"></v-text-field>
        Ответ сервера:
        <br>
        <b>{{ response }}</b>
      </v-card-text>
    <v-card-actions >
      <v-spacer></v-spacer>
      <v-btn
        color="green"
        @click="test"
        :disabled="!request"
        :dark="!!request"
      >
        Вызвать
      </v-btn>
    </v-card-actions>
  </v-card>
</template>

<script>
import container from '../../inversify.config';
const testService = container.get('TestApiService');
export default ({
  data () {
    return {
      loading: false,
      request: {
        first_name: "Иван",
        last_name: "Иванов",
        email: "ivanov@i.com",
        address: {
          city: "Тест",
          street: "Тестовая",
          building: "1"
        },
        age: 20,
      },
      response: null
    }
  },
  methods: {
    async test() {
      this.loading = true;
      try {
        this.response = await testService.sample({ body: this.request });
      } finally {
        this.loading = false;
      }
    }
  }
})
</script>