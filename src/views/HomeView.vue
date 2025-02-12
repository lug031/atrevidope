<template>
  <MainLayout>
    <ProductCarousel />
    <PromotionalBanner />
    <!-- Brands Carousel -->
    <BrandCarousel />
    <!-- Feature Cards -->
    <!-- <FeatureCards /> -->
  </MainLayout>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import MainLayout from '@/layouts/MainLayout.vue';
import BrandCarousel from '@/components/BrandCarousel.vue';
import FeatureCards from '@/components/FeatureCards.vue';
import ProductCarousel from '@/components/ProductCarousel.vue';
import PromotionalBanner from '@/components/PromotionalBanner.vue';

const router = useRouter();
</script>

<style scoped>
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