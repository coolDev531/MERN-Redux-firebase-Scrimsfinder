const initialState = {
  conversations: [],
  // onlineUsers: [], // maybe in the future we will want all online users?
  onlineFriends: [],

  unseenMessages: [],

  playSFX: false, // boolean to juut retrigger playing sound

  msgNotificationVolume:
    JSON.parse(localStorage.getItem('scrimGymMessengerVolume')) ?? 25, // volume for new message notification
};

export default function messengerReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'messenger/setConversations': {
      return {
        ...state,
        conversations: payload,
      };
    }

    case 'messenger/addNewConversation': {
      return {
        ...state,
        conversations: [...state.conversations, payload],
      };
    }

    case 'messenger/setOnlineUsers': {
      return {
        ...state,
        onlineUsers: payload,
      };
    }

    case 'messenger/setOnlineFriends': {
      return {
        ...state,
        onlineFriends: payload,
      };
    }

    case 'messenger/setUnseenMessages': {
      return {
        ...state,
        unseenMessages: payload,
      };
    }

    case 'messenger/pushUnseenMessage': {
      // when a new unseen message has been received, play the notification SFX, also push it to unseen messages array
      return {
        ...state,
        unseenMessages: [...state.unseenMessages, payload],
        playSFX: !state.playSFX,
      };
    }

    case 'messenger/removeUnseenMessages': {
      return {
        ...state,
        unseenMessages: state.unseenMessages.filter(
          ({ _id }) => !payload.includes(_id),
        ),
      };
    }

    case 'messenger/messageSeen': {
      return {
        ...state,
        unseenMessages: state.unseenMessages.filter(
          ({ _id }) => payload !== _id,
        ),
      };
    }

    case 'messenger/setVolume': {
      localStorage.setItem('scrimGymMessengerVolume', JSON.stringify(payload));

      return {
        ...state,
        msgNotificationVolume: payload,
      };
    }

    default:
      return state;
  }
}
