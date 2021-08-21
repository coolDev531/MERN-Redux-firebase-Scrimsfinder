export default function ScrimSection({ scrim }) {
  const teamOneRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  const teamTwoRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const { teamOne, teamTwo } = scrim;

  const excludeSeconds = { hour: '2-digit', minute: '2-digit' };

  return (
    <div className="one-scrim-container" style={{ padding: '10px' }}>
      <h1>scrim</h1>
      <h2>
        Game Start:{' '}
        {new Date(scrim.gameStartTime).toLocaleString([], excludeSeconds)}
      </h2>
      <div className="teams-container" style={{ display: 'flex', gap: '10%' }}>
        <div className="team-container team-container--teamOne">
          <h4>Team One:</h4>
          {teamOne.map((player, key) => (
            <div className="scrim__section-playerBox" key={key}>
              {player.role}: &nbsp;
              {player.name}
            </div>
          ))}
        </div>

        <div className="team-container team-container--teamTwo">
          <h4>Team Two:</h4>
          {teamTwo.map((player, key) => (
            <div className="scrim__section-playerBox" key={key}>
              {player.role}: &nbsp;
              {player.name}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
