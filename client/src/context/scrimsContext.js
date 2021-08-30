import React, { useState, createContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import useInterval from '../hooks/useInterval';
import { getAllScrims } from './../services/scrims';
import devLog from '../utils/devLog';

const ScrimsContext = createContext();

function ScrimsProvider({ children }) {
  const [scrims, setScrims] = useState([]);
  const [fetch, toggleFetch] = useState(false);
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
    devLog('fetching scrims (interval)');
    const scrimsData = await getAllScrims();
    setScrims(scrimsData);
  };

  // load scrims every 10 seconds
  const FETCH_INTERVAL = 10000;
  useInterval(loadScrims, FETCH_INTERVAL);

  return (
    <ScrimsContext.Provider
      value={{
        scrims,
        setScrims,
        fetch,
        toggleFetch,
        scrimsLoaded,
      }}>
      {children}
    </ScrimsContext.Provider>
  );
}

export { ScrimsContext, ScrimsProvider };
