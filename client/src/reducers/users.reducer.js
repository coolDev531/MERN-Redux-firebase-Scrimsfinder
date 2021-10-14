const initialState = {
  allUsers: [],
  usersLoaded: false,
  usersSearchValue: '',
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

    case 'users/setSearch': {
      return {
        ...state,
        usersSearchValue: payload,
      };
    }

    default:
      return state;
  }
}
