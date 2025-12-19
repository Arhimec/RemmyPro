// Determine base URL based on current location
const getBaseUrl = () => {
  if (typeof window === 'undefined') return '';

  const { protocol, hostname, port } = window.location;

  // If running on Vite's dev port (3024), point to backend port 3025
  // on the same hostname (localhost or IP)
  if (port === '3024') {
      return `${protocol}//${hostname}:3025`;
  }

  // Otherwise (production/served by server.js), use relative paths
  return '';
};

const BASE_URL = getBaseUrl();

export const api = {
  get: async <T>(key: string): Promise<T | null> => {
    try {
      const response = await fetch(`${BASE_URL}/api/store/${encodeURIComponent(key)}`);
      
      if (!response.ok) {
        console.warn(`API Error: ${response.status} ${response.statusText}`);
        return null;
      }
      
      // Ensure we actually got JSON before parsing
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        console.error("Received non-JSON response from API:", await response.text());
        return null;
      }

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