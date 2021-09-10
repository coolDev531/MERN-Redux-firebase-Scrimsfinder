import { useContext, useEffect, useState, useMemo } from 'react';
import { CurrentUserContext } from '../../context/currentUser';
import { useScrimSectionStyles } from '../../styles/scrimSection.styles';

//  components
import CountdownTimer from './CountdownTimer';
import ScrimTeamList from './ScrimTeamList';
import Moment from 'react-moment';
import AdminArea from '../shared/AdminArea';
import { Box, Button, Grid } from '@material-ui/core';
import { Link, useHistory } from 'react-router-dom';
import { PageSection } from '../shared/PageComponents';

// utils / services
import {
  updateScrim,
  deleteScrim,
  removeCasterFromScrim,
} from '../../services/scrims';
import { copyTextToClipboard } from '../../utils/copyToClipboard';
import { ScrimsContext } from '../../context/scrimsContext';
import { insertCasterInScrim } from '../../services/scrims';

// icons
import ShareIcon from '@material-ui/icons/Share';
import SettingsIcon from '@material-ui/icons/Settings';
import UploadPostGameImage from './UploadPostGameImage';
import pluralize from 'pluralize';
import ScrimBoxMiddleArea from './ScrimBoxMiddleArea';

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

const MAX_CASTER_AMOUNT = 2;

export default function ScrimSection({ scrim, isInDetail }) {
  const { toggleFetch, setScrims } = useContext(ScrimsContext);
  const { currentUser } = useContext(CurrentUserContext);
  const [playerEntered, setPlayerEntered] = useState(false);
  const [casterEntered, setCasterEntered] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [imageUploaded, setImageUploaded] = useState(false);

  // if the scrim has a winning team, it means it has ended.
  const gameEnded = useMemo(() => scrim.teamWon, [scrim.teamWon]);

  const classes = useScrimSectionStyles({ imageUploaded, scrim });
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
      setGameStarted(scrim._id);
    }
  }, [scrim]);

  useEffect(() => {
    const teams = [...teamOne, ...teamTwo];

    let foundPlayer = teams.find(
      (player) => player?._user?._id === currentUser?._id
    );

    let foundCaster = scrim.casters.find(
      (caster) => caster?._id === currentUser?._id
    );

    if (foundCaster) {
      setCasterEntered(foundCaster);
    } else {
      setCasterEntered(false);
    }

    if (foundPlayer) {
      setPlayerEntered(foundPlayer);
    } else {
      setPlayerEntered(false);
    }
  }, [scrim, currentUser?._id, teamOne, teamTwo]);

  useEffect(() => {
    if (scrim.postGameImage) {
      setImageUploaded(scrim._id);
    } else {
      setImageUploaded(false);
    }
  }, [scrim]);

  const joinCast = async () => {
    if (playerEntered) {
      alert("You're already in a team!");
      return;
    }

    if (casterEntered) return;
    if (casters.length === MAX_CASTER_AMOUNT) return;

    getNewScrimsData();

    const dataSending = {
      casterData: {
        _id: currentUser._id,
        name: currentUser?.name,
        uid: currentUser?.uid,
        email: currentUser?.email,
        discord: currentUser?.discord,
      },
    };

    const updatedScrim = await insertCasterInScrim(scrim._id, dataSending);

    if (updatedScrim) {
      console.log(
        `%cadded ${currentUser?.name} as a caster for scrim: ${scrim._id}`,
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
        `%cremoved ${currentUser?.name} from the caster list for scrim: ${scrim._id}`,
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

  // the "Scrim Box"
  return (
    <PageSection aria-label="scrim section">
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
            justifyContent="space-between">
            <Grid item>
              <Link
                className="link"
                style={{ textDecorationColor: '#000' }}
                to={`/scrims/${scrim._id}`}>
                <h1 className="text-black">
                  {/* if scrim has a title show title, else show createdby.name's scrim */}
                  {`${scrim.title ?? `${scrim.createdBy.name}'s Scrim`} (${
                    scrim.region
                  })`}
                </h1>
              </Link>
            </Grid>
            <Grid
              item
              container
              sm={8}
              md={6}
              alignItems="center"
              justifyContent="flex-end">
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
                <Grid
                  container
                  item
                  direction="row"
                  alignItems="center"
                  xs={6}
                  justifyContent="flex-end"
                  spacing={2}>
                  <Grid item>
                    <Button
                      color="primary"
                      variant="contained"
                      onClick={() => history.push(`/scrims/${scrim._id}/edit`)}>
                      <SettingsIcon />
                      &nbsp; Edit
                    </Button>
                  </Grid>

                  <Grid item>
                    <Button
                      color="secondary"
                      variant="contained"
                      onClick={handleDeleteScrim}>
                      Close event
                    </Button>
                  </Grid>
                </Grid>
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
                    Casters: {casters.map((caster) => caster?.name).join(' & ')}
                  </h2>
                ) : (
                  <div className="d-flex align-center gap-20">
                    {casters.length === 0 ? (
                      <h2 className="text-black">No Casters</h2>
                    ) : null}
                    {casters[0] && (
                      <h2 className="text-black">
                        {/* if game didn't and say current casters, else say one caster: */}
                        {!gameEnded ? 'Current Casters:' : 'Caster:'}{' '}
                        {casters[0].name}
                      </h2>
                    )}
                  </div>
                )}

                {/* don't show cast buttons if game ended */}
                {!gameEnded && (
                  <Grid
                    container
                    alignItems="center"
                    direction="row"
                    spacing={2}>
                    {casters.length !== MAX_CASTER_AMOUNT && (
                      <Grid item>
                        <Button
                          variant="contained"
                          color="primary"
                          disabled={
                            casters.length === MAX_CASTER_AMOUNT ||
                            scrim.casters.find(
                              ({ _id }) => _id === currentUser?._id
                            )
                              ? true
                              : false
                          }
                          onClick={joinCast}>
                          join cast
                        </Button>
                      </Grid>
                    )}

                    {casterEntered && (
                      <Grid item>
                        <Button
                          color="secondary"
                          variant="contained"
                          onClick={leaveCast}>
                          Leave cast
                        </Button>
                      </Grid>
                    )}
                  </Grid>
                )}
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
              teamTitleName: 'Team 1 (Blue Side)',
              teamArray: teamOne,
            }}
            scrim={scrim}
            playerEntered={playerEntered}
            casterEntered={casterEntered}
            getNewScrimsData={() => toggleFetch((prevState) => !prevState)}
            gameStarted={gameStarted === scrim._id}
          />

          {/* the middle box that contains the countdown timer and other details. */}
          <ScrimBoxMiddleArea
            imageUploaded={imageUploaded === scrim._id}
            scrim={scrim}
            gameStarted={gameStarted === scrim._id}
            setGameStarted={setGameStarted}
            gameEnded={gameEnded}
            playerEntered={playerEntered}
            casterEntered={casterEntered}
          />

          {/* teamTwo */}
          <ScrimTeamList
            teamOne={teamOne}
            teamTwo={teamTwo}
            teamData={{
              teamRoles: ['Top', 'Jungle', 'Mid', 'ADC', 'Support'],
              teamName: 'teamTwo',
              teamTitleName: 'Team 2 (Red Side)',
              teamArray: teamTwo,
            }}
            scrim={scrim}
            playerEntered={playerEntered}
            casterEntered={casterEntered}
            getNewScrimsData={getNewScrimsData}
            gameStarted={gameStarted === scrim._id}
          />
        </div>
      </div>
    </PageSection>
  );
}
