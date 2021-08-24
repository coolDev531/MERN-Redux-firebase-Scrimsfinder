import { useContext, useState, useEffect, Fragment, useMemo } from 'react';
import ScrimSection from '../components/ScrimSection';
import Navbar from '../components/shared/Navbar';
import { CurrentUserContext } from '../context/currentUser';
import { getAllScrims } from './../services/scrims';

export default function Scrims() {
  const today = useMemo(() => new Date().toLocaleDateString(), []);

  const [currentUser] = useContext(CurrentUserContext);
  const [scrims, setScrims] = useState([]);
  const [scrimsFilterDate, setScrimsFilterDate] = useState(today);
  const [filteredScrims, setFilteredScrims] = useState([]);
  const [scrimsRegion, setScrimsRegion] = useState(
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
          new Date(gameStartTime).toLocaleDateString() === scrimsFilterDate
      );

      const filteredScrimsByDateAndRegion = dateFilteredScrims.filter(
        (scrim) => scrim.region === currentUser.region
      );

      setFilteredScrims(filteredScrimsByDateAndRegion);
    };

    fetchScrims();
  }, [fetch, currentUser?.region, today, scrimsFilterDate]);

  const dateFilteredScrims = useMemo(
    () =>
      scrims.filter(
        ({ gameStartTime }) =>
          new Date(gameStartTime).toLocaleDateString() === scrimsFilterDate
      ),
    [scrims, scrimsFilterDate]
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
