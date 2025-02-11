<template>
  <MainLayout>
    <div class="promotional-products">
      <!-- Header Banner -->
      <router-link to="/promotions" class="promo-header">
        <div class="hero-banner" :style="{ backgroundImage: `url(${heroBannerUrl})` }">
          <h1>PROMOCIONES DEL MES</h1>
        </div>
      </router-link>

      <!-- Filter Section -->
      <div class="filter-section">
        <div class="filter-container">
          <label>Ordenar por:</label>
          <select v-model="sortBy" class="sort-select">
            <option value="position">Posición</option>
            <option value="price-asc">Precio: Menor a Mayor</option>
            <option value="price-desc">Precio: Mayor a Menor</option>
            <option value="name">Nombre</option>
          </select>
        </div>
      </div>

      <!-- Products Grid -->
      <div v-if="loading" class="loading-state">
        <span class="loader"></span>
      </div>

      <div v-else-if="error" class="error-state">
        Lo sentimos, ha ocurrido un error al cargar los productos.
      </div>

      <div v-else class="products-grid">
        <div v-for="product in sortedProducts" :key="product.id" class="product-card">
          <router-link :to="{ name: 'ProductDetail', params: { id: product.id } }" class="product-content">
            <div class="product-image">
              <img :src="product.imageUrl || '/api/placeholder/200/200'" :alt="product.name" />
            </div>
            <div class="product-info">
              <h3 class="brand-name">{{ product.brand }}</h3>
              <p class="product-name">{{ product.name }}</p>
              <p class="product-description">{{ product.description }}</p>
              <p class="product-price">S/{{ product.price.toFixed(2) }}</p>

              <!-- Stock Status -->
              <div class="stock-status" :class="{
                'out-of-stock': product.stock === 0,
                'low-stock': product.stock > 0 && product.stock <= 5
              }">
                <span v-if="product.stock === 0">Agotado</span>
                <span v-else-if="product.stock <= 5">¡Últimas {{ product.stock }} unidades!</span>
                <span v-else>Stock disponible</span>
              </div>
            </div>
          </router-link>

          <button @click.stop="addToCart(product)" class="add-to-cart" :class="{ 'disabled': product.stock === 0 }"
            :disabled="product.stock === 0">
            {{ product.stock === 0 ? 'AGOTADO' : 'AÑADIR AL CARRITO' }}
          </button>
        </div>
      </div>
    </div>
  </MainLayout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import MainLayout from '@/layouts/MainLayout.vue';
import { useProducts } from '@/composables/useProducts';
import { useCartStore } from '@/stores/cart';
import { useToast } from '../composables/useToast';
import type { Product } from '@/types/product.types';
import type { CartItem } from '@/types/cart.types';
import heroBannerImage from '../assets/hero-banner.jpeg';

const heroBannerUrl = ref(heroBannerImage);
const { products, loading, error, loadProductsWeb } = useProducts();
const cartStore = useCartStore();
const { showToast } = useToast();
const sortBy = ref('position');

const sortedProducts = computed(() => {
  if (!products.value) return [];

  return [...products.value].sort((a, b) => {
    switch (sortBy.value) {
      case 'price-asc':
        return a.price - b.price;
      case 'price-desc':
        return b.price - a.price;
      case 'name':
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  });
});

const addToCart = (product: Product) => {
  if (!product.stock) {
    showToast({
      type: 'error',
      message: 'Producto agotado'
    });
    return;
  }

  const cartItem: CartItem = {
    id: product.id,
    name: product.name,
    price: product.price,
    quantity: 1,
    imageUrl: product.imageUrl
  };

  cartStore.addItem(cartItem);

  showToast({
    type: 'success',
    message: 'Producto añadido'
  });
};

onMounted(() => {
  loadProductsWeb();
});
</script>

<style scoped>
.promotional-products {
  padding: 0 20px;
}

.promo-header {
  background-color: #ffffff22;
  color: white;
  padding: 40px 0;
  text-align: center;
  margin-bottom: 30px;
  text-decoration: none;
  display: block;
}

.promo-header h1 {
  font-size: 2.5rem;
  margin: 0;
  position: relative;
  z-index: 2;
}

.hero-banner {
  position: relative;
  width: 100%;
  height: 200px;
  background-size: cover;
  background-position: center center;
  background-repeat: no-repeat;
  display: flex;
  align-items: center;
  justify-content: center;
  text-decoration: none;
}

.hero-banner::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1;
}

/* Rest of the styles remain the same */
.filter-section {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 30px;
  padding: 0 20px;
}

.filter-container {
  display: flex;
  align-items: center;
  gap: 10px;
}

.sort-select {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

.products-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 30px;
  padding: 20px;
}

.product-card {
  background: white;
  border: 1px solid #eee;
  padding: 20px;
  text-align: center;
  transition: transform 0.2s;
}

.product-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0, 0, 0, 0.1);
}

.product-content {
  display: block;
  text-decoration: none;
  color: inherit;
  cursor: pointer;
}

.product-image {
  margin-bottom: 15px;
}

.product-image img {
  max-width: 100%;
  height: auto;
}

.brand-name {
  font-size: 0.9rem;
  color: #666;
  margin: 0;
}

.product-name {
  font-size: 1.1rem;
  margin: 5px 0;
}

.product-description {
  font-size: 0.9rem;
  color: #666;
  margin: 5px 0;
}

.product-price {
  font-size: 1.2rem;
  font-weight: bold;
  margin: 10px 0;
}

.stock-status {
  text-align: center;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 0.8rem;
  margin: 10px 0;
  background-color: #e8f5e9;
  color: #2e7d32;
}

.stock-status.low-stock {
  background-color: #fff3e0;
  color: #ef6c00;
}

.stock-status.out-of-stock {
  background-color: #ffebee;
  color: #c62828;
}

.add-to-cart {
  background-color: #000;
  color: white;
  border: none;
  padding: 10px 20px;
  width: 100%;
  cursor: pointer;
  transition: background-color 0.2s;
  margin-top: 10px;
}

.add-to-cart:hover {
  background-color: #333;
}

.add-to-cart.disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.add-to-cart.disabled:hover {
  background-color: #ccc;
}

.loading-state {
  text-align: center;
  padding: 50px;
}

.error-state {
  text-align: center;
  color: red;
  padding: 50px;
}

.loader {
  width: 48px;
  height: 48px;
  border: 5px solid #000;
  border-bottom-color: transparent;
  border-radius: 50%;
  display: inline-block;
  animation: rotation 1s linear infinite;
}

@keyframes rotation {
  0% {
    transform: rotate(0deg);
  }

  100% {
    transform: rotate(360deg);
  }
}
</style>