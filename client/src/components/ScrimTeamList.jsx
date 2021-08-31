import { useContext, Fragment, useMemo } from 'react';
import { useScrimSectionStyles } from '../styles/scrimSection.styles';
import { CurrentUserContext } from '../context/currentUser';
import { insertPlayerInScrim, removePlayerFromScrim } from '../services/scrims';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { RANK_IMAGES, ROLE_IMAGES } from '../utils/imageMaps';
import Tooltip from '../components/shared/Tooltip';
import AdminArea from './shared/AdminArea';

// icons
import SwapIcon from '@material-ui/icons/SwapHoriz';
import JoinIcon from '@material-ui/icons/MeetingRoom';
import ExitIcon from '@material-ui/icons/NoMeetingRoom';
import KickIcon from '@material-ui/icons/HighlightOff';

const compareArrays = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].name !== arr2[i].name) return false;
  }

  // If all elements were same.
  return true;
};

export default function ScrimTeamList({
  playerEntered,
  scrim,
  getNewScrimsData,
  teamOne,
  teamTwo,
  teamData,
  casterEntered,
}) {
  const [currentUser] = useContext(CurrentUserContext);
  const classes = useScrimSectionStyles();

  const gameEnded = useMemo(() => scrim.teamWon, [scrim.teamWon]);

  const { teamRoles, teamName, teamTitleName, teamArray } = teamData;

  const joinGame = async (teamJoiningName, role) => {
    getNewScrimsData();

    if (casterEntered) {
      alert("You're already a caster for this game!");
      return;
    }

    const dataSending = {
      playerData: {
        ...currentUser,
        role,
        team: { name: teamJoiningName },
      },
    };

    const updatedScrim = await insertPlayerInScrim(scrim._id, dataSending);

    if (updatedScrim) {
      getNewScrimsData();
    }
  };

  const handleMovePlayer = async (teamStr, role) => {
    getNewScrimsData();

    let currentTeamName = playerEntered.team.name;
    const currentTeamArr = currentTeamName === 'teamOne' ? teamOne : teamTwo;

    let teamArr = teamStr === 'teamOne' ? teamOne : teamTwo;

    let dataSending = {};

    // if is swapping teams
    if (compareArrays(currentTeamArr, teamArr) === false) {
      console.log(`swapping teams for summoner ${currentUser.name}`);

      dataSending = {
        playerData: {
          ...currentUser,
          role,
          team: { name: teamStr },
        },

        swapData: {
          isChangingTeams: true,
          isMoving: true,
          currentTeamName: playerEntered.team.name,
          teamChangingToName: teamStr,
        },
      };
    } else {
      dataSending = {
        playerData: {
          ...currentUser,
          role,
          team: { name: teamStr },
        },
        swapData: {
          isMoving: true,
        },
      };
    }

    const updatedScrim = await insertPlayerInScrim(scrim._id, dataSending);

    if (updatedScrim) {
      console.log(
        `%cswapped ${currentUser.name} in scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      getNewScrimsData();
    }
  };

  const leaveGame = async (teamLeavingName) => {
    const dataSending = {
      playerData: {
        ...currentUser,
        role: playerEntered.role,
        teamLeavingName,
        isLobbyHost: scrim.lobbyHost?.name === playerEntered.name,
      },
    };

    const updatedScrim = await removePlayerFromScrim(scrim._id, dataSending);

    if (updatedScrim) {
      console.log(
        `%cremoved ${currentUser.name} from scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      getNewScrimsData();
    }
  };

  const kickPlayerFromGame = async (playerToKick, teamLeavingName) => {
    if (currentUser.adminKey !== process.env.REACT_APP_ADMIN_KEY) return;

    const dataSending = {
      playerData: {
        ...playerToKick,
        role: playerToKick.role,
        teamLeavingName,
        isLobbyHost: scrim.lobbyHost?.name === playerToKick.name,
      },
    };

    const updatedScrim = await removePlayerFromScrim(scrim._id, dataSending);

    if (updatedScrim) {
      console.log(
        `%ckicked ${currentUser.name} from scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      getNewScrimsData();
    }
  };

  return (
    <div className={`team-container team-container--${teamName}`}>
      <h4>{teamTitleName}:</h4>

      <List className={classes.teamList}>
        {teamRoles.map((teamRole, idx) => {
          const playerAssigned = teamArray.find(
            (player) => player?.role === teamRole
          );

          const isCurrentUser = playerAssigned?.name === currentUser?.name;

          if (playerAssigned) {
            return (
              <Fragment key={idx}>
                {idx !== 0 ? <Divider component="div" /> : null}
                <ListItem alignItems="center" className={classes.teamListItem}>
                  <ListItemAvatar>
                    <Avatar
                      alt={playerAssigned.role}
                      src={ROLE_IMAGES[teamRole]}
                    />
                  </ListItemAvatar>

                  <ListItemText
                    primary={
                      <Grid container alignItems="center">
                        <a
                          className="link"
                          href={`https://${playerAssigned.region}.op.gg/summoner/userName=${playerAssigned?.name}`}
                          target="_blank"
                          rel="noreferrer">
                          {playerAssigned?.name}
                        </a>
                        {playerAssigned.rank !== 'Unranked' && (
                          <>
                            &nbsp;
                            <img
                              width="25px"
                              style={{ objectFit: 'cover' }}
                              alt={playerAssigned.role}
                              src={
                                // replace number with empty string: Diamond 1 => Diamond
                                // get rank image from images map by player.rank
                                RANK_IMAGES[
                                  playerAssigned?.rank.replace(/[^a-z$]/gi, '')
                                ]
                              }
                            />
                          </>
                        )}
                      </Grid>
                    }
                    secondary={
                      <>
                        {playerAssigned?.discord && (
                          <>
                            Discord -&nbsp;
                            <Typography
                              component="span"
                              variant="body2"
                              className={classes.inline}
                              color="textPrimary">
                              {playerAssigned?.discord}
                            </Typography>
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
                          {playerAssigned?.rank}
                        </Typography>
                      </>
                    }
                  />

                  {isCurrentUser
                    ? // don't let user leave if game has already ended
                      !gameEnded && (
                        <Tooltip title="Leave">
                          <IconButton
                            className={classes.iconButton}
                            onClick={() => leaveGame(teamName)}>
                            <ExitIcon />
                          </IconButton>
                        </Tooltip>
                      )
                    : // don't let admins kick if game has ended.
                      !gameEnded && (
                        <AdminArea>
                          <Tooltip title={`Kick ${playerAssigned.name}`}>
                            <IconButton
                              className={classes.iconButton}
                              onClick={() => {
                                let yes = window.confirm(
                                  `Are you sure you want to kick ${playerAssigned.name}?`
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
