import api from './apiConfig';

/**
 * @method getUserFriends
 * @desc get all the friends that belong to that one user
 * @access public
 * @param {String} userId the userId that you want to get his friends list.
 * @returns {Array<User>}
 */
export const getUserFriends = async (userId) => {
  try {
    const response = await api.get(`/friends/user-friends/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method acceptFriendRequest
 * @desc accept a friend request
 * @access public
 * @param {String} userId the current user id
 * @param {String} newFriendId the sender that you're accepting the friend request of
 * @returns {Array<User>}
 */
export const acceptFriendRequest = async (userId, newFriendId) => {
  try {
    const response = await api.post(
      `/friend-requests/accept-request/${userId}`,
      {
        newFriendUserId: newFriendId,
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method unfriendUser
 * @desc Unfriend a user
 * @access private
 * @param {String} friendUserId the friend that the current user is unfriending
 * @returns {Array<User>}
 */
export const unfriendUser = async (friendUserId) => {
  try {
    const response = await api.post('/friends/unfriend-user', {
      friendUserId,
    });

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method sendFriendRequest
 * @desc send a friend request
 * @param {String} userReceivingId the user being sent the friend request
 * @param {String} userSendingId the current user
 * @returns {<{newFriendRequest: object, sentToUser: string, sentToUserId, string}>}}
 */
export const sendFriendRequest = async (userReceivingId, userSendingId) => {
  try {
    const response = await api.post(
      `/friend-requests/send-friend-request/${userReceivingId}/${userSendingId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method rejectFriendRequest
 * @desc reject a friend request
 * @param {String} userId the currentUser
 * @param {String} requestId the id of the friend request
 * @returns {<{removeFriendRequestId: string, friendRequests: Array}>}}
 */
export const rejectFriendRequest = async (userId, requestId) => {
  try {
    const response = await api.post(
      `/friend-requests/${userId}/reject-friend-request/${requestId}`
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method getUserFriendRequests
 * @desc get the current user friend requests
 * @access private
 * @returns {Array<{_user: string}>}
 */
export const getUserFriendRequests = async () => {
  try {
    const response = await api.get('/friend-requests');
    return response.data;
  } catch (error) {
    throw error;
  }
};

/**
 * @method checkFriendRequestSent
 * @desc used in SendFriendRequest.jsx which is inside UserProfile
 * @access private (takes user from jwt token)
 * @param {String} receiverId (the other using receiving the friend request)
 * @returns {Boolean} returns true or false based on if the sender (currentUser) has sent a friend request
 */
export const checkFriendRequestSent = async (receiverId) => {
  try {
    const response = await api.get(
      `/friend-requests/check-friend-request-sent/${receiverId}`
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
