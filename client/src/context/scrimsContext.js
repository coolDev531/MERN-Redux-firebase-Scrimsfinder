import React, { useState, createContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getAllScrims } from './../services/scrims';

const ScrimsContext = createContext();

function ScrimsProvider({ children }) {
  const [scrims, setScrims] = useState([]);
  const [fetch, toggleFetch] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const fetchScrims = async () => {
      console.log('fetching scrims');
      const scrimsData = await getAllScrims();

      setScrims(scrimsData);
    };

    fetchScrims();
  }, [fetch, pathname]);

  return (
    <ScrimsContext.Provider value={{ scrims, setScrims, fetch, toggleFetch }}>
      {children}
    </ScrimsContext.Provider>
  );
}

export { ScrimsContext, ScrimsProvider };
