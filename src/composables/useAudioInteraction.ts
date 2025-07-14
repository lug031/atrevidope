import { readonly, ref } from "vue";

const hasUserInteracted = ref(false);
const isInitialized = ref(false);

export const useAudioInteraction = () => {
  const initializeAudioState = () => {
    if (isInitialized.value) return;

    const savedInteraction = sessionStorage.getItem(
      "audio-interaction-enabled"
    );
    hasUserInteracted.value = savedInteraction === "true";
    isInitialized.value = true;
  };

  const setUserInteracted = () => {
    hasUserInteracted.value = true;
    sessionStorage.setItem("audio-interaction-enabled", "true");
  };

  const needsAudioInteraction = () => {
    return !hasUserInteracted.value;
  };

  const resetInteraction = () => {
    hasUserInteracted.value = false;
    sessionStorage.removeItem("audio-interaction-enabled");
  };

  return {
    hasUserInteracted: readonly(hasUserInteracted),
    initializeAudioState,
    setUserInteracted,
    needsAudioInteraction,
    resetInteraction,
  };
};
