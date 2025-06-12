import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import ru from 'vuetify/src/locale/ru';

Vue.use(Vuetify);

export default new Vuetify({
  lang: {
    locales: { ru },
    current: 'ru'
  },
  theme: {
    themes: {
      light: {
        primary: '#232B34',
        secondary: '#ADB2BD',
        light: '#E9EEF4',
        accent: '#FF5C5C',
        error: '#f44336',
        warning: '#ff9800',
        info: '#1CB8AA',
        success: '#4caf50',
        chip: '#CADDF2',
        sunny: 'FEE984',
      },
    },
  }
});