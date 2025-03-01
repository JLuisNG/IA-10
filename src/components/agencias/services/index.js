// Configuración base para las solicitudes fetch
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const defaultHeaders = {
  'Content-Type': 'application/json'
};

// Función para manejar las respuestas
const handleResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const error = new Error(errorData.message || `Error: ${response.status} ${response.statusText}`);
    error.status = response.status;
    error.data = errorData;
    console.error('API Error:', error);
    throw error;
  }
  return response.json();
};

// Objeto API con métodos para las diferentes operaciones
const api = {
  // GET request
  get: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'GET',
        headers: defaultHeaders
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`GET Error (${endpoint}):`, error);
      throw error;
    }
  },

  // POST request
  post: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'POST',
        headers: defaultHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`POST Error (${endpoint}):`, error);
      throw error;
    }
  },

  // PUT request
  put: async (endpoint, data) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'PUT',
        headers: defaultHeaders,
        body: JSON.stringify(data)
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`PUT Error (${endpoint}):`, error);
      throw error;
    }
  },

  // DELETE request
  delete: async (endpoint) => {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: 'DELETE',
        headers: defaultHeaders
      });
      return handleResponse(response);
    } catch (error) {
      console.error(`DELETE Error (${endpoint}):`, error);
      throw error;
    }
  }
};

export default api;