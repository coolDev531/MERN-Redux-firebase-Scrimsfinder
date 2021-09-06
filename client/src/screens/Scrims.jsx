import { useContext, useState, useEffect, Fragment, useMemo } from 'react';

// components
import Typography from '@material-ui/core/Typography';
import { showEarliestFirst, showLatestFirst } from '../utils/getSortedScrims';
import { InnerColumn, PageContent } from '../components/shared/PageComponents';
import ScrimSection from '../components/ScrimSection';
import Loading from '../components/shared/Loading';
import Navbar from '../components/shared/Navbar';

// utils
import { ScrimsContext } from '../context/scrimsContext';
import moment from 'moment';
import 'moment-timezone';
import { compareDateWithCurrentTime } from './../utils/compareDateWithCurrentTime';
import { useAuth } from './../context/currentUser';

const compareDates = (scrim) => {
  let currentTime = new Date().getTime();
  let gameStartTime = new Date(scrim.gameStartTime).getTime();

  if (currentTime < gameStartTime) {
    // if the currentTime is less than the game start time, that means the game didn't start
    return -1;
  } else if (currentTime > gameStartTime) {
    // if the current time is greater than the game start time, that means the game started
    return 1;
  } else {
    return 0;
  }
};

export default function Scrims() {
  const today = useMemo(() => moment(), []); // not necessary to use useMemo.

  const { currentUser } = useAuth();

  const { scrims, toggleFetch, scrimsLoaded } = useContext(ScrimsContext);

  const [filteredScrims, setFilteredScrims] = useState([]); // the array of filtered scrims (both scrimsDate and scrimsRegion)

  /**
   * @stateName {scrimsDate}
   * @return {Date} the date value to filter the scrims by
   */
  const [scrimsDate, setScrimsDate] = useState(today); // the date value for the date to filter scrims by

  /**
   * @stateName {scrimsRegion}
   * @return {String} the string value to filter the scrims by
   */
  const [scrimsRegion, setScrimsRegion] = useState(
    // the value for the region to filter scrims by
    () => currentUser?.region ?? 'NA'
  );

  // the hide/unhide toggle buttons on the drawer navbar.
  const [hidePreviousScrims, setHidePreviousScrims] = useState(false);
  const [hideCurrentScrims, setHideCurrentScrims] = useState(false);
  const [hideUpcomingScrims, setHideUpcomingScrims] = useState(false);

  const dateFilteredScrims = useMemo(
    () =>
      scrims.filter(({ gameStartTime }) => {
        //  if gameStartTime equals to the scrimsDate, show it.
        return (
          new Date(gameStartTime).toLocaleDateString() ===
          new Date(scrimsDate).toLocaleDateString()
        );
      }),
    // change date filtered scrims whenever scrims and scrimsDate cahnges.
    [scrims, scrimsDate]
  );

  const filteredScrimsByDateAndRegion = useMemo(
    () => dateFilteredScrims.filter((scrim) => scrim.region === scrimsRegion),
    // change filteredScrimsByDateAndRegion whenever dateFilteredScrims and scrimsRegion changes
    [dateFilteredScrims, scrimsRegion]
  );

  useEffect(() => {
    //  set filteredScrims to filteredScrimsByDateAndRegion.
    setFilteredScrims(filteredScrimsByDateAndRegion);
    // this runs everytime scrimsRegion and datefilteredScrims changes.
  }, [filteredScrimsByDateAndRegion]);

  let upcomingScrims = useMemo(
    () =>
      showEarliestFirst(filteredScrims).filter(
        // make sure the scrim game startTime
        (scrim) => compareDates(scrim) < 0
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

  useEffect(() => {
    // if scrimsDate < currentTime
    if (compareDateWithCurrentTime(scrimsDate) > 0) {
      setHideUpcomingScrims(true);
    } else {
      setHideUpcomingScrims(false);
    }
  }, [scrimsDate]);

  if (!scrimsLoaded) {
    return <Loading text="Loading Scrims..." />;
  }

  return (
    <>
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

      <PageContent>
        <div id="scrims-container">
          {filteredScrims.length > 0 ? (
            <>
              {/* CURRENT SCRIMS */}
              {!hideCurrentScrims && (
                <>
                  {currentScrims.length > 0 ? (
                    <>
                      <InnerColumn>
                        <div
                          style={{
                            marginBottom: '40px',
                            borderBottom: '1px solid white',
                          }}>
                          <Typography align="center" variant="h3" gutterBottom>
                            {currentScrims.length > 0 && 'Current scrims'}
                          </Typography>
                        </div>
                      </InnerColumn>

                      {currentScrims.map((scrim) => (
                        <Fragment key={scrim._id}>
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
                  <InnerColumn>
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
                  </InnerColumn>

                  {upcomingScrims.map((scrim) => (
                    <Fragment key={scrim._id}>
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
                    <InnerColumn style={{ marginTop: '20px' }}>
                      <div
                        style={{
                          marginBottom: '40px',
                          borderBottom: '1px solid white',
                        }}>
                        <Typography align="center" variant="h3">
                          Previous scrims
                        </Typography>
                      </div>
                    </InnerColumn>
                  ) : null}
                  {previousScrims.map((scrim) => (
                    <Fragment key={scrim._id}>
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
      </PageContent>
    </>
  );
}
