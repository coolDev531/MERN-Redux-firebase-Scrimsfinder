import { useContext, useState, useEffect, Fragment, useMemo } from 'react';
import ScrimSection from '../components/ScrimSection';
import Navbar from '../components/shared/Navbar';
import { CurrentUserContext } from '../context/currentUser';
import { getAllScrims } from './../services/scrims';

export default function Scrims() {
  const [currentUser] = useContext(CurrentUserContext);
  const [scrims, setScrims] = useState([]);
  const [filteredScrims, setFilteredScrims] = useState([]);
  const [scrimsRegion, setScrimsRegion] = useState(
    () => currentUser?.region ?? 'NA'
  );
  const [fetch, toggleFetch] = useState(false);

  const today = useMemo(() => new Date().toLocaleDateString(), []);

  useEffect(() => {
    const fetchScrims = async () => {
      console.log('fetching scrims');
      const scrimsData = await getAllScrims();

      setScrims(scrimsData);

      const todaysScrims = scrimsData.filter(
        ({ gameStartTime }) =>
          new Date(gameStartTime).toLocaleDateString() === today
      );

      const filteredScrimsByDateAndRegion = todaysScrims.filter(
        (scrim) => scrim.scrimRegion === currentUser.region
      );

      setFilteredScrims(filteredScrimsByDateAndRegion);
    };

    fetchScrims();
  }, [fetch, currentUser?.region, today]);

  const todaysScrims = useMemo(
    () =>
      scrims.filter(
        ({ gameStartTime }) =>
          new Date(gameStartTime).toLocaleDateString() === today
      ),
    [scrims, today]
  );

  useEffect(() => {
    const todaysScrims = scrims.filter(
      ({ gameStartTime }) =>
        new Date(gameStartTime).toLocaleDateString() === today
    );

    const filteredScrimsByDateAndRegion = todaysScrims.filter(
      (scrim) => scrim.scrimRegion === scrimsRegion
    );

    setFilteredScrims(filteredScrimsByDateAndRegion);
  }, [scrims, scrimsRegion, today]);

  let userData = {
    ...currentUser,
  };

  // now for local storage, might not need in future
  delete userData.ADMIN_SECRET_KEY;

  return (
    <div>
      <Navbar
        todaysScrims={todaysScrims}
        scrimsRegion={scrimsRegion}
        setScrimsRegion={setScrimsRegion}
        onSelectRegion={(region) =>
          setFilteredScrims(
            todaysScrims.filter((scrim) => scrim.scrimRegion === region)
          )
        }
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
