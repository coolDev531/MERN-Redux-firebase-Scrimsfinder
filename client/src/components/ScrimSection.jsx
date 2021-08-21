export default function ScrimSection({ scrim }) {
  const teamOneRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];
  const teamTwoRoles = ['Top', 'Jungle', 'Mid', 'ADC', 'Support'];

  const { teamOne, teamTwo } = scrim;

  return (
    <div class="one-scrim-container">
      <h1>scrim</h1>
      <h2>Game Start: {new Date(scrim.gameStartTime).toLocaleString()}</h2>

      <div className="team-container team-container--teamOne">
        {teamOne.map((player) => (
          <div class="scrim__section-playerBox">{player.name}</div>
        ))}
      </div>
    </div>
  );
}
