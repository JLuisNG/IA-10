const API_URL = 'http://localhost:3002/api';

export const getAgencias = async () => {
  try {
    const response = await fetch(`${API_URL}/agencias`);
    if (!response.ok) {
      throw new Error('Error al obtener las agencias');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getAgenciaById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/agencias/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener la agencia');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createAgencia = async (agenciaData) => {
  try {
    const response = await fetch(`${API_URL}/agencias`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agenciaData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear la agencia');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updateAgencia = async (id, agenciaData) => {
  try {
    const response = await fetch(`${API_URL}/agencias/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(agenciaData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar la agencia');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteAgencia = async (id) => {
  try {
    const response = await fetch(`${API_URL}/agencias/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar la agencia');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};