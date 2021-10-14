//hooks
import { useState, useEffect, useMemo, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import useInterval from '../hooks/useInterval';
import useEffectExceptOnMount from './useEffectExceptOnMount';

// utils and services
import { getAllScrims, getScrimById } from './../services/scrims';
import devLog from '../utils/devLog';
import { showEarliestFirst, showLatestFirst } from '../utils/getSortedScrims';
import { compareDates } from '../utils/compareDates';

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

  useEffect(() => {
    if (pathname === '/' || pathname.includes('/scrims'))
      dispatch({ type: 'scrims/toggleFetch' });
    // re-set scrims on pathname change

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  return null;
};

const ONE_SCRIM_FETCH_INTERVAL = 5000;

// load one isBoxExpanded /detail page scrim every 5 seconds, also listens to reload click to re-fetch
export const useFetchScrimInterval = (isInDetail, isBoxExpanded, scrim) => {
  const [oneScrim, setOneScrim] = useState(scrim);

  const { toggleFetch } = useScrims();

  const scrimRef = useRef();
  const isBoxExpandedRef = useRef();
  const isInDetailRef = useRef();

  useEffect(() => {
    isBoxExpandedRef.current = isBoxExpanded;
    isInDetailRef.current = isInDetail;
    scrimRef.current = scrim;
  });

  const fetchScrimData = async () => {
    // if user is in detail just continue (dont worry about isBoxExpanded)
    // if user is in home and scrim isn't isBoxExpanded don't continue.
    if (!isBoxExpandedRef.current && !isInDetailRef.current) return;

    const gameEnded = oneScrim?.teamWon ?? false;

    // don't fetch on interval if game has ended, there is nothing that is going to change except maybe the image
    if (gameEnded) return;

    devLog(`fetching one scrim on interval (${scrimRef.current._id})`);

    const scrimData = await getScrimById(scrimRef.current._id);

    if (scrimData?.createdBy) {
      setOneScrim(scrimData);
    }
  };

  // if user clicks reload, re-fetch the scrim data
  // this only re-fetches the scrims that are visible in the page
  // don't run on mount
  useEffectExceptOnMount(() => {
    const fetchOnReloadClick = async () => {
      devLog(`fetching one scrim on toggleFetch (${scrimRef.current._id})`);

      const scrimData = await getScrimById(scrimRef.current._id);

      if (scrimData?.createdBy) {
        setOneScrim(scrimData);
      }
    };
    fetchOnReloadClick();

    //eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toggleFetch]);

  // and the main gaol of the hook, fetch on interval.
  useInterval(fetchScrimData, ONE_SCRIM_FETCH_INTERVAL);

  return [oneScrim, setOneScrim];
};
