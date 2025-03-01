const API_URL = 'http://localhost:3001/api';

export const getTherapists = async () => {
  try {
    const response = await fetch(`${API_URL}/therapists`);
    if (!response.ok) {
      throw new Error('Error al obtener los terapeutas');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const getTherapistById = async (id) => {
  try {
    const response = await fetch(`${API_URL}/therapists/${id}`);
    if (!response.ok) {
      throw new Error('Error al obtener el terapeuta');
    }
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const createTherapist = async (therapistData) => {
  try {
    const response = await fetch(`${API_URL}/therapists`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(therapistData),
    });
    
    if (!response.ok) {
      throw new Error('Error al crear el terapeuta');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const updateTherapist = async (id, therapistData) => {
  try {
    const response = await fetch(`${API_URL}/therapists/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(therapistData),
    });
    
    if (!response.ok) {
      throw new Error('Error al actualizar el terapeuta');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};

export const deleteTherapist = async (id) => {
  try {
    const response = await fetch(`${API_URL}/therapists/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      throw new Error('Error al eliminar el terapeuta');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error:', error);
    throw error;
  }
};