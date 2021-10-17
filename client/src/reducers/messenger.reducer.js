const initialState = {
  conversations: [],
  onlineUsers: [],
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

    default:
      return state;
  }
}
