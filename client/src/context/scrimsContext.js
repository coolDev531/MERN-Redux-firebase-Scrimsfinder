import React, { useState, createContext, useEffect, useContext } from 'react';
import { useLocation } from 'react-router-dom';
import useToggle from './../hooks/useToggle';
import useInterval from '../hooks/useInterval';
import { getAllScrims } from './../services/scrims';
import devLog from '../utils/devLog';

const ScrimsContext = createContext();

export const useScrims = () => useContext(ScrimsContext);

function ScrimsProvider({ children }) {
  const [scrims, setScrims] = useState([]);
  const [fetch, toggleFetch] = useToggle();
  const [scrimsLoaded, setScrimsLoaded] = useState(false);

  const { pathname } = useLocation();

  useEffect(() => {
    const fetchScrims = async () => {
      devLog('fetching scrims');
      const scrimsData = await getAllScrims();
      setScrims(scrimsData);
      setScrimsLoaded(true);
    };

    fetchScrims();
  }, [fetch, pathname]);

  const loadScrims = async () => {
    if (pathname !== '/sign-up') {
      devLog('fetching scrims (interval)');
      const scrimsData = await getAllScrims();
      setScrims(scrimsData);
    }
  };

  // load scrims every 10 seconds
  const FETCH_INTERVAL = 10000;
  useInterval(loadScrims, FETCH_INTERVAL);

  const fetchScrims = () => toggleFetch();

  const value = {
    scrims,
    setScrims,
    fetch,
    toggleFetch,
    scrimsLoaded,
    fetchScrims,
  };

  return (
    <ScrimsContext.Provider value={value}>{children}</ScrimsContext.Provider>
  );
}

export { ScrimsContext, ScrimsProvider };
