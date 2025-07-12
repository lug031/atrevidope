<template>
  <MainLayout>
    <ProductCarousel />
    <PromotionalBanner />
    <BrandCarousel />

    <!-- Botón flotante para historias -->
    <StoriesFloatingButton @click="openStoriesModal" />

    <!-- Overlay invisible para cerrar el modal (debe ir ANTES del modal) -->
    <div v-if="isStoriesModalOpen" class="fixed inset-0 z-[1400]" @click="closeStoriesModal">
    </div>

    <!-- Modal de historias -->
    <StoriesModal v-if="isStoriesModalOpen" @close="closeStoriesModal" />
  </MainLayout>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useStoriesModal } from '@/composables/useStoriesModal'
import MainLayout from '@/layouts/MainLayout.vue'
import BrandCarousel from '@/components/BrandCarousel.vue'
import ProductCarousel from '@/components/ProductCarousel.vue'
import PromotionalBanner from '@/components/PromotionalBanner.vue'
import StoriesFloatingButton from '@/components/StoriesFloatingButton.vue'
import StoriesModal from '@/components/StoriesModal.vue'

const route = useRoute()
const { isStoriesModalOpen, openStoriesModal, closeStoriesModal } = useStoriesModal()

onMounted(() => {
  if (route.query.story) {
    openStoriesModal()
  }
})
</script>

<style scoped>
/* Estilos existentes */
.hero-banner {
  height: 500px;
  background: linear-gradient(to right, #ffe6e6, #fff);
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.banner-content {
  text-align: center;
}

.banner-content h1 {
  font-size: 4rem;
  font-family: serif;
  margin-bottom: 2rem;
}

.discover-button {
  background-color: #000;
  color: white;
  padding: 12px 24px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s ease;
}

.discover-button:hover {
  background-color: #333;
  transform: translateY(-2px);
}
</style>