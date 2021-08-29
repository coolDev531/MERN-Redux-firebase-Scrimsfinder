import React, { useState, createContext, useEffect } from 'react';
import { getAllScrims } from './../services/scrims';

const ScrimsContext = createContext();

function ScrimsProvider({ children }) {
  const [scrims, setScrims] = useState([]);
  const [fetch, toggleFetch] = useState(false);

  useEffect(() => {
    const fetchScrims = async () => {
      console.log('fetching scrims');
      const scrimsData = await getAllScrims();

      setScrims(scrimsData);
    };

    fetchScrims();
  }, [fetch]);

  return (
    <ScrimsContext.Provider value={{ scrims, setScrims, fetch, toggleFetch }}>
      {children}
    </ScrimsContext.Provider>
  );
}

export { ScrimsContext, ScrimsProvider };
