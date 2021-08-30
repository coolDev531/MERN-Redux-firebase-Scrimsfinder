import { useContext, useEffect, useState, useMemo } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { useScrimSectionStyles } from '../styles/scrimSection.styles';

//  components
import CountdownTimer from './CountdownTimer';
import ScrimTeamList from './ScrimTeamList';
import Moment from 'react-moment';
import AdminArea from './shared/AdminArea';
import { Box, Button, Grid } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
// utils / services
import {
  updateScrim,
  deleteScrim,
  removeCasterFromScrim,
} from '../services/scrims';
import { copyTextToClipboard } from '../utils/copyToClipboard';

// icons
import ShareIcon from '@material-ui/icons/Share';
import { ScrimsContext } from '../context/scrimsContext';
import { insertCasterInScrim } from './../services/scrims';

const compareDates = (scrim) => {
  let currentTime = new Date().getTime();
  let gameStartTime = new Date(scrim.gameStartTime).getTime();

  if (currentTime < gameStartTime) {
    return -1;
  } else if (currentTime > gameStartTime) {
    return 1;
  } else {
    return 0;
  }
};

const MAX_CASTER_AMOUNT = 2;

export default function ScrimSection({ scrim, isInDetail }) {
  const { toggleFetch, setScrims } = useContext(ScrimsContext);
  const [currentUser] = useContext(CurrentUserContext);
  const [playerEntered, setPlayerEntered] = useState(false);
  const [casterEntered, setCasterEntered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const classes = useScrimSectionStyles();
  const history = useHistory();
  const { teamOne, teamTwo, casters } = scrim;

  const getNewScrimsData = () => toggleFetch((prevState) => !prevState);

  const gameUrl = useMemo(
    () => `${window.location.origin}/scrims/${scrim._id}`,
    [scrim._id]
  );

  useEffect(() => {
    let gameHasStarted = compareDates(scrim) > 0;

    if (gameHasStarted) {
      setGameStarted(gameHasStarted);
    }
  }, [scrim]);

  useEffect(() => {
    const teams = [...teamOne, ...teamTwo];

    let foundPlayer = teams.find((player) => player.name === currentUser?.name);

    let foundCaster = scrim.casters.find(
      (casterName) => casterName === currentUser?.name
    );

    if (foundCaster) {
      setCasterEntered(foundCaster);
    } else {
      setCasterEntered(false);
    }

    return foundPlayer
      ? setPlayerEntered(foundPlayer)
      : setPlayerEntered(false);
  }, [scrim, currentUser.name, teamOne, teamTwo]);

  const joinCast = async () => {
    if (playerEntered) {
      alert("You're already in a team!");
      return;
    }

    if (casterEntered) return;
    if (casters.length === MAX_CASTER_AMOUNT) return;

    getNewScrimsData();

    const updatedScrim = await insertCasterInScrim(scrim._id, {
      casterData: currentUser.name,
    });

    if (updatedScrim) {
      console.log(
        `%cadded ${currentUser.name} as a caster for scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      getNewScrimsData();
    }
  };

  const leaveCast = async () => {
    getNewScrimsData();

    const updatedScrim = await removeCasterFromScrim(scrim._id, {
      casterData: casterEntered,
    });

    if (updatedScrim) {
      console.log(
        `%cremoved ${currentUser.name} from the caster list for scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      getNewScrimsData();
    }
  };

  const handleDeleteScrim = async () => {
    let yes = window.confirm('Are you sure you want to close this scrim?');
    if (!yes) return;

    let deletedScrim = await deleteScrim(scrim._id);

    if (deletedScrim) {
      setScrims((prevState) => prevState.filter((s) => s._id !== scrim._id));

      if (isInDetail) {
        history.push('/');
        getNewScrimsData();
      }
    }
  };

  const teamOneDifference = 5 - teamOne.length;
  const teamTwoDifference = 5 - teamTwo.length;

  return (
    <div className="page-section one-scrim__container">
      <div className={classes.scrimBox}>
        <Grid
          item
          container
          direction="column"
          className="scrim__metadata pd-1"
          style={{ background: 'rgba(240,234,240,0.8)' }}>
          <Grid
            item
            container
            direction="row"
            alignItems="center"
            justify="space-between">
            <Grid item>
              <Link
                className="link"
                style={{ textDecorationColor: '#000' }}
                to={`/scrims/${scrim._id}`}>
                <h1 className="text-black">
                  {scrim.createdBy.name}'s Scrim ({scrim.region})
                </h1>
              </Link>
            </Grid>
            <Grid item container sm={4} alignItems="center" justify="flex-end">
              <Button
                variant="contained"
                color="primary"
                onClick={() => {
                  alert('copied scrim link to clipboard!');
                  copyTextToClipboard(gameUrl);
                }}>
                <ShareIcon /> Share Link
              </Button>

              <AdminArea>
                <Box marginRight={2} />
                <Button
                  color="secondary"
                  variant="contained"
                  onClick={handleDeleteScrim}>
                  Close event
                </Button>
              </AdminArea>
            </Grid>
          </Grid>

          <div className={classes.gameMetaInfo}>
            <div>
              <h2 className="text-black">
                Game Start:&nbsp;
                <Moment format="MM/DD/yyyy | hh:mm A">
                  {scrim.gameStartTime}
                </Moment>
              </h2>

              <div className="casters-container ">
                {casters.length === 2 ? (
                  <h2 className="text-black">
                    Casters {casters.map((caster) => caster).join(' & ')}
                  </h2>
                ) : (
                  <div className="d-flex align-center gap-20">
                    {casters.length === 0 ? (
                      <h2 className="text-black">No Casters</h2>
                    ) : null}
                    {casters[0] && (
                      <h2 className="text-black">
                        Current Casters: {casters[0]}
                      </h2>
                    )}
                  </div>
                )}

                <div className="d-flex align-center gap-20">
                  {casters.length !== MAX_CASTER_AMOUNT && (
                    <Button
                      Button
                      variant="contained"
                      color="primary"
                      disabled={
                        casters.length === MAX_CASTER_AMOUNT ||
                        scrim.casters.find(
                          (casterName) => casterName === currentUser?.name
                        )
                      }
                      onClick={joinCast}>
                      join cast
                    </Button>
                  )}

                  {casterEntered && (
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={leaveCast}>
                      Leave cast
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </Grid>

        <div className={classes.teamsContainer}>
          {/* teamOne */}
          <ScrimTeamList
            teamOne={teamOne}
            teamTwo={teamTwo}
            teamData={{
              teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
              teamName: 'teamOne',
              teamTitleName: 'Team One (Blue Side)',
              teamArray: teamOne,
            }}
            scrim={scrim}
            playerEntered={playerEntered}
            casterEntered={casterEntered}
            getNewScrimsData={() => toggleFetch((prevState) => !prevState)}
          />

          <div className={classes.teamsVersusSeparator}>
            <div
              className="lobby__info-box"
              style={{
                background: `rgba(255, 255, 255,${
                  gameStarted ? '0.7' : '0.5'
                })`,
                padding: '10px',
                borderRadius: '4px',
              }}>
              {!gameStarted && (
                <h2 className="text-black">Game starting in...</h2>
              )}

              <CountdownTimer
                gameStarted={gameStarted}
                setGameStarted={setGameStarted}
                scrim={scrim}
              />

              {gameStarted &&
                (scrim.teamOne.length === 5 && scrim.teamTwo.length === 5 ? (
                  <>
                    {!scrim.teamWon && (
                      <>
                        <h2 className="text-black">
                          Lobby host / captain: {scrim.lobbyHost?.name}
                        </h2>
                        <h3 className="text-black">
                          please make the lobby name: <br />"{scrim.lobbyName}"
                        </h3>
                        <h3 className="text-black">
                          with the password: {scrim.lobbyPassword}
                        </h3>
                      </>
                    )}

                    {(scrim.createdBy.name === currentUser.name ||
                      scrim.lobbyHost.name === currentUser.name) &&
                      !scrim.teamWon && (
                        <Grid
                          item
                          container
                          alignItems="center"
                          direction
                          row
                          spacing={2}>
                          <Grid item>
                            <h3 className="text-black">Who won?</h3>
                          </Grid>
                          {['Team One (Blue Side)', 'Team Two (Red Side)'].map(
                            (teamTitle, idx) => (
                              <Grid item>
                                <Button
                                  style={{
                                    backgroundColor: idx === 0 ? 'blue' : 'red',
                                    color: '#fff',
                                  }}
                                  variant="contained"
                                  onClick={async () => {
                                    // set team won for scrim
                                    let yes =
                                      window.confirm(`Are you sure ${teamTitle} won this game? \n 
                                  You cannot reverse this.
                                  `);

                                    if (!yes) return;

                                    const scrimData = {
                                      ...scrim,
                                      teamWon: teamTitle,
                                    };
                                    const updatedScrim = await updateScrim(
                                      scrim._id,
                                      scrimData
                                    );
                                    if (updatedScrim) {
                                      getNewScrimsData();
                                    }
                                  }}>
                                  {teamTitle}
                                </Button>
                              </Grid>
                            )
                          )}
                        </Grid>
                      )}
                  </>
                ) : (
                  <>
                    <h2 className="text-black">
                      Not enough players:&nbsp;
                      {`${teamOne.length + teamTwo.length}/10`}
                    </h2>
                    <h5 className="text-black">
                      Please get {teamOneDifference} players in team one <br />
                      and {teamTwoDifference} players in team two <br />
                      to unlock lobby name and password
                    </h5>
                    {scrim.createdBy.name === currentUser?.name ? (
                      <Button
                        color="secondary"
                        variant="contained"
                        onClick={handleDeleteScrim}>
                        Close event
                      </Button>
                    ) : null}
                  </>
                ))}
            </div>
          </div>

          {/* teamTwo */}
          <ScrimTeamList
            teamOne={teamOne}
            teamTwo={teamTwo}
            teamData={{
              teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
              teamName: 'teamTwo',
              teamTitleName: 'Team Two (Red Side)',
              teamArray: teamTwo,
            }}
            scrim={scrim}
            playerEntered={playerEntered}
            casterEntered={casterEntered}
            getNewScrimsData={getNewScrimsData}
          />
        </div>
      </div>
    </div>
  );
}
