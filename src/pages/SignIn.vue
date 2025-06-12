<template>
  <v-container>
    <v-overlay :value="overlay">
      <v-fade-transition>
        <template>
          <v-progress-circular
            indeterminate
            color="grey lighten-5"
          ></v-progress-circular>
        </template>
      </v-fade-transition>
    </v-overlay>
  </v-container>
</template>

<script>
import { eventBus } from '@/common/eventBus';
import container from '../inversify.config.ts';
const authService = container.get('AuthService');
export default ({
  data () {
    return {
      overlay: true
    }
  },
  mounted() {
    authService.userManager
        .signinRedirectCallback()
        .then((user) => {
          if (user && typeof (user.state) !== 'undefined' && user.state.returnUrl) {
            eventBus.$emit('loginSuccess');
            this.$router.push(user.state.returnUrl);
          } else if (user) {
            eventBus.$emit('loginSuccess');
            this.$router.push('/');
          }
          else{
            this.$router.push('/');
          }
        })
        .catch((e) => {
          console.error(e);
        })
        .finally(() => {
          this.overlay = false;
        });
  }
})
</script>