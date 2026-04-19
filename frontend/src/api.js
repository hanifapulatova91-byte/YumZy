const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
console.log('--- YUMZY API CONNECTED TO:', API_URL);

const getHeaders = () => {
  const token = localStorage.getItem('yumzy_token');
  const lang = localStorage.getItem('yumzy_lang') || 'en';
  return {
    'Content-Type': 'application/json',
    'Accept-Language': lang,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

export const api = {
  auth: {
    login: async (username, password) => {
      const res = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Login failed');
      }
      return res.json();
    },
    register: async (username, password, name) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password, name }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Registration failed');
      }
      return res.json();
    },
    getMe: async () => {
      const res = await fetch(`${API_URL}/auth/me`, {
        headers: getHeaders(),
      });
      if (!res.ok) throw new Error('Not authorized');
      return res.json();
    },
  },
  profile: {
    getProfile: async () => {
      const res = await fetch(`${API_URL}/profile`, {
        headers: getHeaders(),
      });
      if (!res.ok) return null;
      return res.json();
    },
    saveQuiz: async (payload) => {
      const res = await fetch(`${API_URL}/profile/quiz`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(payload),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Failed to finish quiz');
      }
      return res.json();
    },
  },
  scan: {
    processBarcode: async (barcode, allergens = []) => {
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ barcode, allergens }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Scanning failed');
      }
      return res.json();
    },
    analyzeImage: async (imageBase64, allergens = [], productName = '') => {
      const res = await fetch(`${API_URL}/scan/analyze-image`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ image: imageBase64, allergens, productName }),
      });
      if (!res.ok) {
        const contentType = res.headers.get('content-type');
        if (contentType && contentType.includes('application/json')) {
          const error = await res.json();
          throw new Error(error.message || 'Image analysis failed');
        }
        throw new Error('Failed to analyze image. Please try again.');
      }
      return res.json();
    },
  },
  chat: {
    sendMessage: async (message, allergens = []) => {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 25000); // 25s timeout
      
      try {
        const res = await fetch(`${API_URL}/chat`, {
          method: 'POST',
          headers: getHeaders(),
          body: JSON.stringify({ message, allergens }),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);
        
        if (!res.ok) {
          // Handle non-JSON error responses (e.g., Render HTML error pages)
          const contentType = res.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await res.json();
            throw new Error(error.message || 'Chat failed');
          }
          throw new Error('Server is waking up — please try again in a moment!');
        }
        return res.json();
      } catch (err) {
        clearTimeout(timeoutId);
        if (err.name === 'AbortError') {
          throw new Error('Response took too long — the server might be waking up. Try again!');
        }
        throw err;
      }
    },
  },
  recipes: {
    generate: async (ingredients, allergens = [], language = 'en') => {
      const res = await fetch(`${API_URL}/recipes/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ingredients, allergens, language }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Recipe generation failed');
      }
      return res.json();
    },
  },
  checker: {
    analyze: async (symptoms) => {
      const res = await fetch(`${API_URL}/checker/analyze`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ symptoms }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Analysis failed');
      }
      return res.json();
    },
  },
};
