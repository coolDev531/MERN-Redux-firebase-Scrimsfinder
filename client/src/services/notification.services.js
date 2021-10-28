import api from './apiConfig';

export const getUserNotifications = async () => {
  try {
    const response = await api.get('/notifications/user-notifications/');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const pushUserNotification = async (userId, newNotification) => {
  try {
    const response = await api.post(
      `/notifications/push-user-notification/${userId}`,
      newNotification
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteOneUserNotification = async (notificationId) => {
  try {
    const response = await api.post(`
/notifications/remove-user-notification/${notificationId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteAllUserNotifications = async (userId) => {
  try {
    const response = await api.post(`
/notifications/remove-all-user-notifications/${userId}`);
    return response.data;
  } catch (error) {
    throw error;
  }
};
