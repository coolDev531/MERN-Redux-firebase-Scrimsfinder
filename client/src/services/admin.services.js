import api from './apiConfig';

export const banUser = async (userId, body) => {
  const { dateFrom, dateTo, reason = '' } = body;

  try {
    const response = await api.post(`/admin/banUser/`, {
      banUserId: userId,
      dateFrom,
      dateTo,
      reason,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const unbanUser = async (userId) => {
  try {
    const response = await api.post(`/admin/unbanUser/`, {
      bannedUserId: userId,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllBans = async () => {
  try {
    const response = await api.get(`/admin/all-bans-history`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const updateUserAsAdmin = async (userId, body, setAlert) => {
  try {
    const response = await api.post(`/admin/updateUser/${userId}`, body);

    setAlert({ type: 'Success', message: 'User successfuly updated!' });

    return response.data;
  } catch (error) {
    const errorMsg = error.response.data?.error ?? error;

    setAlert({ type: 'Error', message: errorMsg });

    return;
  }
};
