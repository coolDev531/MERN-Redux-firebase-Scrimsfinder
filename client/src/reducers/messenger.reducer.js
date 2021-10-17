const initialState = {
  conversations: [],
  // onlineUsers: [], // maybe in the future we will want all online users?
  onlineFriends: [],
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

    default:
      return state;
  }
}
