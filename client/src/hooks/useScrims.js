//hooks
import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';

// utils and services
import { getAllScrims } from '../services/scrims.services';
import devLog from '../utils/devLog';
import { showEarliestFirst, showLatestFirst } from '../utils/getSortedScrims';
import { compareDates } from '../utils/compareDates';
import useSocket from './useSocket';

export default function useScrims() {
  return useSelector(({ scrims }) => scrims);
}

export function useScrimsActions() {
  const dispatch = useDispatch();

  const setScrims = (newScrimsValue) =>
    dispatch({ type: 'scrims/setScrims', payload: newScrimsValue });

  const fetchScrims = async () => {
    const scrimsData = await getAllScrims();
    devLog('fetchedScrims on action');
    dispatch({ type: 'scrims/fetchScrims', payload: scrimsData });
  };

  return {
    setScrims,
    fetchScrims,
  };
}

// sets the scrim region to the users scrim region
export const useSetScrimsRegion = () => {
  const [{ scrimsLoaded, scrimsRegion }, currentUser] = useSelector(
    ({ scrims, auth }) => [scrims, auth?.currentUser]
  );

  const dispatch = useDispatch();

  useEffect(() => {
    if (!currentUser?.region) return; // don't run this when we don't have a user yet.

    // if the scrims region is already equal to the currentUsers region, don't proceed
    if (scrimsRegion === currentUser?.region) return;

    // if the scrims have loaded, but the users region is already equal to the scrims region return.
    if (scrimsLoaded && scrimsRegion === currentUser?.region) return;

    // set the scrims region on mount when user is available, or when user changes his region in the settings.
    dispatch({ type: 'scrims/setScrimsRegion', payload: currentUser?.region });

    // eslint-disable-next-line
  }, [currentUser?.region, scrimsLoaded]);

  return null;
};

// separate these into a separate hook to avoid these values being recreated.
export const useFilteredScrims = () => {
  const { scrims, scrimsDate, scrimsRegion, filteredScrims } = useSelector(
    ({ scrims }) => scrims
  );

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch({
      type: 'scrims/setFilteredScrims',
    });

    // eslint-disable-next-line
  }, [scrimsDate, scrimsRegion, scrims]);

  let upcomingScrims = useMemo(
    () =>
      // showEarliestFirst is a sorting method. (getSortedScrims.js)
      showEarliestFirst(filteredScrims).filter(
        (scrim) => compareDates(scrim) < 0 // game didn't start
      ),
    [filteredScrims]
  );

  let previousScrims = useMemo(
    () =>
      // showLatestFirst is a sorting method.
      showLatestFirst(
        filteredScrims.filter(
          // if the scrim has a winning team then it ended
          (scrim) => compareDates(scrim) > 0 && scrim.teamWon
        )
      ),
    [filteredScrims]
  );

  let currentScrims = useMemo(
    () =>
      showEarliestFirst(
        filteredScrims.filter(
          // scrims that have started but didn't end (don't have winning team)
          (scrim) => compareDates(scrim) > 0 && !scrim.teamWon
        )
      ),
    [filteredScrims]
  );

  return {
    currentScrims,
    previousScrims,
    upcomingScrims,
    filteredScrims,
  };
};

// hook to fetch scrims
export const useFetchScrims = () => {
  const dispatch = useDispatch();
  const { pathname } = useLocation();

  useEffect(() => {
    const fetchScrims = async () => {
      devLog('fetching scrims');
      const scrimsData = await getAllScrims();
      dispatch({ type: 'scrims/fetchScrims', payload: scrimsData });
    };

    fetchScrims();

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

export const useScrimSocket = (scrimData, isBoxExpanded) => {
  const { socket } = useSocket();
  const [scrim, setScrim] = useState(scrimData);

  const isBoxExpandedRef = useRef();

  useEffect(() => {
    isBoxExpandedRef.current = isBoxExpanded;
  }, [isBoxExpanded]);

  useEffect(() => {
    socket.on('getScrimTransaction', async (updatedScrim) => {
      // if the boxExpandedScrim (it will be set to scrim id), is not equal to the scrim id in the socket emit, we won't continue
      if (isBoxExpandedRef.current !== updatedScrim?._id) return;
      devLog('getScrimTransaction socket, updated scrim: ', updatedScrim);
      setScrim(updatedScrim);
    });
  }, [socket]);

  return [scrim, setScrim];
};
