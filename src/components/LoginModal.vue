<template>
    <div class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000]"
        @click.self="handleClose">
        <div class="w-full max-w-[400px] mx-4">
            <template v-if="!showConfirmation && !showNewPasswordForm">
                <form @submit.prevent="handleSubmit" class="bg-white p-8 rounded-lg shadow-md w-full relative">
                    <button type="button"
                        class="absolute top-4 right-4 text-2xl bg-transparent border-0 cursor-pointer text-gray-500"
                        @click="handleClose">
                        ×
                    </button>

                    <div class="text-center mt-8 mb-14">
                        <img src="@/assets/new-logo.png" alt="Atrevido Logo" class="max-w-[200px] h-auto mx-auto" />
                    </div>

                    <h1 class="text-xl font-semibold mb-4 text-center">{{ isRegistering ? 'Registro' : 'Iniciar Sesión'
                        }}</h1>

                    <div class="mb-4">
                        <label for="email" class="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input id="email" v-model="email" type="email" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                            :disabled="authStore.loading" />
                    </div>

                    <div class="mb-4">
                        <label for="password" class="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
                        <input id="password" v-model="password" type="password" required
                            class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                            minlength="8" :disabled="authStore.loading" />
                    </div>

                    <button type="submit" :disabled="authStore.loading"
                        class="w-full py-3 bg-gray-800 text-white border-0 rounded-md cursor-pointer disabled:bg-gray-400">
                        {{ authStore.loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión') }}
                    </button>

                    <p v-if="authStore.error" class="text-red-500 mt-4 text-center">
                        {{ authStore.error }}
                    </p>

                    <p class="text-center mt-4">
                        {{ isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
                        <a href="#" @click.prevent="toggleAuth" class="text-green-600 no-underline ml-2">
                            {{ isRegistering ? 'Inicia Sesión' : 'Regístrate' }}
                        </a>
                    </p>
                </form>
            </template>

            <form v-else-if="showConfirmation" @submit.prevent="handleConfirmation"
                class="bg-white p-8 rounded-lg shadow-md w-full relative">
                <button type="button"
                    class="absolute top-4 right-4 text-2xl bg-transparent border-0 cursor-pointer text-gray-500"
                    @click="handleClose">
                    ×
                </button>

                <div class="text-center mt-8 mb-14">
                    <img src="@/assets/new-logo.png" alt="Atrevido Logo" class="max-w-[200px] h-auto mx-auto" />
                </div>

                <h1 class="text-xl font-semibold mb-4 text-center">Confirmar Registro</h1>
                <p class="text-center mb-4 text-gray-600">
                    Se ha enviado un código de confirmación a tu email
                </p>

                <div class="mb-4">
                    <label for="code" class="block text-sm font-medium text-gray-700 mb-1">Código de
                        confirmación</label>
                    <input id="code" v-model="confirmationCode" type="text" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        :disabled="authStore.loading" />
                </div>

                <button type="submit" :disabled="authStore.loading"
                    class="w-full py-3 bg-gray-800 text-white border-0 rounded-md cursor-pointer disabled:bg-gray-400">
                    {{ authStore.loading ? 'Verificando...' : 'Confirmar Registro' }}
                </button>

                <p v-if="authStore.error" class="text-red-500 mt-4 text-center">
                    {{ authStore.error }}
                </p>
            </form>

            <form v-else-if="showNewPasswordForm" @submit.prevent="handleNewPassword"
                class="bg-white p-8 rounded-lg shadow-md w-full relative">
                <button type="button"
                    class="absolute top-4 right-4 text-2xl bg-transparent border-0 cursor-pointer text-gray-500"
                    @click="handleClose">
                    ×
                </button>

                <div class="text-center mt-8 mb-14">
                    <img src="@/assets/new-logo.png" alt="Logo" class="max-w-[200px] h-auto mx-auto" />
                </div>

                <h1 class="text-xl font-semibold mb-4 text-center">Cambiar Contraseña</h1>
                <p class="text-center mb-4 text-gray-600">
                    Por seguridad, debes establecer una nueva contraseña
                </p>

                <div class="mb-4">
                    <label for="newPassword" class="block text-sm font-medium text-gray-700 mb-1">Nueva
                        Contraseña</label>
                    <input id="newPassword" v-model="newPassword" type="password" required
                        class="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                        minlength="8" :disabled="authStore.loading" />
                </div>

                <button type="submit" :disabled="authStore.loading"
                    class="w-full py-3 bg-gray-800 text-white border-0 rounded-md cursor-pointer disabled:bg-gray-400">
                    {{ authStore.loading ? 'Actualizando...' : 'Cambiar Contraseña' }}
                </button>

                <p v-if="authStore.error" class="text-red-500 mt-4 text-center">
                    {{ authStore.error }}
                </p>
            </form>
        </div>
    </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue';
import { useAuthStore } from '@/stores/auth';
import { storeToRefs } from 'pinia';

const emit = defineEmits(['close']);
const authStore = useAuthStore();
const { isAuthenticated } = storeToRefs(authStore);

const showNewPasswordForm = ref(false);
const newPassword = ref('');
const tempCredentials = ref<{ email: string; tempPassword: string } | null>(null);
const email = ref('');
const password = ref('');
const confirmationCode = ref('');
const isRegistering = ref(false);
const showConfirmation = ref(false);

watch(isAuthenticated, (newValue) => {
    if (newValue) {
        handleClose();
    }
});

const resetForm = () => {
    email.value = '';
    password.value = '';
    confirmationCode.value = '';
    newPassword.value = '';
    tempCredentials.value = null;
    showNewPasswordForm.value = false;
    showConfirmation.value = false;
    isRegistering.value = false;
    authStore.error = null;
};

const handleClose = () => {
    resetForm();
    emit('close');
};

const handleNewPassword = async () => {
    if (!tempCredentials.value) return;

    try {
        const success = await authStore.completeNewPasswordChallenge(
            tempCredentials.value.email,
            tempCredentials.value.tempPassword,
            newPassword.value
        );

        if (success) {
            handleClose();
        }
    } catch (error) {
        console.error('Error al cambiar contraseña:', error);
    }
};

const handleSubmit = async () => {
    try {
        if (isRegistering.value) {
            const { isSignUpComplete, nextStep } = await authStore.register(email.value, password.value);
            if (!isSignUpComplete && nextStep?.signUpStep === 'CONFIRM_SIGN_UP') {
                showConfirmation.value = true;
            }
        } else {
            const result = await authStore.login(email.value, password.value);

            if (result?.requiresNewPassword) {
                tempCredentials.value = {
                    email: email.value,
                    tempPassword: password.value
                };
                showNewPasswordForm.value = true;
            }
        }
    } catch (error) {
        console.error('Error:', error);
    }
};

const handleConfirmation = async () => {
    try {
        const isConfirmed = await authStore.confirmSignUp(email.value, confirmationCode.value);
        if (isConfirmed) {
            const result = await authStore.login(email.value, password.value);
        }
    } catch (error) {
        console.error('Error during confirmation:', error);
    }
};

const toggleAuth = () => {
    isRegistering.value = !isRegistering.value;
    authStore.error = null;
};
</script>