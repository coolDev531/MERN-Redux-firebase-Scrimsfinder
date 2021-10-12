export const filterPlayerWon = (user, scrims) => {
  return scrims.filter((scrim) => {
    const scrimTeams = [...scrim.teamOne, ...scrim.teamTwo];

    const foundPlayer = scrimTeams.find((player) => player._user === user._id);

    if (!foundPlayer) return false;

    const playerTeamName = foundPlayer?.team?.name; // TeamOne, TeamTwo.
    const playerTeamNumber = playerTeamName === 'teamOne' ? '1' : '2';

    const winnerTeam = scrim?.teamWon;
    const playerWon = winnerTeam?.includes(playerTeamNumber);

    return playerWon;
  });
};

export const filterPlayerLost = (user, scrims) => {
  return scrims.filter((scrim) => {
    const scrimTeams = [...scrim.teamOne, ...scrim.teamTwo];

    const foundPlayer = scrimTeams.find((player) => player._user === user._id);

    if (!foundPlayer) return false;

    const playerTeamName = foundPlayer?.team?.name; // TeamOne, TeamTwo.
    const playerTeamNumber = playerTeamName === 'teamOne' ? '1' : '2';

    const winnerTeam = scrim?.teamWon;
    const playerWon = winnerTeam?.includes(playerTeamNumber);

    return !playerWon;
  });
};

export const filterLobbyCaptain = (user, scrims) => {
  return scrims.filter((scrim) => {
    let lobbyCaptainId = scrim?.lobbyHost ?? null;

    const foundCaptain = lobbyCaptainId === user?._id;

    return foundCaptain;
  });
};
