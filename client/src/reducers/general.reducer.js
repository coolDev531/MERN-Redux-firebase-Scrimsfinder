import { BG_IMAGES } from './../utils/imageMaps';

const initialState = {
  appBackground: `url(${BG_IMAGES['Summoners Rift']})`,
  appBgBlur: 'blur(20px)',

  notificationsOpen: false,
  friendRequestsOpen: false,
  friendsModalOpen: false,

  messengerOpen: false,

  moreOptionsModalOpen: false,

  chatRoomOpen: { conversation: null, isOpen: false, extraTitle: '' }, // for friend chat room

  scrimChatRoomOpen: {
    conversation: null,
    isOpen: false,
    extraTitle: '',
    scrimId: '',
  }, // for scrim chat room

  conversationCreateModalOpen: {
    receiverUser: null,
    isOpen: false,
  },
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
        friendsModalOpen: {
          user: payload.user,
          bool: true,
        },
      };
    }

    case 'general/closeFriendsModal': {
      return {
        ...state,
        friendsModalOpen: false,
      };
    }

    case 'general/openOtherOptionsModal': {
      return {
        ...state,
        moreOptionsModalOpen: true,
      };
    }

    case 'general/closeOtherOptionsModal': {
      return {
        ...state,
        moreOptionsModalOpen: false,
      };
    }

    case 'general/openMessenger': {
      return {
        ...state,
        messengerOpen: true,
      };
    }

    case 'general/closeMessenger': {
      return {
        ...state,
        messengerOpen: false,
      };
    }

    case 'general/chatRoomOpen': {
      return {
        ...state,
        chatRoomOpen: payload,
      };
    }

    case 'general/closeChatRoom': {
      return {
        ...state,
        chatRoomOpen: {
          conversation: null,
          isOpen: false,
          extraTitle: '',
        },
      };
    }

    case 'general/scrimChatRoomOpen': {
      return {
        ...state,
        scrimChatRoomOpen: payload,
      };
    }

    case 'general/closeScrimChatRoom': {
      return {
        ...state,
        scrimChatRoomOpen: {
          conversation: null,
          isOpen: false,
          extraTitle: '',
          scrimId: '',
        },
      };
    }

    case 'general/conversationCreateModalOpen': {
      return {
        ...state,
        conversationCreateModalOpen: payload,
      };
    }

    case 'general/conversationCreateModalClose': {
      return {
        ...state,
        conversationCreateModalOpen: { isOpen: false, receiverUser: null },
      };
    }

    default:
      return state;
  }
}
