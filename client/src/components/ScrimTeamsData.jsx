import { useContext } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import ExitIcon from '@material-ui/icons/ExitToApp';
import { useScrimSectionStyles } from '../styles/scrimSection.styles';
import { updateScrim } from '../services/scrims';

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
    (p) => p && p.name === movingPlayer.name
  );
  if (indexToRemove > -1) currentTeam.splice(indexToRemove, 1);
  movingTeam = [...movingTeam, movingPlayer];
  return [currentTeam, movingTeam];
};

export default function ScrimPlayersData({
  playerEntered,
  scrim,
  getNewScrimsData,
  teamOne,
  teamTwo,
  teamData,
}) {
  const [currentUser] = useContext(CurrentUserContext);
  const classes = useScrimSectionStyles();

  const { teamRoles, teamName, teamTitleName, teamArray } = teamData;

  const joinGame = async (teamJoiningName, role) => {
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
        (player) => player.name !== currentUser.name
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

  const leaveGame = async (teamLeaving) => {
    let teamArr = teamLeaving === 'teamOne' ? teamOne : teamTwo;
    const scrimData = {
      ...scrim,
      [teamLeaving]: teamArr.filter(
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
      {teamRoles.map((teamRole, key) => {
        const playerAssigned = teamArray.find((player) =>
          player?.role?.includes(teamRole)
        );

        const isCurrentUser = teamArray.find((player) =>
          player?.name?.includes(currentUser.name)
        );

        if (playerAssigned) {
          return (
            <div className={`scrim__section-playerBox ${teamName}`} key={key}>
              {playerAssigned?.role ?? ''}: &nbsp;
              {playerAssigned?.name ?? ''}
              {isCurrentUser && (
                <ExitIcon
                  className={classes.icon}
                  onClick={() => leaveGame(teamName)}
                />
              )}
            </div>
          );
        } else
          return (
            <div className={`scrim__section-playerBox ${teamName}`} key={key}>
              {teamRole}
              {!playerEntered ? (
                <button onClick={() => joinGame(teamName, teamRole)}>
                  join
                </button>
              ) : (
                <>
                  <button onClick={() => handleSwap(teamName, teamRole)}>
                    swap
                  </button>
                </>
              )}
            </div>
          );
      })}
    </div>
  );
}
