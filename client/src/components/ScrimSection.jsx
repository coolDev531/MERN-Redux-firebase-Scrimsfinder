export default function ScrimSection({ scrim, idx }) {
  const teamOneRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  const teamTwoRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const { teamOne, teamTwo, casters } = scrim;

  const excludeSeconds = { hour: '2-digit', minute: '2-digit' };

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
                <button>join</button>
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
                  {player?.role ?? ''}: &nbsp;
                  {player?.name ?? ''}
                </div>
              );
            }

            return (
              <div className="scrim__section-playerBox" key={key}>
                {teamRole}
                <button>join</button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
