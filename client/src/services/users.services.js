import api from './apiConfig';
import axios from 'axios';

export const getAllUsers = async () => {
  try {
    const response = await api.get('/users');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOneUser = async (name, region = null) => {
  try {
    // if user enters name of user without region, don't include it in query
    const response = await api.get(
      `/users/${name}${region ? `?region=${region}` : ''}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserCreatedScrims = async (id) => {
  try {
    const response = await api.get(`users/${id}/created-scrims`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

// get scrims where the user  was a caster or a player
export const getUserParticipatedScrims = async (id) => {
  try {
    const response = await api.get(`users/${id}/scrims`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUsersInRegion = async (region) => {
  // this one is unused
  try {
    const response = await api.get(`/users?region=${region}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method getUserById
 * @access public
 * @param {String} userId (the other using receiving the friend request)
 * @returns {<{name: string, discord: string, _id: string, friends: array<User>, isAdmin: boolean}>} returns the user attributes
 */
export const getUserById = async (userId) => {
  try {
    const response = await api.get(`/users/by-id/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getOPGGData = async (summonerName, region = 'na') => {
  try {
    const response = await axios.get(
      `https://lol-api-summoner.op.gg/api/${region}/complete/summoners?keyword=${summonerName}`
    );

    // returns an array, but because we pass the exact region and name, we return the first result.
    return response.data.data[0];
  } catch (error) {
    throw error;
  }
};
