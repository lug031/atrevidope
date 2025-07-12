import { computed } from "vue";
import { useStoryStore } from "@/stores/story";
import { storeToRefs } from "pinia";
import type { Story } from "@/types/story.types";

export function useStories() {
  const storyStore = useStoryStore();
  const { stories, currentStory, loading, error } = storeToRefs(storyStore);

  const totalStories = computed(() => stories.value.length);

  const activeStories = computed(() =>
    stories.value.filter((story) => story.active)
  );

  const loadStories = async () => {
    await storyStore.fetchActiveStories();
  };

  const getStoryById = async (storyId: string) => {
    return await storyStore.getStoryById(storyId);
  };

  const viewStory = async (storyId: string, userEmail?: string) => {
    await storyStore.addStoryView(storyId, userEmail);
  };

  const likeStory = async (storyId: string, userEmail: string) => {
    await storyStore.toggleStoryLike(storyId, userEmail);
  };

  const wantStory = async (storyId: string, userEmail?: string) => {
    await storyStore.addStoryWant(storyId, userEmail);
  };

  const generateStoryLink = (storyId: string): string => {
    const baseUrl = window.location.origin;
    return `${baseUrl}/?story=${storyId}`;
  };

  const shareStory = async (story: Story) => {
    const shareData = {
      title: story.title,
      text: story.description,
      url: generateStoryLink(story.id),
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        // Fallback a copiar al clipboard
        await navigator.clipboard.writeText(shareData.url);
      }
    } else {
      // Fallback para navegadores que no soportan Web Share API
      await navigator.clipboard.writeText(shareData.url);
    }
  };

  return {
    stories,
    currentStory,
    loading,
    error,
    totalStories,
    activeStories,
    loadStories,
    getStoryById,
    viewStory,
    likeStory,
    wantStory,
    generateStoryLink,
    shareStory,
  };
}
