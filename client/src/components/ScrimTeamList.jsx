import { useContext, Fragment } from 'react';
import { useScrimSectionStyles } from '../styles/scrimSection.styles';
import { CurrentUserContext } from '../context/currentUser';
import { updateScrim } from '../services/scrims';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import Divider from '@material-ui/core/Divider';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import Avatar from '@material-ui/core/Avatar';
import { Grid, IconButton, Typography } from '@material-ui/core';
import { RANK_IMAGES, ROLE_IMAGES } from '../utils/imageMaps';
import Tooltip from '../components/shared/Tooltip';
import SwapIcon from '@material-ui/icons/SwapHoriz';
import JoinIcon from '@material-ui/icons/MeetingRoom';
// import ExitIcon from '@material-ui/icons/ExitToApp';
import ExitIcon from '@material-ui/icons/NoMeetingRoom';

const compareArrays = (arr1, arr2) => {
  if (arr1.length !== arr2.length) return false;

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i].name !== arr2[i].name) return false;
  }

  // If all elements were same.
  return true;
};

const swapPlayer = (currentTeam, movingTeam, movingPlayer) => {
  const indexToRemove = currentTeam.findIndex(
    (player) => player?.name === movingPlayer?.name
  );
  if (indexToRemove > -1) currentTeam.splice(indexToRemove, 1);
  movingTeam = [...movingTeam, movingPlayer];
  return [currentTeam, movingTeam];
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

  const { teamRoles, teamName, teamTitleName, teamArray } = teamData;

  const joinGame = async (teamJoiningName, role) => {
    if (casterEntered) {
      alert("You're already a caster for this game!");
      return;
    }
    const teamJoining = teamJoiningName === 'teamOne' ? teamOne : teamTwo;

    const playerData = { ...currentUser, role };

    const newPlayer = {
      ...currentUser,
      role,
      team: { name: teamJoiningName, value: [...teamJoining, playerData] },
    };

    const scrimData = {
      ...scrim,
      [teamJoiningName]: [
        ...teamJoining,
        {
          ...newPlayer,
        },
      ],
    };

    const updatedScrim = await updateScrim(scrim._id, scrimData);

    if (updatedScrim) {
      getNewScrimsData();
    }
  };

  const handleSwap = async (teamStr, role) => {
    let currentTeam = playerEntered.team;
    let teamArr = teamStr === 'teamOne' ? teamOne : teamTwo;
    let scrimData = {};
    // if is swapping teams
    if (compareArrays(currentTeam.value, teamArr) === false) {
      console.log(`swapping teams for summoner ${currentUser.name}`);

      let newPlayerData = {
        ...currentUser,
        role,
      };

      let [teamLeft, teamJoined] = swapPlayer(
        currentTeam.value,
        teamArr,
        newPlayerData
      );

      newPlayerData = {
        ...newPlayerData,
        team: { name: teamStr, value: teamJoined },
      };

      let teamLeavingName = teamStr === 'teamOne' ? 'teamTwo' : 'teamOne';

      scrimData = {
        ...scrim,
        [teamLeavingName]: teamLeft,
        [teamStr]: [
          ...teamJoined.map((player) =>
            player.name === newPlayerData.name ? { ...newPlayerData } : player
          ),
        ],
      };
    } else {
      let filtered = [...teamArr].filter(
        (player) => player.name !== currentUser?.name
      );

      const playerData = { ...currentUser, role };

      const newPlayer = {
        ...currentUser,
        role,
        team: { name: teamStr, value: [...filtered, playerData] },
      };

      scrimData = {
        ...scrim,
        [teamStr]: [...filtered, { ...newPlayer }],
      };
    }

    const updatedScrim = await updateScrim(scrim._id, scrimData);

    if (updatedScrim) {
      console.log(
        `%cswapped ${currentUser.name} in scrim: ${scrim._id}`,
        'color: #99ff99'
      );
      getNewScrimsData();
    }
  };

  const leaveGame = async (teamLeavingName) => {
    let teamLeavingArr = teamLeavingName === 'teamOne' ? teamOne : teamTwo;
    const scrimData = {
      ...scrim,
      [teamLeavingName]: teamLeavingArr.filter(
        (player) => player.name !== playerEntered.name
      ),
    };

    const updatedScrim = await updateScrim(scrim._id, scrimData);

    if (updatedScrim) {
      console.log(
        `%cremoved ${currentUser.name} from scrim: ${scrim._id}`,
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

                  {isCurrentUser && (
                    <Tooltip title="Leave">
                      <IconButton
                        className={classes.iconButton}
                        onClick={() => leaveGame(teamName)}>
                        <ExitIcon />
                      </IconButton>
                    </Tooltip>
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
                    <Tooltip title="Join">
                      <IconButton
                        onClick={() => joinGame(teamName, teamRole)}
                        className={classes.iconButton}>
                        <JoinIcon />
                      </IconButton>
                    </Tooltip>
                  ) : (
                    <>
                      <Tooltip title="Swap">
                        <IconButton
                          className={classes.iconButton}
                          onClick={() => handleSwap(teamName, teamRole)}>
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