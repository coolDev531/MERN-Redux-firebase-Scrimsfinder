import api from './apiConfig';

export const loginUser = async (googleParams) => {
  try {
    const response = await api.post('/auth/login', {
      email: googleParams.email,
      uid: googleParams.uid,
    });
    return response.data;
  } catch (error) {
    const errorMsg = error?.response?.data?.error;

    if (errorMsg) {
      return alert(errorMsg);
    }
  }
};

export const registerUser = async (user) => {
  try {
    const response = await api.post('/users', user);
    return response.data;
  } catch (error) {
    const errorMsg = error?.response?.data?.error;

    if (errorMsg) {
      alert(errorMsg);
    }
    throw error;
  }
};

// verify user by getting google uid and email, then give rest of data.
export const verifyUser = async (googleParams) => {
  try {
    const response = await api.post('/auth/verify', {
      email: googleParams.email,
      uid: googleParams.uid,
    });
    return response.data;
  } catch (error) {
    throw error;
  }
};
