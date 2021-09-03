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

export const insertPlayerInScrim = async (id, playerData) => {
  try {
    const response = await api.patch(`/scrims/${id}/insert-player`, playerData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    alert(errorMsg);
  }
};

export const removePlayerFromScrim = async (id, playerData) => {
  try {
    const response = await api.patch(`/scrims/${id}/remove-player`, playerData);
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    alert(errorMsg);
  }
};

export const insertCasterInScrim = async (id, data) => {
  try {
    const response = await api.patch(`/scrims/${id}/insert-caster`, data);
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    alert(errorMsg);
  }
};

export const removeCasterFromScrim = async (id, data) => {
  try {
    const response = await api.patch(`/scrims/${id}/remove-caster`, data);
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    alert(errorMsg);
  }
};

export const addImageToScrim = async (id, data) => {
  try {
    const response = await api.put(`/scrims/${id}/add-image`, data);
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
