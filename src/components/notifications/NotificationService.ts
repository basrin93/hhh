import Vue from 'vue';

export default {
  pushError(text: string, title?: string | null) {
    Vue.notify({
      type: 'error',
      title: title as string | undefined,
      text: text,
      duration: 5000,
    });
  },
  pushWarning(text: string, title?: string | null) {
    Vue.notify({
      type: 'warn',
      title: title as string | undefined,
      text: text,
      duration: 3000,
    });
  },
  pushSuccess(text: string, title?: string | null) {
    Vue.notify({
      type: 'success',
      title: title as string | undefined,
      text: text,
      duration: 2000,
    });
  },
};