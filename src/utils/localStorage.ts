// utils/localStorage.ts

/**
 * Utilidad para gestionar datos en localStorage con manejo de errores
 * y funcionalidades para trabajar con expiración de datos
 */

// Estructura de datos para almacenar con expiración
interface StorageItem<T> {
  value: T;
  expiry?: number; // timestamp de expiración (opcional)
}

/**
 * Guarda un valor en localStorage con opción de expiración
 * @param key Clave para almacenar el valor
 * @param value Valor a almacenar
 * @param ttl Tiempo de vida en horas (opcional)
 */
export function setLocalStorage<T>(
  key: string,
  value: T,
  ttl?: number
): boolean {
  try {
    const item: StorageItem<T> = {
      value: value,
    };

    // Si se especifica un tiempo de vida, calcular cuándo expira
    if (ttl) {
      item.expiry = new Date().getTime() + ttl * 60 * 60 * 1000;
    }

    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error(`Error al guardar en localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Obtiene un valor de localStorage, verificando si ha expirado
 * @param key Clave del valor a obtener
 * @returns El valor almacenado, o null si no existe o ha expirado
 */
export function getLocalStorage<T>(key: string): T | null {
  try {
    const itemStr = localStorage.getItem(key);

    // Si no existe el item, retornar null
    if (!itemStr) {
      return null;
    }

    const item: StorageItem<T> = JSON.parse(itemStr);

    // Verificar si el item ha expirado
    if (item.expiry && new Date().getTime() > item.expiry) {
      // Si expiró, eliminarlo y retornar null
      localStorage.removeItem(key);
      return null;
    }

    return item.value;
  } catch (error) {
    console.error(`Error al leer de localStorage (${key}):`, error);
    return null;
  }
}

/**
 * Elimina un elemento de localStorage
 * @param key Clave del elemento a eliminar
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error(`Error al eliminar de localStorage (${key}):`, error);
    return false;
  }
}

/**
 * Limpia todos los datos de localStorage cuyas claves comiencen con cierto prefijo
 * @param prefix Prefijo de las claves a eliminar
 */
export function clearLocalStorageByPrefix(prefix: string): void {
  try {
    Object.keys(localStorage).forEach((key) => {
      if (key.startsWith(prefix)) {
        localStorage.removeItem(key);
      }
    });
  } catch (error) {
    console.error(
      `Error al limpiar localStorage con prefijo (${prefix}):`,
      error
    );
  }
}

/**
 * Verifica si un elemento de localStorage ha expirado
 * @param key Clave del elemento a verificar
 * @returns true si el elemento existe y no ha expirado, false en caso contrario
 */
export function isLocalStorageValid(key: string): boolean {
  return getLocalStorage(key) !== null;
}

/**
 * Actualiza la expiración de un elemento existente
 * @param key Clave del elemento a actualizar
 * @param ttl Nuevo tiempo de vida en horas
 */
export function updateExpiryLocalStorage(key: string, ttl: number): boolean {
  try {
    const itemStr = localStorage.getItem(key);
    if (!itemStr) return false;

    const item = JSON.parse(itemStr);
    item.expiry = new Date().getTime() + ttl * 60 * 60 * 1000;

    localStorage.setItem(key, JSON.stringify(item));
    return true;
  } catch (error) {
    console.error(
      `Error al actualizar expiración en localStorage (${key}):`,
      error
    );
    return false;
  }
}
