// useStoryImageCache.ts
import { ref } from "vue";
import { getUrl } from "aws-amplify/storage";

interface StoryImageCache {
  url: string;
  timestamp: number;
  imageUrl: string;
}

export function useStoryImageCache(cacheDuration = 30 * 60 * 1000) {
  // 30 minutos
  const storyImageCache = ref<Record<string, string>>({});
  const memoryCache = ref<Record<string, StoryImageCache>>({});

  const getStoryImageUrl = async (
    storyId: string,
    imageUrl: string
  ): Promise<string> => {
    const cached = memoryCache.value[storyId];
    if (cached) {
      const now = Date.now();
      if (
        now - cached.timestamp < cacheDuration &&
        cached.imageUrl === imageUrl
      ) {
        storyImageCache.value[storyId] = cached.url;
        return cached.url;
      }
    }

    try {
      const { url } = await getUrl({ path: imageUrl });
      const urlString = url.toString();

      storyImageCache.value[storyId] = urlString;
      memoryCache.value[storyId] = {
        url: urlString,
        timestamp: Date.now(),
        imageUrl: imageUrl,
      };

      return urlString;
    } catch (error) {
      console.error(`Error loading story image for ${storyId}:`, error);
      return "/api/placeholder/100/100";
    }
  };

  // Precargar todas las stories en paralelo
  const preloadStoryImages = async (
    stories: Array<{ id: string; imageUrl?: string; audioUrl?: string }>
  ) => {
    const imagePromises = stories
      .filter((story) => story.imageUrl)
      .map((story) => getStoryImageUrl(story.id, story.imageUrl!));

    await Promise.all(imagePromises);
  };

  // Precargar stories adyacentes (anterior y siguiente)
  const preloadAdjacentStories = async (
    stories: Array<{ id: string; imageUrl?: string }>,
    currentIndex: number
  ) => {
    const toPreload = [];

    // Historia anterior
    if (currentIndex > 0 && stories[currentIndex - 1]?.imageUrl) {
      toPreload.push(
        getStoryImageUrl(
          stories[currentIndex - 1].id,
          stories[currentIndex - 1].imageUrl!
        )
      );
    }

    // Historia siguiente
    if (
      currentIndex < stories.length - 1 &&
      stories[currentIndex + 1]?.imageUrl
    ) {
      toPreload.push(
        getStoryImageUrl(
          stories[currentIndex + 1].id,
          stories[currentIndex + 1].imageUrl!
        )
      );
    }

    await Promise.all(toPreload);
  };

  const getCachedStoryImage = (storyId: string): string => {
    return storyImageCache.value[storyId] || "/api/placeholder/100/100";
  };

  return {
    storyImageCache,
    getStoryImageUrl,
    preloadStoryImages,
    preloadAdjacentStories,
    getCachedStoryImage,
  };
}
