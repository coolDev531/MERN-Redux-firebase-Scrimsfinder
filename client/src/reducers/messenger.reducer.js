const initialState = {
  conversations: [],
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

    default:
      return state;
  }
}
