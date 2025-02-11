<!-- Breadcrumbs.vue -->
<template>
    <nav aria-label="Breadcrumb" class="breadcrumbs">
        <ol class="breadcrumb-list">
            <li v-for="(item, index) in items" :key="index" class="breadcrumb-item">
                <template v-if="index === items.length - 1">
                    <span class="current-page">{{ item.text }}</span>
                </template>
                <template v-else>
                    <router-link :to="item.to" class="breadcrumb-link">
                        {{ item.text }}
                    </router-link>
                    <ChevronRightIcon :size="16" class="breadcrumb-separator" />
                </template>
            </li>
        </ol>
    </nav>
</template>

<script setup lang="ts">
import { ChevronRightIcon } from 'lucide-vue-next'

interface BreadcrumbItem {
    text: string
    to: string
}

defineProps<{
    items: BreadcrumbItem[]
}>()
</script>

<style scoped>
.breadcrumbs {
    margin-bottom: 1rem;
}

.breadcrumb-list {
    display: flex;
    align-items: center;
    list-style: none;
    padding: 0;
    margin: 0;
}

.breadcrumb-item {
    display: flex;
    align-items: center;
    color: #666;
    font-size: 0.875rem;
}

.breadcrumb-link {
    color: #666;
    text-decoration: none;
    transition: color 0.2s;
}

.breadcrumb-link:hover {
    color: #000;
}

.current-page {
    color: #000;
    font-weight: 500;
}

.breadcrumb-separator {
    margin: 0 0.5rem;
    color: #666;
}
</style>