import { useMemo } from 'react';
import { useAuth } from '../../context/currentUser';
import { useScrims } from './../../context/scrimsContext';

// components
import CountdownTimer from './CountdownTimer';
import UploadPostGameImage from './UploadPostGameImage';
import { Box, Button, Grid, makeStyles, Typography } from '@material-ui/core';
import Tooltip from '../shared/Tooltip';

// utils
import pluralize from 'pluralize';
import { updateScrim } from '../../services/scrims';
import HelpIcon from '@material-ui/icons/Help';

const useStyles = makeStyles((theme) => ({
  infoBoxRoot: {
    background: ({ imageUploaded, gameStarted }) =>
      `rgba(255, 255, 255,${
        imageUploaded ? '0.8' : gameStarted ? '0.7' : '0.5'
      })`,

    padding: '10px',
    borderRadius: '4px',
  },
}));

//  this is the area that contains the countdown timer for the scrim section and the other details.
export default function ScrimSectionMiddleAreaBox({
  imageUploaded,
  scrim,
  gameStarted,
  setGameStarted,
  gameEnded,
  playerEntered,
  casterEntered,
}) {
  const { currentUser } = useAuth();
  const classes = useStyles({ gameStarted, imageUploaded });
  const { fetchScrims } = useScrims();

  const { teamOne, teamTwo } = scrim;

  const teamOneDifference = useMemo(() => 5 - teamOne.length, [teamOne]);
  const teamTwoDifference = useMemo(() => 5 - teamTwo.length, [teamTwo]);

  return (
    <Grid
      container
      direction="column"
      alignItems="center"
      justifyContent="center">
      <div className={classes.infoBoxRoot}>
        {!gameStarted && (
          <Typography variant="h2" className="text-black">
            Game starting in...
          </Typography>
        )}

        <CountdownTimer
          gameStarted={gameStarted}
          setGameStarted={setGameStarted}
          scrim={scrim}
        />

        {gameStarted &&
          (scrim.teamOne.length === 5 && scrim.teamTwo.length === 5 ? (
            <>
              {!gameEnded && (
                <>
                  {/* show lobby name and pswd only to players in lobby or admins */}
                  {playerEntered ||
                  casterEntered ||
                  process.env.REACT_APP_ADMIN_KEY === currentUser?.adminKey ? (
                    <>
                      <Grid item container direction="row" alignItems="center">
                        <Typography variant="h2">
                          Lobby host / captain: {scrim.lobbyHost?.name}
                        </Typography>
                        <Box marginRight={2} />
                        <Tooltip title="It's expected of the lobby captain to create the custom lobby and select who won after the game">
                          <HelpIcon
                            style={{ color: '#000', cursor: 'help' }}
                            fontSize="large"
                          />
                        </Tooltip>
                      </Grid>
                      <Typography variant="h3" className="text-black">
                        please make the lobby name: <br />"{scrim.lobbyName}"
                      </Typography>
                      <Typography variant="h3" className="text-black">
                        with the password: {scrim.lobbyPassword}
                      </Typography>
                    </>
                  ) : (
                    <></>
                  )}
                </>
              )}

              {/* WHO WON ? BUTTONS */}
              {/* show buttons if is admin or is lobby captain */}
              {/* don't show if game has ended */}
              {(scrim.lobbyHost.email === currentUser?.email ||
                currentUser?.adminKey === process.env.REACT_APP_ADMIN_KEY) &&
                !gameEnded && (
                  // WHO WON BUTTONS
                  <Grid
                    item
                    container
                    alignItems="center"
                    direction="row"
                    spacing={2}>
                    <Grid item>
                      <Typography variant="h3" className="text-black">
                        Who won?
                      </Typography>
                    </Grid>

                    {['Team 1 (Blue Side)', 'Team 2 (Red Side)'].map(
                      (teamTitle, idx) => (
                        <Grid item key={idx}>
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

                              const dataSending = {
                                teamWon: teamTitle,
                              };
                              const updatedScrim = await updateScrim(
                                scrim._id,
                                dataSending
                              );
                              if (updatedScrim) {
                                fetchScrims();
                              }
                            }}>
                            {teamTitle}
                          </Button>
                        </Grid>
                      )
                    )}
                  </Grid>
                )}

              {/*  allow image upload if both teams are filled and 
                    the current user is the host or creator of scrim or an admin.
                  */}
              {/* POST GAME IMAGE SECTION */}
              {(scrim.lobbyHost?._id === currentUser?._id ||
                currentUser?.adminKey === process.env.REACT_APP_ADMIN_KEY) && (
                <>
                  <Box marginTop={2} />

                  <UploadPostGameImage
                    isUploaded={imageUploaded}
                    scrim={scrim}
                  />
                </>
              )}

              {imageUploaded && (
                <Grid
                  item
                  container
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={2}>
                  <Grid item>
                    <Typography variant="h3" className="text-black">
                      Post-game image uploaded!
                    </Typography>
                  </Grid>
                  <Grid item>
                    <Button
                      variant="contained"
                      color="primary"
                      component="a"
                      href={scrim.postGameImage?.location}
                      rel="noreferrer"
                      target="_blank">
                      View Image
                    </Button>
                  </Grid>
                </Grid>
              )}
            </>
          ) : (
            <>
              <Typography variant="h2">
                Not enough players:&nbsp;
                {`${teamOne.length + teamTwo.length}/10`}
              </Typography>
              <Typography variant="h5" component="p">
                Please get
                {/* if teamOne still needs players show this else don't show */}
                {teamOneDifference > 0 ? (
                  <>
                    &nbsp;{teamOneDifference}&nbsp;
                    {/* spell check singular and plural with pluralize */}
                    {pluralize('players', teamOneDifference)} in Team 1&nbsp;
                    <br />
                  </>
                ) : null}
                {/* if teamTwo needs players, show this text. */}
                {teamTwoDifference > 0 ? (
                  <>
                    {/* if team one needs players, show 'and', else don't show 'and' */}
                    {teamOneDifference > 0 ? 'and' : ''}&nbsp;
                    {teamTwoDifference}
                    &nbsp;{pluralize('players', teamTwoDifference)} in Team 2
                    <br />
                  </>
                ) : null}
                to unlock lobby name and password
              </Typography>
            </>
          ))}
      </div>
    </Grid>
  );
}
