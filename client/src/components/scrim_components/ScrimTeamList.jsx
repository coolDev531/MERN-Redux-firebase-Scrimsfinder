import { Fragment, useMemo } from 'react';
import useMediaQuery from '@mui/material/useMediaQuery';
import useAuth from './../../hooks/useAuth';
import { useScrimSectionStyles } from '../../styles/ScrimSection.styles';
import useAlerts from './../../hooks/useAlerts';
import useUsers from './../../hooks/useUsers';

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
import { ROLE_IMAGES } from '../../utils/imageMaps';
import { truncate } from '../../utils/truncate';
import { copyTextToClipboard } from '../../utils/copyToClipboard';
import { encode } from 'html-entities';

// services
import {
  insertPlayerInScrim,
  removePlayerFromScrim,
  movePlayerInScrim,
} from '../../services/scrims.services';

// utils
import { getTeamBackgroundColor } from '../../utils/scrimMisc';
import { getRankImage } from './../../utils/getRankImage';

// icons
import SwapIcon from '@mui/icons-material/SwapHoriz';
import JoinIcon from '@mui/icons-material/MeetingRoom';
import ExitIcon from '@mui/icons-material/NoMeetingRoom';
import KickIcon from '@mui/icons-material/HighlightOff';
import InfoIcon from '@mui/icons-material/Info';

export default function ScrimTeamList({
  playerEntered,
  scrim,
  teamData,
  casterEntered,
  gameStarted,
  buttonsDisabled,
  setButtonsDisabled,
  setScrim,
  socket,
  setSwapPlayers,
}) {
  const { currentUser, isCurrentUserAdmin } = useAuth();
  const { setCurrentAlert } = useAlerts();
  const { onlineUsers } = useUsers();

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
      setScrim,
    });

    // using .createdBy because on error it wont return populated scrim, so we don't set the scrim
    if (updatedScrim?.createdBy) {
      setScrim(updatedScrim);

      socket?.emit('sendScrimTransaction', updatedScrim);
    }

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
      setScrim,
    });

    if (updatedScrim?.createdBy) {
      setScrim(updatedScrim);

      socket?.emit('sendScrimTransaction', updatedScrim);
    }

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

    if (updatedScrim?.createdBy) {
      setScrim(updatedScrim);

      socket?.emit('sendScrimTransaction', updatedScrim);
    }

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

    if (updatedScrim?.createdBy) {
      setScrim(updatedScrim);

      socket?.emit('sendScrimTransaction', updatedScrim);
    }

    setButtonsDisabled(false);
  };

  const onDrag = (e) => {
    const userId = e.target.closest('li').dataset?._user;

    if (!isCurrentUserAdmin && !userId) {
      e.preventDefault();
      return;
    }

    const role = e.target.closest('li').dataset.role;
    const team = e.target.closest('li').dataset.teamname;

    setSwapPlayers((prevState) => ({
      ...prevState,
      playerOne: {
        _user: userId,
        role,
        team,
      },
    }));
  };

  const onDrop = (e) => {
    if (!isCurrentUserAdmin) {
      e.preventDefault();
      return;
    }

    e.preventDefault();

    const userId = e.target.closest('li').dataset._user;
    const role = e.target.closest('li').dataset.role;
    const team = e.target.closest('li').dataset.teamname;

    setSwapPlayers((prevState) => ({
      ...prevState,
      playerTwo: {
        _user: userId,
        role,
        team,
      },
    }));
  };

  const winnerTeam = scrim?.teamWon ?? null;
  const background = getTeamBackgroundColor(teamName, winnerTeam);

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
          const userInfo = playerAssigned?._user ?? null;

          const isCurrentUser = userInfo?._id === currentUser?._id;

          const isLobbyHost = scrim.lobbyHost?._id === userInfo?._id;

          const isOnline = onlineUsers.includes(userInfo?._id);

          if (userInfo) {
            return (
              <Fragment key={idx}>
                {/* top divider */}
                {idx !== 0 ? <Divider component="div" /> : null}
                <ListItem
                  // onDrag={onDrag}
                  onDrop={onDrop}
                  onDragStart={onDrag}
                  onDragEnter={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  draggable={true}
                  data-_user={userInfo?._id}
                  data-role={teamRole}
                  data-teamName={teamData.teamName}
                  alignItems="center"
                  className={classes.teamListItem}
                  style={{
                    // fallback for non-supporting browsers
                    backgroundColor: isLobbyHost
                      ? gameStarted && '#7f53ac'
                      : background.normal,

                    // if game has started, but the game didn't end, and the player is the lobby host, make his background green.
                    // we don't care if the guy is the lobby host if game ended.
                    backgroundImage: isLobbyHost
                      ? gameStarted &&
                        'linear-gradient(315deg, #7f53ac 0%, #647dee 74%)'
                      : background.gradient,
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
                        {/* online circle */}
                        <Tooltip
                          title={
                            isOnline
                              ? `${userInfo?.name} is online`
                              : `${userInfo?.name} is offline`
                          }>
                          <div
                            className={classes.onlineCircle}
                            style={{
                              background: isOnline ? '#AAFF00' : '#EE4B2B',
                            }}
                          />
                        </Tooltip>
                        <Tooltip title={`Visit ${userInfo?.name}'s profile`}>
                          <Link
                            className="link"
                            to={`/users/${userInfo?.name}?region=${userInfo?.region}`}>
                            {isSmScreen
                              ? userInfo?.name
                              : truncate(userInfo?.name, 11)}
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
                                    message: `copied player discord (${encode(
                                      userInfo?.discord
                                    )}) to clipboard`,
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
                            title={`Kick ${encode(userInfo?.name)}`}
                            className={classes.iconButton}>
                            <span>
                              <IconButton
                                disabled={buttonsDisabled}
                                onMouseDown={(e) => e.preventDefault()}
                                onClick={() => {
                                  let yes = window.confirm(
                                    `Are you sure you want to kick ${encode(
                                      userInfo?.name
                                    )}?`
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
                {/* bottom divider */}
                {idx !== teamRoles.length - 1 ? (
                  <Divider component="li" />
                ) : null}
              </Fragment>
            );
          } else
            return (
              <Fragment key={idx}>
                {idx !== 0 ? <Divider component="div" /> : null}

                <ListItem
                  alignItems="center"
                  className={classes.teamListItem}
                  data-role={teamRole}
                  data-teamName={teamData.teamName}
                  onDragEnter={(e) => e.preventDefault()}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={onDrop}
                  draggable={false}>
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
