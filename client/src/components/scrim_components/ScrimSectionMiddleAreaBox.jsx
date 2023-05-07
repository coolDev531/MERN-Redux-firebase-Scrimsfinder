import { useMemo } from 'react';
import useAuth from './../../hooks/useAuth';
import useAlerts from './../../hooks/useAlerts';

// components
import CountdownTimer from './CountdownTimer';
import UploadPostGameImage from './UploadPostGameImage';
import Tooltip from '../shared/Tooltip';

// Mui components
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';

//icons
import InfoIcon from '@mui/icons-material/Info';

// utils
import { makeStyles } from '@mui/styles';
import { copyTextToClipboard } from './../../utils/copyToClipboard';
import pluralize from 'pluralize';
import { COLORS } from './../../appTheme';

// services
import { setScrimWinner } from '../../services/scrims.services';

const useStyles = makeStyles({
  infoBoxRoot: {
    backgroundColor: COLORS.DK_BLUE_TRANSPARENT,
    padding: '10px',
    borderRadius: '4px',
    backdropFilter: 'blur(8px)',
  },
});

//  this is the area that contains the countdown timer for the scrim section and the other details.
export default function ScrimSectionMiddleAreaBox({
  imageUploaded,
  scrim,
  gameStarted,
  setGameStarted,
  gameEnded,
  playerEntered,
  casterEntered,
  setScrim,
  socket,
}) {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();

  const classes = useStyles();

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
          <Typography variant="h2">Game starting in...</Typography>
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
                  {playerEntered || casterEntered || isCurrentUserAdmin ? (
                    <>
                      <Grid item container direction="row" alignItems="center">
                        <Typography variant="h2">
                          Lobby host / captain: {scrim.lobbyHost?.name}
                        </Typography>
                        <Box marginRight={2} />
                        <Tooltip
                          title="It's expected of the lobby captain to create the custom lobby and select who won after the game, 
                        AND to upload the post-game image to verify the winner">
                          <InfoIcon
                            style={{ cursor: 'help' }}
                            fontSize="large"
                          />
                        </Tooltip>
                      </Grid>
                      <Typography variant="h3">
                        {/* the lobby name to make the custom game in LoL 
                        (used to be randomly generated but now is just scrim.title + "Custom Game" + region)
                        */}
                        please make the lobby name: <br />
                        &nbsp;
                        <Tooltip title="Copy lobby name to clipboard">
                          <span
                            className="link"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              copyTextToClipboard(scrim.lobbyName);
                              setCurrentAlert({
                                type: 'Success',
                                message: 'lobby name copied to clipboard',
                              });
                            }}>
                            "{scrim.lobbyName}"
                          </span>
                        </Tooltip>
                      </Typography>
                      <Typography variant="h3">
                        {/* the lobby password to make the custom game in LoL 
                        (randomly generated) */}
                        with the password: &nbsp;
                        <Tooltip title="Copy password to clipboard">
                          <span
                            className="link"
                            style={{ cursor: 'pointer' }}
                            onClick={() => {
                              copyTextToClipboard(scrim.lobbyPassword);
                              setCurrentAlert({
                                type: 'Success',
                                message: 'password copied to clipboard',
                              });
                            }}>
                            {scrim.lobbyPassword}
                          </span>
                        </Tooltip>
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
              {(scrim.lobbyHost?._id === currentUser?._id ||
                isCurrentUserAdmin) &&
                !gameEnded && (
                  // WHO WON BUTTONS
                  <Grid item container direction="column">
                    <Grid item>
                      <Typography
                        variant="h3"
                        style={{ textDecoration: 'underline' }}>
                        Who won?
                      </Typography>
                    </Grid>

                    <Grid item container direction="row" spacing={2}>
                      {/* winner buttons (Who won?) */}
                      {['teamOne', 'teamTwo'].map((teamName, idx) => {
                        const teamAliases = {
                          teamOne: 'Team One (Blue Side)',
                          teamTwo: 'Team Two (Red Side)',
                        };

                        return (
                          <Grid item key={idx}>
                            <Tooltip
                              title={`Select ${teamAliases[teamName]} as winner`}>
                              <Button
                                style={{
                                  backgroundColor: idx === 0 ? 'blue' : 'red',
                                  color: '#fff',
                                }}
                                variant="contained"
                                onClick={async () => {
                                  // set team won for scrim
                                  let yes =
                                    window.confirm(`Are you sure ${teamName} won this game? \n 
                                  You cannot reverse this.
                                  `);

                                  if (!yes) return;

                                  const updatedScrim = await setScrimWinner(
                                    scrim._id,
                                    teamName,
                                    setCurrentAlert
                                  );

                                  if (updatedScrim?.createdBy) {
                                    setScrim(updatedScrim);
                                    socket?.emit(
                                      'sendScrimTransaction',
                                      updatedScrim
                                    );
                                  }
                                }}>
                                {teamAliases[teamName]}
                              </Button>
                            </Tooltip>
                          </Grid>
                        );
                      })}
                    </Grid>
                  </Grid>
                )}

              {/*  allow image upload if both teams are filled and 
                    the current user is the host or creator of scrim or an admin.
                  */}
              {/* POST GAME IMAGE SECTION */}
              {(scrim.lobbyHost?._id === currentUser?._id ||
                isCurrentUserAdmin) && (
                <>
                  {/* disabled for now until we get money for another image hosting solution... */}
                  <Box marginTop={2} />

                  {/* UPLOAD OR DELETE IMAGE */}
                  <UploadPostGameImage
                    isUploaded={imageUploaded}
                    scrim={scrim}
                    socket={socket}
                    setScrim={setScrim}
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
                    <Typography variant="h3">
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
              <Typography variant="h5" component="p" className="text-white">
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
