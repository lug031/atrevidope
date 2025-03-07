import { ref, onMounted, watchEffect } from "vue";

export function useTheme() {
  const isDarkMode = ref(false);

  const toggleTheme = () => {
    isDarkMode.value = !isDarkMode.value;
    localStorage.setItem("theme", isDarkMode.value ? "dark" : "light");
  };

  // Aplicar tema al DOM
  const applyTheme = () => {
    if (isDarkMode.value) {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  };

  onMounted(() => {
    // Verificar preferencia guardada
    const savedTheme = localStorage.getItem("theme");

    if (savedTheme) {
      // Usar preferencia guardada
      isDarkMode.value = savedTheme === "dark";
    } else {
      // Usar preferencia del sistema
      isDarkMode.value = window.matchMedia(
        "(prefers-color-scheme: dark)"
      ).matches;
    }

    applyTheme();

    // Escuchar cambios en preferencia del sistema
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (event) => {
        if (!localStorage.getItem("theme")) {
          isDarkMode.value = event.matches;
          applyTheme();
        }
      });
  });

  // Observar cambios en el estado
  watchEffect(() => {
    applyTheme();
  });

  return {
    isDarkMode,
    toggleTheme,
  };
}
