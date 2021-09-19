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

export const insertPlayerInScrim = async ({
  scrimId,
  userId,
  playerData,
  setAlert,
}) => {
  // sending the role joining and the team name inside playerData in the req.body.
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/insert-player/${userId}`,
      { playerData }
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ?? error?.message ?? JSON.stringify(error);

    if (
      errorMsg ===
      'Player already exists in game. Did you mean to move the player? use the /move-player endpoint instead.'
    ) {
      return;
    }

    if (typeof setAlert === 'function') {
      return setAlert({ type: 'Error', message: errorMsg });
    }

    // if dev forgot to add setAlert
    return alert(errorMsg);
  }
};

export const removePlayerFromScrim = async ({ scrimId, userId, setAlert }) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/remove-player/${userId}`
    );
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data?.error ?? error;

    if (typeof setAlert === 'function') {
      return setAlert({ type: 'Error', message: errorMsg });
    }

    return alert(errorMsg);
  }
};

export const movePlayerInScrim = async ({
  scrimId,
  userId,
  playerData,
  setAlert,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/move-player/${userId}`,
      { playerData }
    );
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;

    if (typeof setAlert === 'function') {
      return setAlert({ type: 'Error', message: errorMsg });
    }

    return alert(errorMsg);
  }
};

export const insertCasterInScrim = async ({ scrimId, userId, setAlert }) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/insert-caster/${userId}`
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response.data?.error ?? error?.message ?? JSON.stringify(error);

    if (typeof setAlert === 'function') {
      return setAlert({ type: 'Error', message: errorMsg });
    }

    return alert(errorMsg);
  }
};

export const removeCasterFromScrim = async ({ scrimId, userId, setAlert }) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/remove-caster/${userId}`
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response.data?.error ?? error?.message ?? JSON.stringify(error);

    if (typeof setAlert === 'function') {
      return setAlert({ type: 'Error', message: errorMsg });
    }

    return alert(errorMsg);
  }
};

export const addImageToScrim = async (id, data, setAlert) => {
  try {
    const response = await api.patch(`/scrims/${id}/add-image`, data);
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response.data?.error ?? error?.message ?? JSON.stringify(error);

    if (typeof setAlert === 'function') {
      return setAlert({
        type: 'Error',
        message: errorMsg,
      });
    }

    return alert(errorMsg);
  }
};

export const removeImageFromScrim = async (id) => {
  try {
    const response = await api.patch(`/scrims/${id}/remove-image`);
    return response.data;
  } catch (error) {
    console.error(error);
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
