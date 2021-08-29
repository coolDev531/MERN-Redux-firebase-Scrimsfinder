import { Typography } from '@material-ui/core';
import { useContext, useState, useEffect, Fragment, useMemo } from 'react';
import ScrimSection from '../components/ScrimSection';
import Navbar from '../components/shared/Navbar';
import { CurrentUserContext } from '../context/currentUser';
import { ScrimsContext } from '../context/scrimsContext';
import { getAllScrims } from './../services/scrims';

export default function Scrims() {
  const today = useMemo(() => new Date().toLocaleDateString(), []);

  const [currentUser] = useContext(CurrentUserContext);

  const { scrims, setScrims, fetch, toggleFetch } = useContext(ScrimsContext);

  const [filteredScrims, setFilteredScrims] = useState([]); // the array of filtered scrims

  const [scrimsDate, setScrimsDate] = useState(today); // the value for the date to filter scrims by
  const [scrimsRegion, setScrimsRegion] = useState(
    // the value for the region to filter scrims by
    () => currentUser?.region ?? 'NA'
  );

  useEffect(() => {
    const fetchScrims = async () => {
      const dateFilteredScrims = scrims.filter(
        ({ gameStartTime }) =>
          new Date(gameStartTime).toLocaleDateString() === scrimsDate
      );

      const filteredScrimsByDateAndRegion = dateFilteredScrims.filter(
        (scrim) => scrim.region === currentUser.region
      );

      // set filtered scrims by date and region
      setFilteredScrims(filteredScrimsByDateAndRegion);
    };

    fetchScrims();
  }, [scrims, currentUser?.region, today, scrimsDate]);

  const dateFilteredScrims = useMemo(
    () =>
      scrims.filter(({ gameStartTime }) => {
        //  if gameStartTime equals to the scrimsDate, show it.
        return (
          new Date(gameStartTime).toLocaleDateString() ===
          new Date(scrimsDate).toLocaleDateString()
        );
      }),
    [scrims, scrimsDate]
  );

  useEffect(() => {
    const filteredScrimsByDateAndRegion = dateFilteredScrims.filter(
      (scrim) => scrim.region === scrimsRegion
    );

    setFilteredScrims(filteredScrimsByDateAndRegion);
    // this runs everytime scrimsRegion and datefilteredScrims changes.
  }, [scrims, scrimsRegion, dateFilteredScrims]);

  return (
    <div>
      <Navbar
        scrimsRegion={scrimsRegion}
        setScrimsRegion={setScrimsRegion}
        scrimsDate={scrimsDate}
        setScrimsDate={setScrimsDate}
        toggleFetch={toggleFetch}
        showDropdowns
      />
      <div className="page-break" />

      <main className="page-content">
        <div id="scrims-container">
          {filteredScrims.length > 0 ? (
            filteredScrims.map((scrim, idx) => (
              <Fragment key={idx}>
                <ScrimSection scrim={scrim} />
                <div className="page-break" />
              </Fragment>
            ))
          ) : (
            <>
              <Typography align="center" variant="h2" component="h1">
                No Scrims Found
              </Typography>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
