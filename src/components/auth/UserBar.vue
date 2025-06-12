<template>
  <div style="max-width: 350px">
    <v-list-item dense>
      <v-list-item-avatar>
        <img v-if="loggedIn && userPhoto" :src="userPhoto" loading="lazy" alt="" />
        <v-icon v-else size="26">mdi-account-circle-outline</v-icon>
      </v-list-item-avatar>
      <v-list-item-content v-if="loading" class="user-bar">
        <v-progress-linear indeterminate color="accent primary"></v-progress-linear>
      </v-list-item-content>
      <v-list-item-content v-else class="user-bar">
        <v-list-item-title>
          {{ userName }}
        </v-list-item-title>
        <v-list-item-subtitle>
          {{ userPosition }}
        </v-list-item-subtitle>
      </v-list-item-content>
      <v-btn text small rounded @click.prevent="authAction()">
        <v-icon small>
          {{ this.loggedIn ? 'mdi-logout' : 'mdi-login' }}
        </v-icon>
      </v-btn>
    </v-list-item>
  </div>
</template>

<script>
import { eventBus } from '@/common/eventBus';
import container from '@/inversify.config';
import notifier from '@/components/notifications/NotificationService';
const authService = container.get("AuthService");
export default {
  name: "UserBar",
  data() {
    return {
      user: {},
      userInfo: {},
      userPhoto : null,
      loggedIn: false,
      loading: true,
    };
  },
  created() {
    eventBus.$on('loginSuccess', () => {
      this.fetchData();
    });
  },
  async mounted() {
    await this.fetchData();
  },
  methods: {
    async authAction() {
      this.loggedIn ? await authService.logout() : await authService.login();
    },
    async fetchData() {
      this.loading = true;
      try {
        this.user = await authService.getUser();
        if (this.user?.profile?.employee_uid) {
          this.userInfo = await authService.getUserInfo();
          this.userPhoto = this.userInfo?.info?.photo?.link;
        }
        this.loggedIn = this.user !== null;
      } catch (error) {
        console.error(error);
        notifier.pushError(error);
      } finally {
        this.loading = false;
      }
    },
    buildName(info) {
      return `${info?.lastName} ${info?.firstName.substring(0, 1)}. ${info?.middleName.substring(0, 1)}.`;
    },
  },
  computed: {
    userName() {
      if (this.loggedIn) {
        if (this.user?.profile?.employee_uid) {
          return this.buildName(this.userInfo?.info);
        } else if (this.user?.profile) {
          return this.user.profile.name;
        }
      }
      return 'Неизвестный пользователь';
    },
    userPosition() {
      return this.loggedIn ? this.user.profile.title : 'Требуется авторизация';
    },
  },
}
</script>