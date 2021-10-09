import moment from 'moment';

const initialState = {
  scrims: [],
  filteredScrims: [], // filtered scrims by date and region
  scrimsLoaded: false,
  fetch: false,

  scrimsRegion: 'NA', // the region value to filter the scrims by
  scrimsDate: moment(), // the date value to filter the scrims by

  // the show toggle buttons on the drawer navbar.
  showPreviousScrims: true,
  showCurrentScrims: true,
  showUpcomingScrims: true,
};

export default function scrimsReducer(state = initialState, action) {
  const { type, payload } = action;

  switch (type) {
    case 'scrims/fetchScrims': {
      return {
        ...state,
        scrims: payload,
        scrimsLoaded: true,
      };
    }

    case 'scrims/fetchScrimsInterval': {
      return {
        ...state,
        scrims: payload,
      };
    }

    case 'scrims/setScrims': {
      return {
        ...state,
        scrims: payload,
      };
    }

    case 'scrims/setFilteredScrims': {
      return {
        ...state,
        filteredScrims: payload, // date and region filtered scrims
      };
    }

    case 'scrims/deleteScrim': {
      return {
        ...state,
        scrims: state.scrims.filter((scrim) => scrim._id !== payload._id),
      };
    }

    case 'scrims/toggleFetch': {
      return {
        ...state,
        fetch: !state.fetch,
      };
    }

    case 'scrims/setScrimsRegion': {
      return {
        ...state,
        scrimsRegion: payload,
      };
    }

    case 'scrims/setScrimsDate': {
      return {
        ...state,
        scrimsDate: payload,
      };
    }

    // toggle show scrims button on navbar
    case 'scrims/toggleHideScrims': {
      return {
        ...state,
        [payload]: !state[payload],
      };
    }

    case 'scrims/setShowScrims': {
      const { showPrevious, showCurrent, showUpcoming } = action;

      return {
        ...state,
        showPreviousScrims: showPrevious ?? state.showPreviousScrims,
        showCurrentScrims: showCurrent ?? state.showCurrentScrims,
        showUpcomingScrims: showUpcoming ?? state.showUpcomingScrims,
      };
    }

    default:
      return state;
  }
}
