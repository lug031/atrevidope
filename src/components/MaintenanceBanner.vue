<template>
    <Transition name="fade">
        <div v-if="showBanner && isMaintenanceMode" :class="['maintenance-banner', type]">
            <div class="banner-content">
                <div class="icon-container">
                    <AlertCircleIcon v-if="type === 'warning'" :size="24" />
                    <WrenchIcon v-else :size="24" />
                </div>
                <div class="message-container">
                    <p class="title">{{ title }}</p>
                    <p class="description">{{ description }}</p>
                    <!-- <div v-if="showTimeInfo" class="time-info">
                        <span>{{ getTimeRemainingText() }}</span>
                    </div>-->
                </div>
                <button v-if="dismissible" @click="dismiss" class="dismiss-button" aria-label="Cerrar mensaje">
                    <XIcon :size="20" />
                </button>
            </div>
        </div>
    </Transition>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { AlertCircleIcon, WrenchIcon, XIcon } from 'lucide-vue-next';
import { useMaintenance } from '@/composables/useMaintenance';

const { isMaintenanceMode, getMaintenanceInfo } = useMaintenance();

const props = withDefaults(defineProps<{
    type?: 'warning' | 'info';
    title?: string;
    description?: string;
    dismissible?: boolean;
    persistent?: boolean;
    showTimeInfo?: boolean;
}>(), {
    type: 'warning',
    title: 'Sitio en Mantenimiento',
    description: 'Estamos realizando mejoras. Algunas funciones podrían no estar disponibles temporalmente.',
    dismissible: true,
    persistent: false,
    showTimeInfo: true
});

const showBanner = ref(true);

const emit = defineEmits<{
    'banner-visibility-change': [isVisible: boolean]
}>();

const dismiss = () => {
    showBanner.value = false;
    emit('banner-visibility-change', false);
    if (!props.persistent) {
        localStorage.setItem('maintenanceBannerDismissed', 'true');
    }
};

const getTimeRemainingText = () => {
    const { endDate } = getMaintenanceInfo();
    const now = new Date();
    const timeDiff = endDate.getTime() - now.getTime();

    if (timeDiff <= 0) return 'Finalizando mantenimiento...';

    const hours = Math.floor(timeDiff / (1000 * 60 * 60));
    const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));

    if (hours > 24) {
        const days = Math.floor(hours / 24);
        return `Tiempo estimado: ${days} ${days === 1 ? 'día' : 'días'}`;
    }

    if (hours > 0) {
        return `Tiempo estimado: ${hours}h ${minutes}m`;
    }

    return `Tiempo estimado: ${minutes} minutos`;
};

onMounted(() => {
    if (!props.persistent) {
        const isDismissed = localStorage.getItem('maintenanceBannerDismissed');
        showBanner.value = !isDismissed;
        emit('banner-visibility-change', !isDismissed);
    }
});
</script>

<style scoped>
.maintenance-banner {
    width: 100%;
    padding: 1rem;
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 50;
    border-bottom-width: 1px;
}

.maintenance-banner.warning {
    background-color: #fef2f2;
    border-bottom-color: #fee2e2;
}

.maintenance-banner.info {
    background-color: #eff6ff;
    border-bottom-color: #dbeafe;
}

.banner-content {
    max-width: 1280px;
    margin: 0 auto;
    display: flex;
    align-items: center;
    gap: 1rem;
    position: relative;
}

.icon-container {
    flex-shrink: 0;
}

.warning .icon-container {
    color: #dc2626;
}

.info .icon-container {
    color: #2563eb;
}

.message-container {
    flex: 1;
    min-width: 0;
}

.title {
    margin: 0;
    font-weight: 600;
    font-size: 1rem;
    color: #1f2937;
}

.warning .title {
    color: #991b1b;
}

.info .title {
    color: #1e40af;
}

.description {
    margin: 0.25rem 0 0;
    font-size: 0.875rem;
    color: #4b5563;
}

.time-info {
    margin-top: 0.25rem;
    font-size: 0.75rem;
    color: #6b7280;
    font-weight: 500;
}

.warning .time-info {
    color: #9b1c1c;
}

.info .time-info {
    color: #1e40af;
}

.dismiss-button {
    padding: 0.5rem;
    border-radius: 0.375rem;
    border: none;
    background: transparent;
    color: #6b7280;
    cursor: pointer;
    transition: all 0.2s ease;
    flex-shrink: 0;
    display: flex;
    align-items: center;
    justify-content: center;
}

.dismiss-button:hover {
    background-color: rgba(0, 0, 0, 0.05);
    color: #1f2937;
}

.warning .dismiss-button:hover {
    background-color: #fee2e2;
    color: #991b1b;
}

.info .dismiss-button:hover {
    background-color: #dbeafe;
    color: #1e40af;
}

.fade-enter-active,
.fade-leave-active {
    transition: all 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
    transform: translateY(-100%);
    opacity: 0;
}

@media (max-width: 640px) {
    .maintenance-banner {
        padding: 0.75rem;
    }

    .banner-content {
        flex-direction: column;
        text-align: center;
    }

    .icon-container {
        margin-bottom: 0.5rem;
    }

    .dismiss-button {
        position: absolute;
        top: -0.5rem;
        right: -0.5rem;
    }

    .time-info {
        margin-top: 0.5rem;
    }
}
</style>