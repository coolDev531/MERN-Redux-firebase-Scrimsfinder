export default function messengerReducer(
  state = {
    socket: null,
  },
  action
) {
  const { type, payload } = action;

  switch (type) {
    case 'socket/setSocket': {
      return {
        ...state,
        socket: payload,
      };
    }

    default:
      return state;
  }
}
