import { BG_IMAGES } from './../utils/imageMaps';

const initialState = {
  appBackground: `url(${BG_IMAGES['Summoners Rift']})`,
  appBgBlur: 'blur(20px)',

  notificationsOpen: false,
  friendRequestsOpen: false,
  friendsModalOpen: false,
};

export default function generalReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'general/setAppBackground': {
      return {
        ...state,
        appBackground: `url(${BG_IMAGES[payload]})`,
      };
    }

    case 'general/setAppBgBlur': {
      return {
        ...state,
        appBgBlur: `blur(${payload}px)`,
      };
    }

    case 'general/resetAppBackground': {
      return {
        ...state,
        appBackground: `url(${BG_IMAGES['Summoners Rift']})`,
        appBgBlur: 'blur(20px)',
      };
    }

    case 'general/openNotifications': {
      return {
        ...state,
        notificationsOpen: true,
      };
    }

    case 'general/closeNotifications': {
      return {
        ...state,
        notificationsOpen: false,
      };
    }

    case 'general/openFriendRequests': {
      return {
        ...state,
        friendRequestsOpen: true,
      };
    }

    case 'general/closeFriendRequests': {
      return {
        ...state,
        friendRequestsOpen: false,
      };
    }

    case 'general/openFriendsModal': {
      return {
        ...state,
        friendsModalOpen: { friends: payload.friends, user: payload.user },
      };
    }

    case 'general/closeFriendsModal': {
      return {
        ...state,
        friendsModalOpen: false,
      };
    }

    default:
      return state;
  }
}
