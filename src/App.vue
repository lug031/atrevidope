<script setup lang="ts">
import { RouterView } from 'vue-router';
import Toast from './components/common/Toast.vue';
</script>

<template>
  <Toast />
  <RouterView />
</template>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body,
html {
  margin: 0;
  padding: 0;
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}

#app {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
}
</style>