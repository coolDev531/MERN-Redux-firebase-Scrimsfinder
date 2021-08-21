import { useContext, useEffect, useState } from 'react';
import { CurrentUserContext } from '../context/currentUser';
import { updateScrim } from '../services/scrims';

export default function ScrimSection({ scrim, idx, getNewScrimsData }) {
  const { teamOne, teamTwo, casters } = scrim;

  const [currentUser] = useContext(CurrentUserContext);
  const [playerEntered, setPlayerEntered] = useState(false);

  useEffect(() => {
    const teams = [...teamOne, teamTwo];

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

    const scrimData = {
      ...scrim,
      [teamStr]: [...teamArr, { ...currentUser, role }],
    };

    const updatedScrim = await updateScrim(scrim._id, scrimData);

    if (updatedScrim) {
      getNewScrimsData();
    }
  };

  const swapRole = async (teamStr, role) => {
    const currentRole = playerEntered.role;
    let teamArr = teamStr === 'teamOne' ? teamOne : teamTwo;

    let filtered = teamArr.filter((player) => player.role !== currentRole);

    const scrimData = {
      ...scrim,
      [teamStr]: [...filtered, { ...currentUser, role }],
    };

    const updatedScrim = await updateScrim(scrim._id, scrimData);

    if (updatedScrim) {
      getNewScrimsData();
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
                <div className="scrim__section-playerBox" key={key}>
                  {player?.role ?? ''}: &nbsp;
                  {player?.name ?? ''}
                </div>
              );
            }

            return (
              <div className="scrim__section-playerBox" key={key}>
                {teamRole}
                {!playerEntered ? (
                  <button onClick={() => joinTeam('teamOne', teamRole)}>
                    join
                  </button>
                ) : (
                  <button onClick={() => swapRole('teamOne', teamRole)}>
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
                <div className="scrim__section-playerBox" key={key}>
                  {player?.role}: &nbsp;
                  {player?.name}
                </div>
              );
            }

            return (
              <div className="scrim__section-playerBox" key={key}>
                {teamRole}
                {!playerEntered ? (
                  <button onClick={() => joinTeam('teamTwo', teamRole)}>
                    join
                  </button>
                ) : (
                  <button onClick={() => swapRole('teamTwo', teamRole)}>
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
