import { useContext, useEffect, useState } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { updateScrim } from '../services/scrims';

export default function ScrimSection({ scrim, idx, getNewScrimsData }) {
  const { teamOne, teamTwo, casters } = scrim;

  const [currentUser] = useContext(CurrentUserContext);
  const [playerEntered, setPlayerEntered] = useState(false);

  useEffect(() => {
    const teams = [...teamOne, ...teamTwo];

    let foundPlayer = teams.find((player) => player.name === currentUser.name);

    return foundPlayer
      ? setPlayerEntered(foundPlayer)
      : setPlayerEntered(false);
  }, [scrim, currentUser.name, teamOne, teamTwo]);

  const teamOneRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  const teamTwoRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const excludeSeconds = { hour: '2-digit', minute: '2-digit' };

  const joinTeam = async (teamStr, role) => {
    const teamArr = teamStr === 'teamOne' ? teamOne : teamTwo;

    const playerData = { ...currentUser, role };

    const newPlayer = {
      ...currentUser,
      role,
      team: { name: teamStr, value: [...teamArr, playerData] },
    };

    const scrimData = {
      ...scrim,
      [teamStr]: [
        ...teamArr,
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

  const compareArrays = (arr1, arr2) => {
    if (arr1.length !== arr2.length) return false;

    for (let i = 0; i < arr1.length; i++) {
      if (arr1[i].name !== arr2[i].name) return false;
    }

    // If all elements were same.
    return true;
  };

  function swapPlayer(currentTeam, movingTeam, movingPlayer) {
    const indexToRemove = currentTeam.findIndex(
      (p) => p && p.name === movingPlayer.name
    );
    if (indexToRemove > -1) currentTeam.splice(indexToRemove, 1);
    movingTeam = [...movingTeam, movingPlayer];
    return [currentTeam, movingTeam];
  }

  const swapRole = async (e, teamStr, role) => {
    let teamMovingTo = e.target.parentNode.classList[1];
    let currentTeam = playerEntered.team;
    let teamArr = teamMovingTo === 'teamOne' ? teamOne : teamTwo;

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
        team: { name: teamMovingTo, value: teamJoined },
      };

      let teamLeavingName = teamMovingTo === 'teamOne' ? 'teamTwo' : 'teamOne';

      const scrimData = {
        ...scrim,
        [teamLeavingName]: teamLeft,
        [teamMovingTo]: [
          ...teamJoined.map((player) =>
            player.name === newPlayerData.name ? { ...newPlayerData } : player
          ),
        ],
      };

      const updatedScrim = await updateScrim(scrim._id, scrimData);

      if (updatedScrim) {
        console.log('updating with swapped data');
        getNewScrimsData();
      }

      return;
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

      const scrimData = {
        ...scrim,
        [teamStr]: [...filtered, { ...newPlayer }],
      };

      const updatedScrim = await updateScrim(scrim._id, scrimData);

      if (updatedScrim) {
        getNewScrimsData();
      }
    }
  };

  return (
    <div className="one-scrim-container" style={{ padding: '10px' }}>
      <div className="scrim__metadata">
        <h1>scrim {idx + 1}</h1>
        <h2>
          Game Start:&nbsp;
          {new Date(scrim.gameStartTime).toLocaleString([], excludeSeconds)}
        </h2>

        <h2>Casters: {casters.map((caster) => caster).join(' & ')}</h2>
      </div>
      <div className="teams-container" style={{ display: 'flex', gap: '10%' }}>
        <div className="team-container team-container--teamOne">
          <h4>Team One:</h4>
          {teamOneRoles.map((teamRole, key) => {
            const player = teamOne.find((player) =>
              player.role.includes(teamRole)
            );

            if (player) {
              return (
                <div className="scrim__section-playerBox teamOne" key={key}>
                  {player?.role ?? ''}: &nbsp;
                  {player?.name ?? ''}
                </div>
              );
            }

            return (
              <div className="scrim__section-playerBox teamOne" key={key}>
                {teamRole}
                {!playerEntered ? (
                  <button onClick={() => joinTeam('teamOne', teamRole)}>
                    join
                  </button>
                ) : (
                  <button onClick={(e) => swapRole(e, 'teamOne', teamRole)}>
                    swap
                  </button>
                )}
              </div>
            );
          })}
        </div>

        <div className="team-container team-container--teamTwo">
          <h4>Team Two:</h4>
          {teamTwoRoles.map((teamRole, key) => {
            const player = teamTwo.find((player) =>
              player.role.includes(teamRole)
            );

            if (player) {
              return (
                <div className="scrim__section-playerBox teamTwo" key={key}>
                  {player?.role}: &nbsp;
                  {player?.name}
                </div>
              );
            }

            return (
              <div className="scrim__section-playerBox teamTwo" key={key}>
                {teamRole}
                {!playerEntered ? (
                  <button onClick={() => joinTeam('teamTwo', teamRole)}>
                    join
                  </button>
                ) : (
                  <button onClick={(e) => swapRole(e, 'teamTwo', teamRole)}>
                    swap
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
