import { Fragment, useMemo } from 'react';
import { useScrims } from './../../context/scrimsContext';
import { useAuth } from './../../context/currentUser';
import { useScrimSectionStyles } from '../../styles/ScrimSection.styles';
import { useAlerts } from '../../context/alertsContext';

// components
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import {
  Grid,
  IconButton,
  Typography,
  useMediaQuery,
  Box,
} from '@material-ui/core';
import Tooltip from '../shared/Tooltip';
import AdminArea from '../shared/AdminArea';
import ListSubheader from '@material-ui/core/ListSubheader';

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
import SwapIcon from '@material-ui/icons/SwapHoriz';
import JoinIcon from '@material-ui/icons/MeetingRoom';
import ExitIcon from '@material-ui/icons/NoMeetingRoom';
import KickIcon from '@material-ui/icons/HighlightOff';
import InfoIcon from '@material-ui/icons/Info';

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
}) {
  const { fetchScrims } = useScrims();
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();

  const classes = useScrimSectionStyles({ scrim });
  const isSmScreen = useMediaQuery('@media (max-width: 630px)');

  const gameEnded = useMemo(() => scrim.teamWon, [scrim.teamWon]);

  const { teamRoles, teamName, teamTitleName, teamArray } = teamData;

  const joinGame = async (teamJoiningName, role) => {
    fetchScrims();

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
    });

    if (updatedScrim) {
      console.log(
        `%c added ${currentUser?.name} to scrim: ${scrim._id} in team: ${teamJoiningName}`,
        'color: #99ff99'
      );
      fetchScrims();
    }
  };

  const handleMovePlayer = async (teamName, role) => {
    fetchScrims();

    const updatedScrim = await movePlayerInScrim({
      scrimId: scrim._id,
      userId: currentUser._id,
      playerData: {
        role,
        team: { name: teamName },
      },
      setAlert: setCurrentAlert,
    });

    if (updatedScrim) {
      console.log(
        `%cswapped ${currentUser?.name} in scrim: ${scrim._id} to: ${teamName} as ${role}`,
        'color: #99ff99'
      );
      fetchScrims();
    }
  };

  const leaveGame = async () => {
    const updatedScrim = await removePlayerFromScrim({
      scrimId: scrim._id,
      userId: playerEntered?._user?._id,
      playerData: {
        role: playerEntered?.role,
      },
      setAlert: setCurrentAlert,
    });

    if (updatedScrim) {
      console.log(
        `%cremoved ${currentUser?.name} from scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      fetchScrims();
    }
  };

  const kickPlayerFromGame = async (playerToKick) => {
    // if person kicking isn't an admin, return.
    if (!isCurrentUserAdmin) return;

    const updatedScrim = await removePlayerFromScrim({
      scrimId: scrim._id,
      userId: playerToKick?._user?._id,
      playerData: {
        role: playerEntered.role,
      },
      setAlert: setCurrentAlert,
    });

    if (updatedScrim) {
      console.log(
        `%ckicked ${playerToKick?._user?.name} from scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      fetchScrims();
    }
  };

  return (
    <div className={`team-container team-container--${teamName}`}>
      <List
        className={classes.teamList}
        subheader={
          <>
            <ListSubheader component="div" style={{ color: '#fff' }}>
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
                    background:
                      isLobbyHost && gameStarted ? '#63d471' : '#424242',

                    // if game has started, but the game didn't end, and the player is the lobby host, make his background green.
                    // we don't care if the guy is the lobby host if game ended.
                    // eslint-disable-next-line
                    background:
                      isLobbyHost && gameStarted
                        ? 'linear-gradient(315deg, #63d471 0%, #233329 74%)'
                        : '#424242',
                  }}>
                  <ListItemAvatar>
                    <Avatar
                      alt={playerAssigned.role}
                      src={ROLE_IMAGES[teamRole]}
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Grid container alignItems="center">
                        <Tooltip title={`visit ${userInfo?.name}'s op.gg`}>
                          <a
                            className="link"
                            href={`https://${userInfo?.region}.op.gg/summoner/userName=${userInfo?.name}`}
                            target="_blank"
                            rel="noreferrer">
                            {isSmScreen
                              ? userInfo?.name
                              : truncate(userInfo?.name, 16)}
                          </a>
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
                        <Tooltip title="Leave">
                          <IconButton
                            onMouseDown={(e) => e.preventDefault()}
                            className={classes.iconButton}
                            onClick={() => leaveGame(teamName)}>
                            <ExitIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    : // don't let admins kick if game has ended.
                      !gameEnded && (
                        <AdminArea>
                          <Tooltip title={`Kick ${userInfo?.name}`}>
                            <IconButton
                              onMouseDown={(e) => e.preventDefault()}
                              className={classes.iconButton}
                              onClick={() => {
                                let yes = window.confirm(
                                  `Are you sure you want to kick ${userInfo?.name}?`
                                );
                                if (!yes) return;
                                kickPlayerFromGame(playerAssigned, teamName);
                              }}>
                              <KickIcon />
                            </IconButton>
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
                    <Tooltip title={`Join: ${teamTitleName} as ${teamRole}`}>
                      <IconButton
                        onMouseDown={(e) => e.preventDefault()}
                        onClick={() => joinGame(teamName, teamRole)}
                        className={classes.iconButton}>
                        <JoinIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip
                        title={`Move to: ${teamTitleName} as ${teamRole}`}>
                        <IconButton
                          onMouseDown={(e) => e.preventDefault()}
                          className={classes.iconButton}
                          onClick={() => handleMovePlayer(teamName, teamRole)}>
                          <SwapIcon />
                        </IconButton>
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
