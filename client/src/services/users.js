import api from './apiConfig';

export const createUser = async (user) => {
  try {
    const response = await api.post('/users', user);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// verify user by getting google uid and email, then give rest of data.
export const verifyUser = async (googleUid, googleEmail) => {
  try {
    const response = await api.get(`/auth/verify/${googleUid}`, googleEmail);
    return response.data;
  } catch (error) {
    throw error;
  }
};
