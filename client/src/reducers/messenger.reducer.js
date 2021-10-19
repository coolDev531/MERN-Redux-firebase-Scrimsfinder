const initialState = {
  conversations: [],
  // onlineUsers: [], // maybe in the future we will want all online users?
  onlineFriends: [],

  unseenMessages: [],

  playSFX: false, // boolean to juut retrigger playing sound
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
          ({ _id }) => !payload.includes(_id)
        ),
      };
    }
    // little notification sound (check MessengerButton component )
    case 'messenger/playSFX': {
      return {
        ...state,
        playSFX: !state.playSFX,
      };
    }

    default:
      return state;
  }
}
