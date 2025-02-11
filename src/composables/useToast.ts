// composables/useToast.ts
import { ref } from "vue";

export interface ToastOptions {
  message: string;
  type: "success" | "error" | "warning" | "info";
  duration?: number;
  position?:
    | "top-right"
    | "top-left"
    | "bottom-right"
    | "bottom-left"
    | "top-center"
    | "bottom-center";
}

interface Toast extends ToastOptions {
  id: number;
}

const toasts = ref<Toast[]>([]);
let toastId = 0;

export function useToast() {
  const showToast = (options: ToastOptions) => {
    const id = ++toastId;
    const toast: Toast = {
      id,
      message: options.message,
      type: options.type,
      duration: options.duration || 3000,
      position: options.position || "top-right",
    };

    toasts.value.push(toast);

    setTimeout(() => {
      removeToast(id);
    }, toast.duration);
  };

  const removeToast = (id: number) => {
    const index = toasts.value.findIndex((toast) => toast.id === id);
    if (index > -1) {
      toasts.value.splice(index, 1);
    }
  };

  return {
    toasts,
    showToast,
    removeToast,
  };
}
