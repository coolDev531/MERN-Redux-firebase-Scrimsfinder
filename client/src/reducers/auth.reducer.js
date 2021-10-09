const initialState = {
  currentUser: null,
  isVerifyingUser: true,
};

export default function authReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'auth/setCurrentUser': {
      return {
        ...state,
        currentUser: payload,
      };
    }

    case 'auth/logout': {
      return { ...state, currentUser: null };
    }

    case 'auth/setIsVerifyingUser': {
      return {
        ...state,
        isVerifyingUser: payload,
      };
    }

    default:
      return state;
  }
}
