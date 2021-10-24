import moment from 'moment';

const initialState = {
  scrims: [],
  filteredScrims: [], // filtered scrims by date and region
  scrimsLoaded: false,

  scrimsDate: moment(), // the date value to filter the scrims by

  dateScrims: [],
  scrimsRegion: 'NA',

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
      const dateFilteredScrims = state.scrims.filter(({ gameStartTime }) => {
        //  if gameStartTime equals to the scrimsDate, show it.
        return (
          new Date(gameStartTime).toLocaleDateString() ===
          new Date(state.scrimsDate).toLocaleDateString()
        );
      });

      const filteredScrimsByDateAndRegion = dateFilteredScrims.filter(
        (scrim) => scrim.region === state.scrimsRegion
      );

      const filteredScrims = filteredScrimsByDateAndRegion.filter(
        (scrim) => !scrim.isPrivate
      );

      return {
        ...state,
        filteredScrims: filteredScrims, // date and region filtered scrims
      };
    }

    case 'scrims/deleteScrim': {
      return {
        ...state,
        scrims: state.scrims.filter(
          (scrim) => String(scrim._id) !== String(payload._id)
        ),
        filteredScrims: state.filteredScrims.filter(
          (scrim) => String(scrim._id) !== String(payload._id)
        ),
      };
    }

    case 'scrims/updateScrim': {
      return {
        ...state,
        scrims: state.scrims.map((scrim) =>
          String(scrim._id) === String(payload._id) ? payload : scrim
        ),

        filteredScrims: state.filteredScrims.map((scrim) =>
          String(scrim._id) === String(payload._id) ? payload : scrim
        ),
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
