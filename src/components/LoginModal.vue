<template>
    <div class="modal-overlay" @click.self="handleClose">
        <div class="auth-container">
            <template v-if="!showConfirmation && !showNewPasswordForm">
                <form @submit.prevent="handleSubmit" class="auth-form">
                    <button type="button" class="close-button" @click="handleClose">
                        ×
                    </button>

                    <div class="logo-container">
                        <img src="@/assets/new-logo.png" alt="Atrevido Logo" class="auth-logo" />
                    </div>

                    <h1>{{ isRegistering ? 'Registro' : 'Iniciar Sesión' }}</h1>

                    <div class="form-group">
                        <label for="email">Email</label>
                        <input id="email" v-model="email" type="email" required class="form-input"
                            :disabled="authStore.loading" />
                    </div>

                    <div class="form-group">
                        <label for="password">Contraseña</label>
                        <input id="password" v-model="password" type="password" required class="form-input"
                            minlength="8" :disabled="authStore.loading" />
                    </div>

                    <button type="submit" :disabled="authStore.loading" class="auth-button">
                        {{ authStore.loading ? 'Cargando...' : (isRegistering ? 'Registrarse' : 'Iniciar Sesión') }}
                    </button>

                    <p v-if="authStore.error" class="error-message">
                        {{ authStore.error }}
                    </p>

                    <p class="toggle-auth">
                        {{ isRegistering ? '¿Ya tienes cuenta?' : '¿No tienes cuenta?' }}
                        <a href="#" @click.prevent="toggleAuth">
                            {{ isRegistering ? 'Inicia Sesión' : 'Regístrate' }}
                        </a>
                    </p>
                </form>
            </template>

            <form v-else-if="showConfirmation" @submit.prevent="handleConfirmation" class="auth-form">
                <button type="button" class="close-button" @click="handleClose">
                    ×
                </button>

                <div class="logo-container">
                    <img src="@/assets/new-logo.png" alt="Atrevido Logo" class="auth-logo" />
                </div>

                <h1>Confirmar Registro</h1>
                <p class="confirmation-message">
                    Se ha enviado un código de confirmación a tu email
                </p>

                <div class="form-group">
                    <label for="code">Código de confirmación</label>
                    <input id="code" v-model="confirmationCode" type="text" required class="form-input"
                        :disabled="authStore.loading" />
                </div>

                <button type="submit" :disabled="authStore.loading" class="auth-button">
                    {{ authStore.loading ? 'Verificando...' : 'Confirmar Registro' }}
                </button>

                <p v-if="authStore.error" class="error-message">
                    {{ authStore.error }}
                </p>
            </form>

            <form v-else-if="showNewPasswordForm" @submit.prevent="handleNewPassword" class="auth-form">
                <button type="button" class="close-button" @click="handleClose">
                    ×
                </button>

                <div class="logo-container">
                    <img src="@/assets/new-logo.png" alt="Logo" class="auth-logo" />
                </div>

                <h1>Cambiar Contraseña</h1>
                <p class="confirmation-message">
                    Por seguridad, debes establecer una nueva contraseña
                </p>

                <div class="form-group">
                    <label for="newPassword">Nueva Contraseña</label>
                    <input id="newPassword" v-model="newPassword" type="password" required class="form-input"
                        minlength="8" :disabled="authStore.loading" />
                </div>

                <button type="submit" :disabled="authStore.loading" class="auth-button">
                    {{ authStore.loading ? 'Actualizando...' : 'Cambiar Contraseña' }}
                </button>

                <p v-if="authStore.error" class="error-message">
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

<style scoped>
.modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1000;
}

.close-button {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    background: none;
    border: none;
    cursor: pointer;
    color: #666;
}

.auth-container {
    position: relative;
    width: 100%;
    max-width: 400px;
    margin: 1rem;
}

.auth-form {
    background-color: white;
    padding: 2rem;
    border-radius: 8px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    width: 100%;
}

.logo-container {
    text-align: center;
    margin-top: 2rem;
    margin-bottom: 3.5rem;
}

.auth-logo {
    max-width: 200px;
    height: auto;
}

.form-group {
    margin-bottom: 1rem;
}

.form-input {
    width: 100%;
    padding: 0.5rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    margin-top: 0.25rem;
}

.auth-button {
    width: 100%;
    padding: 0.75rem;
    background-color: #292929;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
}

.auth-button:disabled {
    background-color: #cccccc;
}

.error-message {
    color: red;
    margin-top: 1rem;
    text-align: center;
}

.toggle-auth {
    text-align: center;
    margin-top: 1rem;
}

.toggle-auth a {
    color: #4CAF50;
    text-decoration: none;
    margin-left: 0.5rem;
}

.confirmation-message {
    text-align: center;
    margin-bottom: 1rem;
    color: #666;
}

.divider {
    position: relative;
    text-align: center;
    margin: 1.5rem 0;
}

.divider::before {
    content: "";
    position: absolute;
    top: 50%;
    left: 0;
    right: 0;
    height: 1px;
    background: #e2e8f0;
}

.divider-text {
    position: relative;
    background: white;
    padding: 0 1rem;
    color: #718096;
    font-size: 0.875rem;
}
</style>