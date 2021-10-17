export default function messengerReducer(state = null, action) {
  const { type, payload } = action;

  switch (type) {
    case 'socket/setSocket': {
      return {
        socket: payload,
      };
    }

    default:
      return state;
  }
}
