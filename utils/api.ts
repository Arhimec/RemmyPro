// In production, this should point to the relative path if served by the same express server
// In development, you might need to point to http://localhost:3001
const IS_DEV = import.meta.env.DEV;
const BASE_URL = IS_DEV ? 'http://localhost:3001' : '';

export const api = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/store/${encodeURIComponent(key)}`);
      if (!response.ok) return null;
      const json = await response.json();
      return json.value !== undefined ? json.value : null;
    } catch (error) {
      console.error('API Get Error:', error);
      return null;
    }
  },

  set: async <T>(key: string, value: T): Promise<boolean> => {
    try {
      const response = await fetch(`${BASE_URL}/api/store/${encodeURIComponent(key)}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ value }),
      });
      return response.ok;
    } catch (error) {
      console.error('API Set Error:', error);
      return false;
    }
  }
};