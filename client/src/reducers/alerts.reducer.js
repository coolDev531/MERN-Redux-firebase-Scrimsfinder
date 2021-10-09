const initialState = {
  alerts: [],
  currentAlert: null,
};

export default function alertsReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'alerts/setCurrentAlert': {
      return {
        ...state,
        currentAlert: payload,
      };
    }

    default:
      return state;
  }
}
