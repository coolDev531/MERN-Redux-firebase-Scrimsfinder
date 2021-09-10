import { useMemo } from 'react';
import { useAuth } from '../../context/currentUser';
import { useScrims } from './../../context/scrimsContext';
import { useScrimSectionStyles } from '../../styles/scrimSection.styles';

// components
import CountdownTimer from './CountdownTimer';
import UploadPostGameImage from './UploadPostGameImage';
import { Box, Button, Grid } from '@material-ui/core';

// utils
import pluralize from 'pluralize';
import { updateScrim } from '../../services/scrims';

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
  const classes = useScrimSectionStyles();

  const { fetchScrims } = useScrims();

  const { teamOne, teamTwo } = scrim;

  const teamOneDifference = useMemo(() => 5 - teamOne.length, [teamOne]);
  const teamTwoDifference = useMemo(() => 5 - teamTwo.length, [teamTwo]);

  return (
    <div className={classes.teamsVersusSeparator}>
      <div
        className="lobby__info-box"
        style={{
          background: `rgba(255, 255, 255,${
            imageUploaded ? '0.8' : gameStarted ? '0.7' : '0.5'
          })`,
          padding: '10px',
          borderRadius: '4px',
        }}>
        {!gameStarted && <h2 className="text-black">Game starting in...</h2>}

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
                      <h3 className="text-black">Who won?</h3>
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
                    <h3 className="text-black">Post-game image uploaded!</h3>
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
              <h2 className="text-black">
                Not enough players:&nbsp;
                {`${teamOne.length + teamTwo.length}/10`}
              </h2>
              <h5 className="text-black">
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
              </h5>
            </>
          ))}
      </div>
    </div>
  );
}
