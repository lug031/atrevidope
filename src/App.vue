<script setup lang="ts">
import { RouterView } from 'vue-router';
import Toast from './components/common/Toast.vue';
import MaintenanceBanner from '@/components/MaintenanceBanner.vue';
import { useMaintenance } from '@/composables/useMaintenance';
import { useStoryScheduler } from '@/composables/useStoryScheduler'; // NUEVO
import { ref } from 'vue';

const { isMaintenanceMode } = useMaintenance();
const isBannerVisible = ref(true);

// NUEVO: Inicializar scheduler automáticamente
useStoryScheduler();

const handleBannerVisibility = (isVisible: boolean) => {
  isBannerVisible.value = isVisible;
};
</script>

<template>
  <div class="app-container" :class="{ 'has-maintenance-banner': isMaintenanceMode && isBannerVisible }">
    <MaintenanceBanner v-if="isMaintenanceMode" @banner-visibility-change="handleBannerVisibility" :persistent="true"
      type="warning" title="Sitio en Mantenimiento"
      description="Estamos realizando mejoras. Algunas funciones podrían no estar disponibles." />
    <Toast />
    <RouterView />
  </div>
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

.app-container {
  width: 100%;
  min-height: 100vh;
  overflow-x: hidden;
  position: relative;
}

/* Ajuste del espaciado cuando el banner está presente */
.has-maintenance-banner {
  padding-top: 76px;
}

@media (max-width: 640px) {
  .has-maintenance-banner {
    padding-top: 120px;
  }
}

/* Asegura que el banner no tape elementos fixed/sticky */
.has-maintenance-banner .fixed,
.has-maintenance-banner .sticky {
  top: 76px;
}

@media (max-width: 640px) {

  .has-maintenance-banner .fixed,
  .has-maintenance-banner .sticky {
    top: 120px;
  }
}
</style>