const initialState = {
  allUsers: [],
  usersLoaded: false,
};

export default function usersReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'users/fetchUsers': {
      return {
        ...state,
        allUsers: payload,
        usersLoaded: true,
      };
    }
    default:
      return state;
  }
}
