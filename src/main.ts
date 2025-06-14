import Vue from 'vue';
import App from './App.vue';
import router from './router';
import vuetify from './plugins/vuetify';
import Notifications from 'vue-notification';
import { PiniaVuePlugin, createPinia } from 'pinia';


Vue.use(Notifications);
Vue.config.productionTip = false;

Vue.use(PiniaVuePlugin);
const pinia = createPinia();



new Vue({
  router,
  vuetify,
  pinia,
  render: h => h(App)
}).$mount('#app');