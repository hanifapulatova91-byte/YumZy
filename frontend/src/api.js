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
    register: async (username, password) => {
      const res = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ username, password }),
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
    processBarcode: async (barcode) => {
      const res = await fetch(`${API_URL}/scan`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ barcode }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Scanning failed');
      }
      return res.json();
    },
  },
  chat: {
    sendMessage: async (message) => {
      const res = await fetch(`${API_URL}/chat`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ message }),
      });
      if (!res.ok) {
        const error = await res.json();
        throw new Error(error.message || 'Chat failed');
      }
      return res.json();
    },
  },
  recipes: {
    generate: async (ingredients, language = 'en') => {
      const res = await fetch(`${API_URL}/recipes/generate`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({ ingredients, language }),
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
