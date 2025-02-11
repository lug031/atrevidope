<template>
  <div class="layout-container">
    <MainNavigation />
    <CategoriesMenu />
    <main class="main-content">
      <slot></slot>
    </main>
    <MainFooter />
  </div>
</template>

<script setup lang="ts">
import MainNavigation from '../components/MainNavigation.vue'
import MainFooter from '../components/MainFooter.vue'
import CategoriesMenu from '@/components/CategoriesMenu.vue'
</script>

<style scoped>
.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-content {
  flex: 1;
}
</style>