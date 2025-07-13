import { defineStore } from "pinia";
import { ref } from "vue";
import type { Schema } from "../../amplify/data/resource";
import type { Story } from "@/types/story.types";
import { generateClient } from "aws-amplify/data";

const publicClient = generateClient<Schema>({
  authMode: "apiKey",
});

const authClient = generateClient<Schema>({
  authMode: "userPool",
});

export const useStoryStore = defineStore("story", () => {
  const stories = ref<Story[]>([]);
  const currentStory = ref<Story | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Agregar esta función al inicio del store, después de los clients
  const normalizeStoryOrders = (stories: any[]) => {
    // Ordenar por fecha de creación (más reciente primero)
    const sortedStories = stories.sort((a, b) => {
      return (
        new Date(b.createdAt || "").getTime() -
        new Date(a.createdAt || "").getTime()
      );
    });

    // Renumerar desde 0 de forma secuencial
    return sortedStories.map((story, index) => ({
      ...story,
      order: index,
    }));
  };

  const checkExpiredStories = async () => {
    const now = new Date();
    const expiredStories = stories.value.filter((story) => {
      if (!story.expiresAt) return false;
      return new Date(story.expiresAt) <= now && story.active;
    });

    // Desactivar historias vencidas
    for (const story of expiredStories) {
      try {
        await authClient.models.Story.update({
          id: story.id,
          active: false,
          updatedAt: new Date().toISOString(),
        });

        // Actualizar en el store local
        const index = stories.value.findIndex((s) => s.id === story.id);
        if (index !== -1) {
          stories.value[index].active = false;
        }
      } catch (error) {
        console.error("Error deactivating expired story:", error);
      }
    }
  };

  // FETCH - Obtener todas las historias (admin)
  const fetchStories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const { data: items } = await authClient.models.Story.list();

      if (!items) {
        throw new Error("Error al obtener historias: items es null");
      }

      // Obtener información del producto relacionado para cada historia
      const storiesWithProducts = await Promise.all(
        items.map(async (story) => {
          let productInfo = undefined;

          if (story.productID) {
            try {
              const { data: product } = await publicClient.models.Product.get({
                id: story.productID,
              });
              if (product) {
                productInfo = {
                  id: product.id,
                  name: product.name,
                  price: product.price,
                  imageUrl: product.imageUrl,
                };
              }
            } catch (error) {
              console.error("Error loading product for story:", error);
            }
          }

          return {
            ...story,
            product: productInfo,
          };
        })
      );

      // Normalizar órdenes por fecha de creación
      const normalizedStories = normalizeStoryOrders(storiesWithProducts);
      stories.value = normalizedStories as Story[];

      // Verificar y desactivar historias vencidas
      await checkExpiredStories();
    } catch (err) {
      error.value = "Error al cargar historias";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // FETCH ACTIVE - Obtener historias activas (público)
  const fetchActiveStories = async () => {
    loading.value = true;
    error.value = null;
    try {
      const now = new Date().toISOString();

      const { data: items } = await publicClient.models.Story.list({
        filter: {
          and: [
            { active: { eq: true } },
            { expiresAt: { gt: now } }, // Solo historias que no han vencido
          ],
        },
      });

      // Resto del código igual...
      const storiesWithProducts = await Promise.all(
        items.map(async (story) => {
          if (story.productID) {
            try {
              const { data: product } = await publicClient.models.Product.get({
                id: story.productID,
              });
              return {
                ...story,
                product: product
                  ? {
                      id: product.id,
                      name: product.name,
                      price: product.price,
                      imageUrl: product.imageUrl,
                    }
                  : undefined,
              };
            } catch (error) {
              console.error("Error loading product for story:", error);
              return story;
            }
          }
          return story;
        })
      );

      const normalizedStories = normalizeStoryOrders(storiesWithProducts);
      stories.value = normalizedStories as Story[];
    } catch (err) {
      error.value = "Error al cargar historias";
      console.error(err);
    } finally {
      loading.value = false;
    }
  };

  // CREATE - Crear nueva historia
  const createStory = async (
    storyData: Omit<
      Story,
      "id" | "createdAt" | "updatedAt" | "expiresAt" | "order"
    >
  ) => {
    loading.value = true;
    try {
      const now = new Date();
      const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 24 horas después

      // Incrementar el orden de todas las historias existentes
      if (stories.value.length > 0) {
        const updatePromises = stories.value.map((story) =>
          authClient.models.Story.update({
            id: story.id,
            order: (story.order || 0) + 1,
            updatedAt: new Date().toISOString(),
          })
        );
        await Promise.all(updatePromises);
      }

      const { data: newStory } = await authClient.models.Story.create({
        title: storyData.title,
        description: storyData.description,
        imageUrl: storyData.imageUrl,
        audioUrl: storyData.audioUrl || undefined,
        externalLink: storyData.externalLink || undefined,
        productID: storyData.productID || undefined,
        active: storyData.active,
        views: storyData.views || 0,
        likes: storyData.likes || 0,
        wants: storyData.wants || 0,
        duration: storyData.duration,
        order: 0, // Nueva historia siempre orden 0
        expiresAt: expiresAt.toISOString(),
        createdAt: now.toISOString(),
        updatedAt: now.toISOString(),
      });

      if (!newStory || !newStory.id) {
        throw new Error(
          "Error al crear la historia: respuesta inválida del servidor"
        );
      }

      await fetchStories();
      return newStory;
    } catch (err) {
      error.value = "Error al crear historia";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // UPDATE - Actualizar historia
  const updateStory = async (
    id: string,
    storyData: Partial<Omit<Story, "id" | "createdAt" | "expiresAt" | "order">>
  ) => {
    loading.value = true;
    try {
      // Crear una copia sin los campos que no se deben actualizar
      const updateData = { ...storyData };

      // Remover campos que no se deben actualizar (si existen en el tipo completo)
      delete (updateData as any).views;
      delete (updateData as any).likes;
      delete (updateData as any).wants;
      delete (updateData as any).order;

      const { data: updatedStory } = await authClient.models.Story.update({
        id,
        ...updateData,
        updatedAt: new Date().toISOString(),
      });

      await fetchStories();
      return updatedStory;
    } catch (err) {
      error.value = "Error al actualizar historia";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // DELETE - Eliminar historia
  const deleteStory = async (id: string) => {
    loading.value = true;
    try {
      // Eliminar interacciones relacionadas primero
      const { data: interactions } =
        await authClient.models.StoryInteraction.list({
          filter: { storyID: { eq: id } },
        });

      if (interactions) {
        await Promise.all(
          interactions.map((interaction) =>
            interaction.id
              ? authClient.models.StoryInteraction.delete({
                  id: interaction.id,
                })
              : Promise.resolve()
          )
        );
      }

      // Eliminar la historia
      await authClient.models.Story.delete({ id });

      await fetchStories();
    } catch (err) {
      error.value = "Error al eliminar historia";
      console.error(err);
      throw err;
    } finally {
      loading.value = false;
    }
  };

  // GET BY ID - Obtener historia por ID
  const getStoryById = async (storyId: string): Promise<Story | null> => {
    try {
      const { data: story } = await authClient.models.Story.get({
        id: storyId,
      });

      if (!story) return null;

      // Obtener producto relacionado si existe
      let productInfo = undefined;
      if (story.productID) {
        try {
          const { data: product } = await publicClient.models.Product.get({
            id: story.productID,
          });
          if (product) {
            productInfo = {
              id: product.id,
              name: product.name,
              price: product.price,
              imageUrl: product.imageUrl,
            };
          }
        } catch (error) {
          console.error("Error loading product for story:", error);
        }
      }

      const fullStory = {
        ...story,
        product: productInfo,
      } as Story;

      currentStory.value = fullStory;
      return fullStory;
    } catch (err) {
      console.error("Error getting story by ID:", err);
      return null;
    }
  };

  const getTimeRemaining = (
    expiresAt: string
  ): { hours: number; minutes: number; expired: boolean } => {
    const now = new Date();
    const expiration = new Date(expiresAt);
    const diff = expiration.getTime() - now.getTime();

    if (diff <= 0) {
      return { hours: 0, minutes: 0, expired: true };
    }

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    return { hours, minutes, expired: false };
  };

  const refreshStoryStats = async (storyId: string) => {
    try {
      const { data: story } = await authClient.models.Story.get({
        id: storyId,
      });

      if (story) {
        // Actualizar la historia en el array local
        const index = stories.value.findIndex((s) => s.id === storyId);
        if (index !== -1) {
          stories.value[index] = {
            ...stories.value[index],
            views: story.views || 0, // Usar 0 si es null
            likes: story.likes || 0, // Usar 0 si es null
            wants: story.wants || 0, // Usar 0 si es null
          };
        }
      }
    } catch (error) {
      console.error("Error refreshing story stats:", error);
    }
  };

  // INTERACTIONS - Métodos para interacciones
  const addStoryView = async (storyId: string, userEmail?: string) => {
    try {
      // Incrementar contador de vistas
      const story = stories.value.find((s) => s.id === storyId);
      if (story) {
        await publicClient.models.Story.update({
          id: storyId,
          views: (story.views || 0) + 1,
        });
        story.views = (story.views || 0) + 1;
      }

      // Registrar interacción si hay usuario
      if (userEmail) {
        await publicClient.models.StoryInteraction.create({
          storyID: storyId,
          userEmail,
          type: "view",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error adding story view:", error);
    }
  };

  const toggleStoryLike = async (storyId: string, userEmail: string) => {
    try {
      const story = stories.value.find((s) => s.id === storyId);
      if (!story) return;

      // Verificar si ya tiene like
      const { data: existingLike } =
        await authClient.models.StoryInteraction.list({
          filter: {
            and: [
              { storyID: { eq: storyId } },
              { userEmail: { eq: userEmail } },
              { type: { eq: "like" } },
            ],
          },
        });

      if (existingLike && existingLike.length > 0) {
        // Quitar like
        await authClient.models.StoryInteraction.delete({
          id: existingLike[0].id,
        });
        await authClient.models.Story.update({
          id: storyId,
          likes: Math.max(0, (story.likes || 0) - 1),
        });
        story.likes = Math.max(0, (story.likes || 0) - 1);
      } else {
        // Agregar like
        await authClient.models.StoryInteraction.create({
          storyID: storyId,
          userEmail,
          type: "like",
          createdAt: new Date().toISOString(),
        });
        await authClient.models.Story.update({
          id: storyId,
          likes: (story.likes || 0) + 1,
        });
        story.likes = (story.likes || 0) + 1;
      }
    } catch (error) {
      console.error("Error toggling story like:", error);
    }
  };

  const addStoryWant = async (storyId: string, userEmail?: string) => {
    try {
      const story = stories.value.find((s) => s.id === storyId);
      if (!story) return;

      // Incrementar contador de "lo quiero"
      await authClient.models.Story.update({
        id: storyId,
        wants: (story.wants || 0) + 1,
      });
      story.wants = (story.wants || 0) + 1;

      // Registrar interacción si hay usuario
      if (userEmail) {
        await authClient.models.StoryInteraction.create({
          storyID: storyId,
          userEmail,
          type: "want",
          createdAt: new Date().toISOString(),
        });
      }
    } catch (error) {
      console.error("Error adding story want:", error);
    }
  };

  const checkIfUserLiked = async (
    storyId: string,
    userEmail: string
  ): Promise<boolean> => {
    try {
      const { data: existingLike } =
        await authClient.models.StoryInteraction.list({
          filter: {
            and: [
              { storyID: { eq: storyId } },
              { userEmail: { eq: userEmail } },
              { type: { eq: "like" } },
            ],
          },
        });
      return existingLike && existingLike.length > 0;
    } catch (error) {
      console.error("Error checking if user liked:", error);
      return false;
    }
  };

  const getUsersWhoLiked = async (storyId: string): Promise<string[]> => {
    try {
      const { data: likes } = await authClient.models.StoryInteraction.list({
        filter: {
          and: [{ storyID: { eq: storyId } }, { type: { eq: "like" } }],
        },
      });
      //console.log(likes);
      return likes
        ? likes
            .map((like) => like.userEmail)
            .filter((email): email is string => email !== null)
        : [];
    } catch (error) {
      console.error("Error getting users who liked:", error);
      return [];
    }
  };

  const toggleStoryWant = async (storyId: string, userEmail: string) => {
    try {
      const story = stories.value.find((s) => s.id === storyId);
      if (!story) return;

      // Verificar si ya tiene want
      const { data: existingWant } =
        await authClient.models.StoryInteraction.list({
          filter: {
            and: [
              { storyID: { eq: storyId } },
              { userEmail: { eq: userEmail } },
              { type: { eq: "want" } },
            ],
          },
        });

      if (existingWant && existingWant.length > 0) {
        // Quitar want
        await authClient.models.StoryInteraction.delete({
          id: existingWant[0].id,
        });
        await authClient.models.Story.update({
          id: storyId,
          wants: Math.max(0, (story.wants || 0) - 1),
        });
        story.wants = Math.max(0, (story.wants || 0) - 1);
      } else {
        // Agregar want
        await authClient.models.StoryInteraction.create({
          storyID: storyId,
          userEmail,
          type: "want",
          createdAt: new Date().toISOString(),
        });
        await authClient.models.Story.update({
          id: storyId,
          wants: (story.wants || 0) + 1,
        });
        story.wants = (story.wants || 0) + 1;
      }
    } catch (error) {
      console.error("Error toggling story want:", error);
    }
  };

  const checkIfUserWanted = async (
    storyId: string,
    userEmail: string
  ): Promise<boolean> => {
    try {
      const { data: existingWant } =
        await authClient.models.StoryInteraction.list({
          filter: {
            and: [
              { storyID: { eq: storyId } },
              { userEmail: { eq: userEmail } },
              { type: { eq: "want" } },
            ],
          },
        });
      return existingWant && existingWant.length > 0;
    } catch (error) {
      console.error("Error checking if user wanted:", error);
      return false;
    }
  };

  const getUsersWhoWanted = async (storyId: string): Promise<string[]> => {
    try {
      const { data: wants } = await authClient.models.StoryInteraction.list({
        filter: {
          and: [{ storyID: { eq: storyId } }, { type: { eq: "want" } }],
        },
      });
      return wants
        ? wants
            .map((want) => want.userEmail)
            .filter((email): email is string => email !== null)
        : [];
    } catch (error) {
      console.error("Error getting users who wanted:", error);
      return [];
    }
  };

  // Método para sincronizar los órdenes normalizados en la BD
  const syncStoryOrders = async () => {
    try {
      const updatePromises = stories.value.map((story, index) => {
        if (story.order !== index) {
          return authClient.models.Story.update({
            id: story.id,
            order: index,
            updatedAt: new Date().toISOString(),
          });
        }
        return Promise.resolve();
      });

      await Promise.all(updatePromises);
    } catch (error) {
      console.error("Error syncing story orders:", error);
    }
  };

  const forceExpireStory = async (storyId: string) => {
    try {
      //console.log("🧪 Intentando forzar vencimiento para historia:", storyId);

      const pastDate = new Date(Date.now() - 1000 * 60 * 60); // 1 hora atrás
      //console.log("🧪 Fecha de vencimiento forzada:", pastDate.toISOString());

      const { data: updatedStory } = await authClient.models.Story.update({
        id: storyId,
        expiresAt: pastDate.toISOString(),
        updatedAt: new Date().toISOString(),
      });

      //console.log("🧪 Historia actualizada:", updatedStory);

      // Verificar historias vencidas inmediatamente
      await checkExpiredStories();

      // Recargar historias
      await fetchStories();

      //console.log("🧪 Vencimiento forzado exitosamente");
    } catch (error) {
      console.error("🧪 Error detallado en forceExpireStory:", error);
      throw error; // Re-lanzar el error para que se muestre en el toast
    }
  };

  // TEMPORAL: Función para restaurar tiempo normal (24h desde ahora)
  const resetStoryExpiration = async (storyId: string) => {
    try {
      //console.log("🧪 Intentando restaurar historia:", storyId);

      const futureDate = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h desde ahora
      //console.log("🧪 Nueva fecha de vencimiento:", futureDate.toISOString());

      const { data: updatedStory } = await authClient.models.Story.update({
        id: storyId,
        expiresAt: futureDate.toISOString(),
        active: true, // Asegurar que esté activa
        updatedAt: new Date().toISOString(),
      });

      //console.log("🧪 Historia restaurada:", updatedStory);

      await fetchStories();
      //console.log("🧪 Restauración exitosa");
    } catch (error) {
      console.error("🧪 Error detallado en resetStoryExpiration:", error);
      throw error;
    }
  };

  return {
    stories,
    currentStory,
    loading,
    error,
    fetchStories, // Para admin
    fetchActiveStories, // Para público
    createStory, // CRUD
    updateStory, // CRUD
    deleteStory, // CRUD
    getStoryById,
    addStoryView,
    toggleStoryLike,
    addStoryWant,
    checkIfUserLiked,
    getUsersWhoLiked,
    toggleStoryWant,
    checkIfUserWanted,
    getUsersWhoWanted,
    syncStoryOrders,
    refreshStoryStats,
    checkExpiredStories,
    getTimeRemaining,
    forceExpireStory, // TEMPORAL - VERIFICAR QUE ESTÉ AQUÍ
    resetStoryExpiration, // TEMPORAL - VERIFICAR QUE ESTÉ AQUÍ
  };
});
