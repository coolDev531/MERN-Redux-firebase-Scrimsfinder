import api from './apiConfig';

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

export const deleteOneUserNotification = async (userId, notificationId) => {
  try {
    const response = await api.post(`
/users/${userId}/remove-notification/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAllUserNotifications = async (userId) => {
  try {
    const response = await api.post(`
/users/remove-all-notifications/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const addUserFriend = async (userId, newFriendId) => {
  try {
    const response = await api.post(`/users/add-new-friend/${userId}`, {
      newFriendUserId: newFriendId,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeUserFriend = async (userId, friendUserId) => {
  try {
    const response = await api.post(`/users/remove-friend/${userId}/`, {
      friendUserId,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method sendFriendRequest
 * @param {String} userReceivingId
 * @param {String} userSendingId
 * @returns {<{newFriendRequest: object, sentToUser: string, sentToUserId, string}>}}
 */
export const sendFriendRequest = async (userReceivingId, userSendingId) => {
  try {
    const response = await api.post(
      `/users/send-friend-request/${userReceivingId}/${userSendingId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const removeFriendRequest = async (userId, requestId) => {
  try {
    const response = await api.post(
      `/users/${userId}/remove-friend-request/${requestId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const pushUserNotification = async (userId, newNotification) => {
  try {
    const response = await api.post(
      `/users/${userId}/push-notification/`,
      newNotification
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserNotifications = async (userId) => {
  try {
    const response = await api.get(`/users/user-notifications/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserFriendRequests = async (userId) => {
  try {
    const response = await api.get(`/users/user-friend-requests/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getUserFriends = async (userId) => {
  try {
    const response = await api.get(`/users/user-friends/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
