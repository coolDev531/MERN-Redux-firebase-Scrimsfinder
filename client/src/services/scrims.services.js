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

export const createScrim = async (scrim, setCurrentAlert) => {
  try {
    const response = await api.post('/scrims', scrim);
    return response.data;
  } catch (error) {
    if (setCurrentAlert) {
      setCurrentAlert({ type: 'Error', message: 'error creating scrim' });
    }

    throw error;
  }
};

export const updateScrim = async (id, scrim, setCurrentAlert) => {
  try {
    const response = await api.put(`/scrims/${id}`, scrim);
    return response.data;
  } catch (error) {
    if (setCurrentAlert) {
      setCurrentAlert({
        type: 'Error',
        message: 'Error updating Scrim',
      });
    }
    throw error;
  }
};

export const insertPlayerInScrim = async ({
  scrimId,
  userId,
  playerData,
  setAlert,
  setButtonsDisabled,
  setScrim,
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
    const scrim = error.response.data.scrim ?? null;

    if (
      errorMsg ===
      'Player already exists in game. Did you mean to move the player? use the /move-player endpoint instead.'
    ) {
      return;
    }

    setAlert({ type: 'Error', message: errorMsg });

    if (scrim) {
      setScrim(scrim);
    }

    setButtonsDisabled(false);

    return;
  }
};

export const removePlayerFromScrim = async ({
  scrimId,
  userId,
  setAlert,
  setButtonsDisabled,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/remove-player/${userId}`
    );
    return response.data;
  } catch (error) {
    const errorMsg = error.response.data?.error ?? error;

    setButtonsDisabled(false);

    setAlert({ type: 'Error', message: errorMsg });

    return;
  }
};

export const movePlayerInScrim = async ({
  scrimId,
  userId,
  playerData,
  setAlert,
  setButtonsDisabled,
  setScrim,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/move-player/${userId}`,
      { playerData }
    );

    return response.data;
  } catch (error) {
    const errorMsg = error.response.data.error;
    const scrim = error.response.data.scrim ?? null;

    setAlert({ type: 'Error', message: errorMsg });

    if (scrim) {
      setScrim(scrim);
    }

    setButtonsDisabled(false);

    return;
  }
};

export const insertCasterInScrim = async ({
  scrimId,
  userId,
  setAlert,
  setButtonsDisabled,
  setScrim,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/insert-caster/${userId}`
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response.data?.error ?? error?.message ?? JSON.stringify(error);

    const scrim = error.response.data?.scrim ?? null;

    setAlert({ type: 'Error', message: errorMsg });

    if (scrim) {
      setScrim(scrim);
    }

    setButtonsDisabled(false);
    return;
  }
};

export const removeCasterFromScrim = async ({
  scrimId,
  userId,
  setAlert,
  setButtonsDisabled,
}) => {
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/remove-caster/${userId}`
    );
    return response.data;
  } catch (error) {
    const errorMsg =
      JSON.stringify(error.response.data?.error) ??
      error?.message ??
      JSON.stringify(error);

    if (typeof setAlert === 'function') {
      return setAlert({ type: 'Error', message: errorMsg });
    }

    setButtonsDisabled(false);

    return alert(errorMsg);
  }
};

export const addImageToScrim = async (id, data, setAlert) => {
  try {
    const response = await api.patch(`/scrims/${id}/add-image`, data);
    return response.data;
  } catch (error) {
    const errorMsg =
      error.response.data?.error.message ??
      JSON.stringify(error?.message) ??
      JSON.stringify(error);

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
    throw error;
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

// the who won buttons (only admins or lobby captains/hosts can see)
export const setScrimWinner = async (id, winnerTeamName, setAlert) => {
  try {
    const response = await api.patch(`/scrims/${id}/set-winner`, {
      winnerTeamName,
    });
    return response.data;
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ?? error?.message ?? JSON.stringify(error);

    setAlert({ type: 'Error', message: errorMsg });
  }
};

export const swapPlayersInScrim = async ({
  scrimId,
  swapPlayers,
  setButtonsDisabled,
  setAlert,
  setScrim,
}) => {
  // sending the role joining and the team name inside playerData in the req.body.
  try {
    const response = await api.patch(
      `/scrims/${scrimId}/swap-players`,
      swapPlayers
    );
    setAlert({ type: 'Success', message: 'Players swapped!' });
    return response.data;
  } catch (error) {
    const errorMsg =
      error?.response?.data?.error ?? error?.message ?? JSON.stringify(error);
    const scrim = error.response.data.scrim ?? null;

    setAlert({ type: 'Error', message: errorMsg });

    if (scrim) {
      setScrim(scrim);
    }

    setButtonsDisabled(false);

    return;
  }
};
