<template>
  <div class="layout-container">
    <MainNavigation />
    <!-- <CategoriesMenu /> -->
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
  padding-top: 72px;
  /* Altura del MainNavigation */
}

.main-content {
  flex: 1;
}

:deep(.categories-menu) {
  position: sticky;
  top: 72px;
  /* Debe ser igual al padding-top del layout-container */
  z-index: 900;
  /* Menor que MainNavigation pero mayor que el contenido normal */
  background-color: white;
  width: 100%;
}

/* Ajustes para móvil */
@media (max-width: 768px) {
  .layout-container {
    padding-top: 64px;
    /* Altura reducida para móvil */
  }

  :deep(.categories-menu) {
    top: 64px;
  }
}
</style>