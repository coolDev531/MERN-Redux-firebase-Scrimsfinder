import { useContext, useState, useEffect, Fragment, useMemo } from 'react';
import ScrimSection from '../components/ScrimSection';
import Navbar from '../components/shared/Navbar';
import { CurrentUserContext } from '../context/currentUser';
import { getAllScrims } from './../services/scrims';

export default function Scrims() {
  const today = useMemo(() => new Date().toLocaleDateString(), []);

  const [currentUser] = useContext(CurrentUserContext);

  const [scrims, setScrims] = useState([]);
  const [filteredScrims, setFilteredScrims] = useState([]); // the array of filtered scrims

  const [scrimsDate, setScrimsDate] = useState(today); // the value for the date to filter scrims by
  const [scrimsRegion, setScrimsRegion] = useState(
    // the value for the region to filter scrims by
    () => currentUser?.region ?? 'NA'
  );
  const [fetch, toggleFetch] = useState(false);

  useEffect(() => {
    const fetchScrims = async () => {
      console.log('fetching scrims');
      const scrimsData = await getAllScrims();

      setScrims(scrimsData);

      const dateFilteredScrims = scrimsData.filter(
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
  }, [fetch, currentUser?.region, today, scrimsDate]);

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
  }, [scrims, scrimsRegion, dateFilteredScrims]);

  let userData = {
    ...currentUser,
  };

  // now for local storage, might not need in future
  delete userData.ADMIN_SECRET_KEY;

  return (
    <div>
      <Navbar
        scrimsRegion={scrimsRegion}
        setScrimsRegion={setScrimsRegion}
        onSelectRegion={(region) =>
          setFilteredScrims(
            dateFilteredScrims.filter((scrim) => scrim.region === region)
          )
        }
        scrimsDate={scrimsDate}
        setScrimsDate={setScrimsDate}
        toggleFetch={toggleFetch}
      />
      <div className="page-break" />

      <div id="scrims-container">
        {filteredScrims.map((scrim, idx) => (
          <Fragment key={idx}>
            <ScrimSection
              scrim={scrim}
              idx={idx}
              toggleFetch={toggleFetch}
              setScrims={setScrims}
            />
            <div className="page-break" />
          </Fragment>
        ))}
      </div>
    </div>
  );
}
