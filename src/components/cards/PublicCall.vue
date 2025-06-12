<template>
  <v-card width="400px" :loading="loading">
    <v-card-title>Публичное действие</v-card-title>
    <v-card-subtitle>
      Сегодня {{ fmt.fullDate(currentDate) }} ({{ fmt.shortDate(currentDate) }})
    </v-card-subtitle>
      <v-card-text>
        <v-text-field label="Запрос" v-model="request" :rules="[rules.required]"></v-text-field>
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
import validations from '@/common/validations.ts';
import { fullDate, shortDate } from '@/common/formatters.ts';
import container from '../../inversify.config';
const testService = container.get('TestApiService');
export default ({
  data () {
    return {
      loading: false,
      request: null,
      response: null,
      rules: validations,
      fmt: {
        fullDate: fullDate,
        shortDate: shortDate
      },
      currentDate: new Date()
    }
  },
  methods: {
    async test() {
      this.loading = true;
      try {
        this.response = await testService.message({ testRequest: this.request });
      } finally {
        this.loading = false;
      }
    }
  }
})
</script>