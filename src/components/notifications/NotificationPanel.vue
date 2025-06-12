<template>
  <notifications position="bottom right" width="20%">
    <template slot="body" slot-scope="{ item }">
      <div v-bind:class="`vue-notify vue-${item.type}`">
        <div class="text-h6">{{ item.title }}</div>
        <div v-html="item.text" />
      </div>
    </template>
  </notifications>
</template>

<script lang="ts">
import Vue from 'vue';
export default Vue.extend({
  name: 'NotificationPanel',
});
</script>

<style scoped>
.vue-notify {
  margin: 0 5px 5px;
  padding: 10px;
  font-size: 0.85rem;
  color: rgba(0, 0, 0, 0.7);
  background: #44a4fc;
  border-left: 5px solid #187fe7;
}
.vue-error {
  color: rgba(255, 255, 255, 0.9);
  background: #e54d42;
  border-left-color: #b82e24;
}
.vue-warn {
  background: #ffb648;
  border-left-color: #f48a06;
}
.vue-success {
  background: #68cd86;
  color: rgba(255, 255, 255, 0.9);
  border-left-color: #42a85f;
}
</style>