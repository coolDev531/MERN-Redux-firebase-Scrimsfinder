import api from './apiConfig';

export const getAllScrims = async () => {
  try {
    const response = await api.get('/scrims');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getScrimById = async (id) => {
  try {
    const response = await api.get(`/scrims/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const createScrim = async (scrim) => {
  try {
    const response = await api.post('/scrims', scrim);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateScrim = async (id, scrim) => {
  try {
    const response = await api.put(`/scrims/${id}`, scrim);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const insertPlayerInScrim = async (id, scrim) => {
  try {
    const response = await api.put(`/scrims/${id}/insert-player`, scrim);
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    alert(errorMsg);
  }
};

export const removePlayerFromScrim = async (id, scrim) => {
  try {
    const response = await api.put(`/scrims/${id}/remove-player`, scrim);
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    alert(errorMsg);
  }
};

export const insertCasterInScrim = async (id, scrim) => {
  try {
    const response = await api.put(`/scrims/${id}/insert-caster`, scrim);
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    alert(errorMsg);
  }
};

export const deleteScrim = async (id) => {
  try {
    const response = await api.delete(`/scrims/${id}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
