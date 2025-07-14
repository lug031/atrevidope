import { ref, readonly } from "vue";

const isStoriesModalOpen = ref(false);

export const useStoriesModal = () => {
  const openStoriesModal = () => {
    isStoriesModalOpen.value = true;
  };

  const closeStoriesModal = () => {
    isStoriesModalOpen.value = false;
  };

  const openStoriesModalWithStory = (storyId?: string) => {
    isStoriesModalOpen.value = true;
  };

  return {
    isStoriesModalOpen: readonly(isStoriesModalOpen),
    openStoriesModal,
    closeStoriesModal,
    openStoriesModalWithStory,
  };
};
