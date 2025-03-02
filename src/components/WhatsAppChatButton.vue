<!-- WhatsAppChatButton.vue (modificado) -->
<template>
    <div class="whatsapp-container">
        <!-- Botón de WhatsApp (visible siempre) -->
        <a class="whatsapp-button" @click.prevent="toggleChat" aria-label="Contactar por WhatsApp"
            @mouseenter="handleMouseEnter" @mouseleave="handleMouseLeave">
            <svg viewBox="0 0 24 24" :width="iconSize" :height="iconSize" fill="currentColor">
                <path
                    d="M17.498 14.382c-.301-.15-1.767-.867-2.04-.966-.273-.101-.473-.15-.673.15-.197.295-.771.964-.944 1.162-.175.195-.349.21-.646.075-.3-.15-1.263-.465-2.403-1.485-.888-.795-1.484-1.77-1.66-2.07-.174-.3-.019-.465.13-.615.136-.135.301-.345.451-.523.146-.181.194-.301.297-.496.1-.21.049-.375-.025-.524-.075-.15-.672-1.62-.922-2.206-.24-.584-.487-.51-.672-.51-.172-.015-.371-.015-.571-.015-.2 0-.523.074-.797.359-.273.3-1.045 1.02-1.045 2.475s1.07 2.865 1.219 3.075c.149.195 2.105 3.195 5.1 4.485.714.3 1.27.48 1.704.629.714.227 1.365.195 1.88.121.574-.091 1.767-.721 2.016-1.426.255-.705.255-1.29.18-1.425-.074-.135-.27-.21-.57-.345m-5.446 7.443h-.016c-1.77 0-3.524-.48-5.055-1.38l-.36-.214-3.75.975 1.005-3.645-.239-.375c-.99-1.576-1.516-3.391-1.516-5.26 0-5.445 4.455-9.885 9.942-9.885 2.654 0 5.145 1.035 7.021 2.91 1.875 1.859 2.909 4.35 2.909 6.99-.004 5.444-4.46 9.885-9.935 9.885M20.52 3.449C18.24 1.245 15.24 0 12.045 0 5.463 0 .104 5.334.101 11.893c0 2.096.549 4.14 1.595 5.945L0 24l6.335-1.652c1.746.943 3.71 1.444 5.71 1.447h.006c6.585 0 11.946-5.336 11.949-11.896 0-3.176-1.24-6.165-3.495-8.411" />
            </svg>
        </a>

        <!-- Ventana de chat (visible al hacer hover o según las condiciones configuradas) -->
        <div class="whatsapp-chat-window" :class="{ 'show-chat': showChat }">
            <!-- Encabezado del chat -->
            <div class="chat-header">
                <div class="chat-avatar">
                    <img v-if="agentAvatar" :src="agentAvatar" :alt="agentName" />
                    <div v-else class="default-avatar">
                        {{ agentInitials }}
                    </div>
                </div>
                <div class="chat-info">
                    <div class="chat-name">{{ agentName }}</div>
                    <div class="chat-status">{{ agentStatus }}</div>
                </div>
                <button class="chat-close" @click.prevent="hideChat" aria-label="Cerrar chat">
                    ×
                </button>
            </div>

            <!-- Cuerpo del chat -->
            <div class="chat-body">
                <!-- Mensaje predeterminado del agente -->
                <div class="chat-message agent-message">
                    <div class="message-bubble">
                        {{ welcomeMessage }}
                        <span v-if="showEmoji" class="message-emoji">🤗</span>
                    </div>
                    <div class="message-time">{{ currentTime }}</div>
                </div>

                <!-- Campo de entrada de mensaje -->
                <div class="chat-input-container">
                    <input type="text" class="chat-input" :placeholder="inputPlaceholder" v-model="userMessage"
                        @keyup.enter="sendMessage" />
                    <button class="send-button" @click="sendMessage" aria-label="Enviar mensaje">
                        <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor">
                            <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
                        </svg>
                    </button>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { setLocalStorage, getLocalStorage, isLocalStorageValid, removeLocalStorage } from '@/utils/localStorage';

// Propiedades del componente
const props = defineProps({
    phoneNumber: {
        type: String,
        default: '51934505566'
    },
    defaultMessage: {
        type: String,
        default: '¡Hola! Me gustaría saber más sobre sus productos.'
    },
    welcomeMessage: {
        type: String,
        default: 'Hola 👋 ¿Cómo podemos ayudarte?'
    },
    inputPlaceholder: {
        type: String,
        default: 'Escribe tu mensaje aquí...'
    },
    agentName: {
        type: String,
        default: 'Atrevido'
    },
    agentStatus: {
        type: String,
        default: 'Soporte'
    },
    agentAvatar: {
        type: String,
        default: '/atrevido_logo.png'
    },
    iconSize: {
        type: Number,
        default: 30
    },
    showEmoji: {
        type: Boolean,
        default: true
    },
    autoOpen: {
        type: Boolean,
        default: true
    },
    autoOpenDelay: {
        type: Number,
        default: 500
    },
    storageKey: {
        type: String,
        default: 'atrevido_whatsapp_shown'
    },
    hideDuration: {
        type: Number,
        default: 2 / 60 // Horas (2 minutos)
    },
    checkInterval: {
        type: Number,
        default: 10000 // Comprobar cada 10 segundos
    }
});

// Estados reactivos
const showChat = ref(false);
const userMessage = ref('');
let checkExpirationTimer: number | null = null;

// Valores computados
const currentTime = computed(() => {
    const now = new Date();
    return `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
});

const agentInitials = computed(() => {
    if (!props.agentName) return '';
    return props.agentName
        .split(' ')
        .map(word => word[0])
        .join('')
        .substring(0, 2)
        .toUpperCase();
});

// Preparar el enlace de WhatsApp
const whatsappLink = computed(() => {
    const message = encodeURIComponent(userMessage.value || props.defaultMessage);
    return `https://wa.me/${props.phoneNumber}?text=${message}`;
});

// Función para verificar si el chat se mostró recientemente
const wasChatShownRecently = (): boolean => {
    // Verificamos si existe una entrada válida en localStorage
    return isLocalStorageValid(props.storageKey);
};

// Comprobar regularmente si ha expirado el tiempo de ocultamiento
const checkExpiration = () => {
    if (!wasChatShownRecently() && !showChat.value) {
        showChat.value = true;
    }
};

// Métodos para manejo de eventos
const handleMouseEnter = () => {
    if (!wasChatShownRecently()) {
        showChat.value = true;
    }
};

const handleMouseLeave = () => {
    // No ocultar al salir para permitir interacción
};

// Alternar la visibilidad del chat al hacer clic en el botón
const toggleChat = () => {
    showChat.value = !showChat.value;
};

const hideChat = () => {
    showChat.value = false;

    // Guardar en localStorage con tiempo de expiración fijo
    // Primero eliminamos cualquier entrada anterior para evitar problemas de expiración acumulada
    removeLocalStorage(props.storageKey);
    setLocalStorage(props.storageKey, true, props.hideDuration);
};

const sendMessage = () => {
    // Abre WhatsApp con el mensaje escrito
    window.open(whatsappLink.value, '_blank');

    // Resetear el mensaje después de enviar
    userMessage.value = '';

    // Guardar que el usuario interactuó con el chat
    // Aseguramos tiempo de expiración exacto eliminando primero
    removeLocalStorage(props.storageKey);
    setLocalStorage(props.storageKey, true, props.hideDuration);

    // Ocultar el chat después de enviar
    showChat.value = false;
};

// Inicialización
onMounted(() => {
    // Verificar si el chat debe mostrarse automáticamente
    if (props.autoOpen && !wasChatShownRecently()) {
        setTimeout(() => {
            showChat.value = true;
        }, props.autoOpenDelay);
    }

    // Configurar el intervalo para comprobar periódicamente si ha expirado
    checkExpirationTimer = window.setInterval(checkExpiration, props.checkInterval);

    // También comprobamos cuando el documento vuelve a tener foco (cuando el usuario vuelve a la pestaña)
    window.addEventListener('focus', checkExpiration);
});

// Limpieza
onUnmounted(() => {
    if (checkExpirationTimer !== null) {
        clearInterval(checkExpirationTimer);
    }
    window.removeEventListener('focus', checkExpiration);
});
</script>

<style scoped>
/* Estilos para contenedor principal */
.whatsapp-container {
    position: fixed;
    bottom: 20px;
    right: 20px;
    z-index: 1000;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
}

/* Estilos para botón de WhatsApp */
.whatsapp-button {
    background-color: #25D366;
    color: white;
    border-radius: 50%;
    width: 60px;
    height: 60px;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);
    transition: all 0.3s ease;
    z-index: 2;
    position: relative;
    cursor: pointer;
}

.whatsapp-button:hover {
    transform: scale(1.1);
    background-color: #20ba5a;
}

/* Estilos para ventana de chat */
.whatsapp-chat-window {
    position: absolute;
    bottom: 80px;
    right: 0;
    width: 320px;
    background-color: #f0f0f0;
    border-radius: 10px;
    overflow: hidden;
    box-shadow: 0 5px 25px rgba(0, 0, 0, 0.2);
    transform: scale(0.9);
    opacity: 0;
    transform-origin: bottom right;
    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    pointer-events: none;
}

.whatsapp-chat-window.show-chat {
    transform: scale(1);
    opacity: 1;
    pointer-events: all;
}

/* Estilos para el encabezado */
.chat-header {
    display: flex;
    align-items: center;
    padding: 15px;
    background-color: #292929;
    color: white;
    position: relative;
}

.chat-avatar {
    width: 40px;
    height: 40px;
    border-radius: 50%;
    overflow: hidden;
    margin-right: 10px;
    background-color: rgba(255, 255, 255, 0.2);
    display: flex;
    align-items: center;
    justify-content: center;
}

.chat-avatar img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.default-avatar {
    font-weight: bold;
    font-size: 16px;
    color: white;
}

.chat-info {
    flex: 1;
}

.chat-name {
    font-weight: bold;
    font-size: 16px;
    margin-bottom: 2px;
}

.chat-status {
    font-size: 12px;
    opacity: 0.8;
}

.chat-close {
    background: none;
    border: none;
    color: white;
    font-size: 24px;
    cursor: pointer;
    width: 30px;
    height: 30px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: background-color 0.2s;
    border-radius: 50%;
}

.chat-close:hover {
    background-color: rgba(0, 0, 0, 0.1);
}

/* Estilos para el cuerpo del chat */
.chat-body {
    padding: 15px;
    min-height: 200px;
    max-height: 350px;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
}

/* Estilos para mensajes */
.chat-message {
    margin-bottom: 10px;
    max-width: 80%;
}

.agent-message {
    align-self: flex-start;
}

.user-message {
    align-self: flex-end;
    text-align: right;
}

.message-bubble {
    padding: 10px 15px;
    border-radius: 15px;
    display: inline-block;
    max-width: 100%;
    word-break: break-word;
}

.agent-message .message-bubble {
    background-color: white;
    border-top-left-radius: 2px;
}

.user-message .message-bubble {
    background-color: #dcf8c6;
    border-top-right-radius: 2px;
}

.message-time {
    font-size: 11px;
    opacity: 0.6;
    margin-top: 3px;
}

.message-emoji {
    margin-left: 5px;
}

/* Estilos para el área de entrada */
.chat-input-container {
    display: flex;
    background-color: white;
    border-radius: 20px;
    padding: 5px 10px;
    margin-top: 10px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.chat-input {
    flex: 1;
    border: none;
    outline: none;
    padding: 8px;
    font-size: 14px;
}

.send-button {
    background: none;
    border: none;
    color: #25D366;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 5px;
}

/* Responsive */
@media (max-width: 480px) {
    .whatsapp-chat-window {
        width: 280px;
        bottom: 70px;
    }

    .whatsapp-button {
        width: 50px;
        height: 50px;
    }

    .chat-avatar {
        width: 35px;
        height: 35px;
    }
}
</style>