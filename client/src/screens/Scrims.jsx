import { Typography } from '@material-ui/core';
import { useContext, useState, useEffect, Fragment, useMemo } from 'react';
import ScrimSection from '../components/ScrimSection';
import Loading from '../components/shared/Loading';
import Navbar from '../components/shared/Navbar';
import { CurrentUserContext } from '../context/currentUser';
import { ScrimsContext } from '../context/scrimsContext';
import { showEarliestFirst, showLatestFirst } from '../utils/getSortedScrims';
import moment from 'moment';
import 'moment-timezone';

const compareDates = (scrim) => {
  let currentTime = new Date().toISOString();
  let gameStartTime = new Date(scrim.gameStartTime).getTime();
  let now = new Date(currentTime).getTime();

  if (gameStartTime < now) {
    return -1;
  } else if (gameStartTime > now) {
    return 1;
  } else {
    return 0;
  }
};

export default function Scrims() {
  const today = useMemo(() => moment(), []);

  const [currentUser] = useContext(CurrentUserContext);

  const { scrims, toggleFetch, scrimsLoaded } = useContext(ScrimsContext);

  const [filteredScrims, setFilteredScrims] = useState([]); // the array of filtered scrims

  const [scrimsDate, setScrimsDate] = useState(today); // the value for the date to filter scrims by

  const [hidePreviousScrims, setHidePreviousScrims] = useState(false);
  const [hideCurrentScrims, setHideCurrentScrims] = useState(false);
  const [hideUpcomingScrims, setHideUpcomingScrims] = useState(false);

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

  const filteredScrimsByDateAndRegion = useMemo(
    () => dateFilteredScrims.filter((scrim) => scrim.region === scrimsRegion),
    [dateFilteredScrims, scrimsRegion]
  );

  useEffect(() => {
    setFilteredScrims(filteredScrimsByDateAndRegion);
    // this runs everytime scrimsRegion and datefilteredScrims changes.
  }, [filteredScrimsByDateAndRegion]);

  let upcomingScrims = useMemo(
    () =>
      showEarliestFirst(filteredScrims).filter(
        (scrim) => compareDates(scrim) > -1
      ),
    [filteredScrims]
  );

  let previousScrims = useMemo(
    () =>
      showLatestFirst(
        filteredScrims.filter(
          // if the scrim has a winning team then it ended
          (scrim) => compareDates(scrim) < 1 && scrim.teamWon
        )
      ),
    [filteredScrims]
  );

  let currentScrims = useMemo(
    () =>
      showEarliestFirst(
        filteredScrims.filter(
          // scrims that have started but didn't end (don't have winning team)
          (scrim) => compareDates(scrim) < 1 && !scrim.teamWon
        )
      ),
    [filteredScrims]
  );

  if (!scrimsLoaded) {
    return <Loading text="Loading Scrims..." />;
  }

  return (
    <div>
      <Navbar
        scrimsRegion={scrimsRegion}
        setScrimsRegion={setScrimsRegion}
        scrimsDate={scrimsDate}
        setScrimsDate={setScrimsDate}
        toggleFetch={toggleFetch}
        showDropdowns
        showCheckboxes
        hideProps={{
          hidePreviousScrims,
          hideCurrentScrims,
          hideUpcomingScrims,
          setHidePreviousScrims,
          setHideCurrentScrims,
          setHideUpcomingScrims,
        }}
      />
      <div className="page-break" />

      <main className="page-content">
        <div id="scrims-container" className="page-section">
          {filteredScrims.length > 0 ? (
            <>
              {/* CURRENT SCRIMS */}
              {!hideCurrentScrims && (
                <>
                  {currentScrims.length > 0 ? (
                    <>
                      <div className="inner-column">
                        <div
                          style={{
                            marginBottom: '40px',
                            borderBottom: '1px solid white',
                          }}>
                          <Typography align="center" variant="h3" gutterBottom>
                            {currentScrims.length > 0 && 'Current scrims'}
                          </Typography>
                        </div>
                      </div>

                      {currentScrims.map((scrim, idx) => (
                        <Fragment key={idx}>
                          <ScrimSection scrim={scrim} />
                          <div className="page-break" />
                        </Fragment>
                      ))}
                      <div className="page-break" />
                    </>
                  ) : null}
                </>
              )}
              {/* CURRENT SCRIMS END */}

              {/* UPCOMING SCRIMS */}
              {!hideUpcomingScrims && (
                <>
                  <div className="inner-column">
                    <div
                      style={{
                        marginBottom: '40px',
                        borderBottom: '1px solid white',
                      }}>
                      <Typography align="center" variant="h3" gutterBottom>
                        {upcomingScrims.length > 0
                          ? 'Upcoming scrims'
                          : 'No upcoming scrims'}
                      </Typography>
                    </div>
                  </div>

                  {upcomingScrims.map((scrim, idx) => (
                    <Fragment key={idx}>
                      <ScrimSection scrim={scrim} />
                      <div className="page-break" />
                    </Fragment>
                  ))}
                  <div className="page-break" />
                </>
              )}
              {/* UPCOMING SCRIMS END */}

              {/* PREVIOUS SCRIMS */}
              {!hidePreviousScrims && (
                <>
                  {previousScrims.length > 0 ? (
                    <div className="inner-column" style={{ marginTop: '20px' }}>
                      <div
                        style={{
                          marginBottom: '40px',
                          borderBottom: '1px solid white',
                        }}>
                        <Typography align="center" variant="h3">
                          Previous scrims
                        </Typography>
                      </div>
                    </div>
                  ) : null}
                  {previousScrims.map((scrim, idx) => (
                    <Fragment key={idx}>
                      <ScrimSection scrim={scrim} />
                      <div className="page-break" />
                    </Fragment>
                  ))}
                </>
              )}
            </>
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
