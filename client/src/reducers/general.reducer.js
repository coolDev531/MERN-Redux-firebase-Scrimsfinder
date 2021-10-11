import { BG_IMAGES } from './../utils/imageMaps';

const initialState = {
  appBackground: `url(${BG_IMAGES['Summoners Rift']})`,
};

export default function generalReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'general/setAppBackground': {
      return {
        ...state,
        appBackground: `url(${BG_IMAGES[payload]})`,
      };
    }

    default:
      return state;
  }
}
