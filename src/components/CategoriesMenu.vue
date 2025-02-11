<template>
  <div class="categories-menu">
    <ul class="menu-list" v-if="!loading && !error">
      <li v-for="category in activeCategories" :key="category.id">
        <a href="#">
          {{ category.name }}
        </a>
      </li>
    </ul>
    <div v-else-if="loading" class="loading">
      <div class="loading-animation">
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
        <span class="loading-dot"></span>
      </div>
    </div>
    <div v-else-if="error" class="error">
      Lo sentimos, no pudimos cargar nuestro catálogo
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted } from 'vue';
import { useCategories } from '@/composables/useCategories';
import type { Category } from '@/types/category.types';

const { categories, loading, error, loadCategories } = useCategories();

const activeCategories = computed(() => {
  return categories.value
    .filter(category => category.active)
    .sort((a, b) => a.name.localeCompare(b.name));
});

onMounted(async () => {
  await loadCategories();
});
</script>

<style scoped>
.categories-menu {
  background-color: #000;
  padding: 1rem 0;
}

.menu-list {
  display: flex;
  justify-content: center;
  list-style: none;
  gap: 2rem;
  margin: 0;
  padding: 0;
}

.menu-list a {
  color: white;
  text-decoration: none;
  font-size: 14px;
}

.loading {
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.loading-animation {
  display: flex;
  gap: 0.5rem;
}

.loading-dot {
  width: 8px;
  height: 8px;
  background-color: #fff;
  border-radius: 50%;
  display: inline-block;
  animation: fade 1.5s infinite ease-in-out;
}

.loading-dot:nth-child(2) {
  animation-delay: 0.5s;
}

.loading-dot:nth-child(3) {
  animation-delay: 1s;
}

.error {
  color: #ff9999;
  text-align: center;
  font-style: italic;
}

@keyframes fade {

  0%,
  100% {
    opacity: 0.3;
  }

  50% {
    opacity: 1;
  }
}
</style>