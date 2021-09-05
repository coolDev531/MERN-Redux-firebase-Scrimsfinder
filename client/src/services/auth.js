import api from './apiConfig';
import devLog from './../utils/devLog';

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

export const registerUser = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    return response.data;
  } catch (error) {
    const errorMsg = error?.response?.data?.error;

    if (errorMsg) {
      alert(errorMsg);
      return;
    }
    throw error;
  }
};

export const setAuthToken = (token) => {
  if (token) {
    // Apply authorization token to every request if logged in
    api.defaults.headers.common['Authorization'] = token;
  } else {
    // Delete auth header
    delete api.defaults.headers.common['Authorization'];
  }
};

export const verifyUser = async ({ uid, email }) => {
  if (localStorage.jwtToken) {
    const token = localStorage.jwtToken;
    setAuthToken(token);

    try {
      const resp = await api.post('/auth/verify', {
        uid,
        email,
      });
      return resp.data;
    } catch (error) {
      // these lines are to handle the case when heroku is hibernating and the home page is loading because the content hasn't loaded but we don't have a user to associate it with.
      // if the user isn't verified and heroku is hibernating.
      let path = window.location.origin + '/user-setup';
      // and the path isn't user-setup
      if (window.location.origin + '/user-setup' !== path) {
        // send the user to user-setup.
        window.location.href = window.location.origin + '/user-setup';
      }
    }
  }
  return null;
};

export const removeToken = () => {
  devLog('removing token...');
  api.defaults.headers.common['Authorization'] = null;
};
