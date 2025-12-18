// Determine base URL based on current location
const getBaseUrl = () => {
  if (typeof window !== 'undefined') {
     const host = window.location.hostname;
     // If running locally, assume backend is on port 3001
     if (host === 'localhost' || host === '127.0.0.1') {
         return 'http://localhost:3001';
     }
  }
  return ''; // In production, use relative paths (same origin)
};

const BASE_URL = getBaseUrl();

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