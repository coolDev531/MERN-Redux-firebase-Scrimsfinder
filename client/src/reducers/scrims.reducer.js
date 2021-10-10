import moment from 'moment';
import { showEarliestFirst } from '../utils/getSortedScrims';
import { showLatestFirst } from './../utils/getSortedScrims';

const initialState = {
  scrims: [],
  filteredScrims: [], // filtered scrims by date and region
  scrimsLoaded: false,
  fetch: false,

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
        scrims: state.scrims.filter((scrim) => scrim._id !== payload._id),
      };
    }

    case 'scrims/updateScrim': {
      return {
        ...state,
        scrims: state.scrims.map((scrim) =>
          scrim._id === payload._id ? payload : scrim
        ),
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

const getDateFilteredScrims = (state) =>
  state.scrims.filter(({ gameStartTime }) => {
    //  if gameStartTime equals to the scrimsDate, show it.
    return (
      new Date(gameStartTime).toLocaleDateString() ===
      new Date(state.scrimsDate).toLocaleDateString()
    );
  });

const filteredScrimsByDateAndRegion = (state) =>
  getDateFilteredScrims(state).filter(
    (scrim) => scrim.region === state.scrimsRegion
  );

export const getFilteredScrims = (state) =>
  filteredScrimsByDateAndRegion(state).filter((scrim) => !scrim.isPrivate);

// compare scrim start time with now.
const compareDates = (scrim) => {
  let currentTime = new Date().getTime();
  let gameStartTime = new Date(scrim.gameStartTime).getTime();

  if (currentTime < gameStartTime) {
    // if the currentTime is less than the game start time, that means the game didn't start (game is in future)
    return -1;
  } else if (currentTime > gameStartTime) {
    // if the current time is greater than the game start time, that means the game started (game is in past)
    return 1;
  } else {
    return 0;
  }
};

export const getUpcomingScrims = (state) =>
  // showEarliestFirst is a sorting method. (getSortedScrims.js)
  showEarliestFirst(getFilteredScrims(state)).filter(
    (scrim) => compareDates(scrim) < 0 // game didn't start
  );

export const getPreviousScrims = (state) =>
  // showLatestFirst is a sorting method.
  showLatestFirst(
    getFilteredScrims(state).filter(
      // if the scrim has a winning team then it ended
      (scrim) => compareDates(scrim) > 0 && scrim.teamWon
    )
  );

export const getCurrentScrims = (state) =>
  showEarliestFirst(
    getFilteredScrims(state).filter(
      // scrims that have started but didn't end (don't have winning team)
      (scrim) => compareDates(scrim) > 0 && !scrim.teamWon
    )
  );
