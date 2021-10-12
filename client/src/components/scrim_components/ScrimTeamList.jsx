import { Fragment, useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import { useScrimsActions } from './../../hooks/useScrims';
import useAuth from './../../hooks/useAuth';
import { useScrimSectionStyles } from '../../styles/ScrimSection.styles';
import useAlerts from './../../hooks/useAlerts';

// MUI components
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Divider from '@mui/material/Divider';
import ListItemText from '@mui/material/ListItemText';
import ListItemAvatar from '@mui/material/ListItemAvatar';
import Avatar from '@mui/material/Avatar';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import ListSubheader from '@mui/material/ListSubheader';

// components
import Tooltip from '../shared/Tooltip';
import AdminArea from '../shared/AdminArea';
import { Link } from 'react-router-dom';

// utils
import { RANK_IMAGES, ROLE_IMAGES } from '../../utils/imageMaps';
import { truncate } from '../../utils/truncate';
import { copyTextToClipboard } from '../../utils/copyToClipboard';

// services
import {
  insertPlayerInScrim,
  removePlayerFromScrim,
  movePlayerInScrim,
} from '../../services/scrims';

// icons
import SwapIcon from '@mui/icons-material/SwapHoriz';
import JoinIcon from '@mui/icons-material/MeetingRoom';
import ExitIcon from '@mui/icons-material/NoMeetingRoom';
import KickIcon from '@mui/icons-material/HighlightOff';
import InfoIcon from '@mui/icons-material/Info';

const getRankImage = (user) => {
  // replace number with empty string: Diamond 1 => Diamond
  // get rank image from images map by player.rank
  return RANK_IMAGES[user?.rank?.replace(/[^a-z$]/gi, '')];
};

export default function ScrimTeamList({
  playerEntered,
  scrim,
  teamData,
  casterEntered,
  gameStarted,
  buttonsDisabled,
  setButtonsDisabled,
}) {
  const { fetchScrims } = useScrimsActions();
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();

  const classes = useScrimSectionStyles({ scrim });
  const isSmScreen = useMediaQuery('@media (max-width: 630px)');

  const gameEnded = useMemo(() => scrim.teamWon, [scrim.teamWon]);

  const { teamRoles, teamName, teamTitleName, teamArray } = teamData;

  const joinGame = async (teamJoiningName, role) => {
    setButtonsDisabled(true);

    if (casterEntered) {
      setCurrentAlert({
        type: 'Error',
        message: (
          <span>
            cannot join team:&nbsp;
            <strong>You're already a caster for this game!</strong>
          </span>
        ),
      });

      setButtonsDisabled(false);
      return;
    }

    const updatedScrim = await insertPlayerInScrim({
      scrimId: scrim._id,
      userId: currentUser._id,

      // sending the role joining and the team name in the req.body.
      playerData: {
        role,
        team: { name: teamJoiningName },
      },
      setAlert: setCurrentAlert,
      setButtonsDisabled,
    });

    if (updatedScrim) {
      console.log(
        `%c added ${currentUser?.name} to scrim: ${scrim._id} in team: ${teamJoiningName}`,
        'color: #99ff99'
      );
    }

    await fetchScrims();
    setButtonsDisabled(false);
  };

  const handleMovePlayer = async (teamName, role) => {
    // toggleDisableButtons();
    setButtonsDisabled(true);

    const updatedScrim = await movePlayerInScrim({
      scrimId: scrim._id,
      userId: currentUser._id,
      playerData: {
        role,
        team: { name: teamName },
      },
      setAlert: setCurrentAlert,
      setButtonsDisabled,
    });

    if (updatedScrim) {
      console.log(
        `%cswapped ${currentUser?.name} in scrim: ${scrim._id} to: ${teamName} as ${role}`,
        'color: #99ff99'
      );
    }

    await fetchScrims();
    setButtonsDisabled(false);
  };

  const leaveGame = async () => {
    setButtonsDisabled(true);

    const updatedScrim = await removePlayerFromScrim({
      scrimId: scrim._id,
      userId: playerEntered?._user?._id,
      setAlert: setCurrentAlert,
      setButtonsDisabled,
    });

    if (updatedScrim) {
      console.log(
        `%cremoved ${currentUser?.name} from scrim: ${scrim._id}`,
        'color: #99ff99'
      );
    }

    await fetchScrims();
    setButtonsDisabled(false);
  };

  const kickPlayerFromGame = async (playerToKick) => {
    // if person kicking isn't an admin, return.
    if (!isCurrentUserAdmin) return;
    setButtonsDisabled(true);

    const updatedScrim = await removePlayerFromScrim({
      scrimId: scrim._id,
      userId: playerToKick?._user?._id,
      setAlert: setCurrentAlert,
      setButtonsDisabled,
    });

    if (updatedScrim) {
      console.log(
        `%ckicked ${playerToKick?._user?.name} from scrim: ${scrim._id}`,
        'color: #99ff99'
      );
    }

    await fetchScrims();
    setButtonsDisabled(false);
  };

  return (
    <div className={`team-container team-container--${teamName}`}>
      <List
        className={classes.teamList}
        subheader={
          <>
            <ListSubheader component="div" className={classes.teamListHeader}>
              {teamTitleName}
            </ListSubheader>
            <Divider />
          </>
        }>
        {teamRoles.map((teamRole, idx) => {
          const playerAssigned = teamArray.find(
            (player) => player?.role === teamRole
          );

          // doing this so old data is still working on the front-end after the major database update at 9/3/2021
          // for old database status, if player didnt have nested ._user, just return as is, else return ._user
          const userInfo = playerAssigned?._user;

          const isCurrentUser = userInfo?._id === currentUser?._id;

          const isLobbyHost = scrim.lobbyHost?._id === userInfo?._id;

          if (playerAssigned) {
            return (
              <Fragment key={idx}>
                {idx !== 0 ? <Divider component="div" /> : null}
                <ListItem
                  alignItems="center"
                  className={classes.teamListItem}
                  style={{
                    // fallback for non-supporting browsers
                    background: isLobbyHost && gameStarted && '#63d471',

                    // if game has started, but the game didn't end, and the player is the lobby host, make his background green.
                    // we don't care if the guy is the lobby host if game ended.
                    // eslint-disable-next-line
                    background:
                      isLobbyHost &&
                      gameStarted &&
                      'linear-gradient(315deg, #63d471 0%, #233329 74%)',
                  }}>
                  <ListItemAvatar>
                    <Avatar
                      alt={playerAssigned?.role}
                      src={ROLE_IMAGES[teamRole]}
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Grid container alignItems="center" wrap="wrap-reverse">
                        <Tooltip title={`Visit ${userInfo?.name}'s profile`}>
                          <Link
                            className="link"
                            to={`/users/${userInfo?.name}?region=${userInfo?.region}`}>
                            {isSmScreen
                              ? userInfo?.name
                              : truncate(userInfo?.name, 16)}
                          </Link>
                        </Tooltip>

                        <>
                          {/* rank image */}
                          &nbsp;
                          <img
                            width="25px"
                            style={{ objectFit: 'cover' }}
                            alt={playerAssigned?.role}
                            src={getRankImage(userInfo)}
                          />
                        </>
                      </Grid>
                    }
                    secondary={
                      <>
                        {userInfo?.discord && (
                          <>
                            Discord -&nbsp;
                            <Tooltip title="Copy discord name">
                              <Typography
                                component="span"
                                variant="body2"
                                className="link"
                                color="textPrimary"
                                style={{ cursor: 'pointer' }}
                                onClick={() => {
                                  copyTextToClipboard(userInfo?.discord);
                                  setCurrentAlert({
                                    type: 'Success',
                                    message: `copied player discord (${userInfo?.discord}) to clipboard`,
                                  });
                                }}>
                                {isSmScreen
                                  ? userInfo?.discord
                                  : truncate(userInfo?.discord, 9)}
                              </Typography>
                            </Tooltip>
                            <br />
                          </>
                        )}
                        {'Role - '}
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.inline}
                          color="textPrimary">
                          {playerAssigned?.role}
                        </Typography>
                        <br />
                        {'Rank - '}
                        <Typography
                          component="span"
                          variant="body2"
                          className={classes.inline}
                          color="textPrimary">
                          {userInfo?.rank}
                        </Typography>
                      </>
                    }
                  />

                  {isLobbyHost && gameStarted && (
                    <Tooltip
                      title={`This player is the lobby captain. \n 
                      It's expected of the lobby captain to create the custom lobby and select who won after the game,\n
                      AND to upload the post-game image to verify the winner`}>
                      <Box
                        style={{ cursor: 'help' }}
                        className={classes.infoIcon}>
                        <InfoIcon />
                      </Box>
                    </Tooltip>
                  )}
                  {isCurrentUser
                    ? // don't let user leave if game has already ended
                      !gameEnded && (
                        <Tooltip title="Leave" className={classes.iconButton}>
                          <span>
                            <IconButton
                              disabled={buttonsDisabled}
                              onMouseDown={(e) => e.preventDefault()}
                              onClick={() => leaveGame(teamName)}>
                              <ExitIcon />
                            </IconButton>
                          </span>
                        </Tooltip>
                      )
                    : // don't let admins kick if game has ended.
                      !gameEnded && (
                        <AdminArea>
                          <Tooltip
                            title={`Kick ${userInfo?.name}`}
                            className={classes.iconButton}>
                            <span>
                              <IconButton
                                disabled={buttonsDisabled}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  let yes = window.confirm(
                                    `Are you sure you want to kick ${userInfo?.name}?`
                                  );
                                  if (!yes) return;
                                  kickPlayerFromGame(playerAssigned, teamName);
                                }}>
                                <KickIcon />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </AdminArea>
                      )}
                </ListItem>
                {idx !== teamRoles.length - 1 ? (
                  <Divider component="li" />
                ) : null}
              </Fragment>
            );
          } else
            return (
              <Fragment key={idx}>
                {idx !== 0 ? <Divider component="div" /> : null}

                <ListItem alignItems="center" className={classes.teamListItem}>
                  <ListItemAvatar>
                    <Avatar alt={teamRole} src={ROLE_IMAGES[teamRole]} />
                  </ListItemAvatar>
                  <ListItemText primary={teamRole} />
                  {!playerEntered ? (
                    <Tooltip
                      title={`Join: ${teamTitleName} as ${teamRole}`}
                      className={classes.iconButton}>
                      <span>
                        <IconButton
                          disabled={buttonsDisabled}
                          onMouseDown={(e) => e.preventDefault()}
                          onClick={() => joinGame(teamName, teamRole)}>
                          <JoinIcon />
                        </IconButton>
                      </span>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip
                        title={`Move to: ${teamTitleName} as ${teamRole}`}
                        className={classes.iconButton}>
                        <span>
                          <IconButton
                            disabled={buttonsDisabled}
                            onMouseDown={(e) => e.preventDefault()}
                            onClick={async () =>
                              handleMovePlayer(teamName, teamRole)
                            }>
                            <SwapIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    </>
                  )}
                </ListItem>
                {idx !== teamRoles.length - 1 ? (
                  <Divider component="div" />
                ) : null}
              </Fragment>
            );
        })}
      </List>
    </div>
  );
}
