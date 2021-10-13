/**
 * @method getCamelCaseTeamName
 * @param {String} teamNameUnformatted not camelCased team name from back-end, ex: Team 1 (Blue Side)
 * @returns {String} formated camelCased team name
 */
export const getCamelCaseTeamName = (teamNameUnformatted) => {
  if (!teamNameUnformatted) return null;

  const resultTeamName = teamNameUnformatted.includes('1')
    ? 'teamOne'
    : 'teamTwo';

  return resultTeamName;
};

/**
 * @method getTeamBackgroundColor
 * @param {String} teamName
 * @param {String} winnerTeamNameUnformatted not camelCased team name from back-end, ex: Team 1 (Blue Side)
 * @returns {{normal: string, gradient: string}}
 */
export const getTeamBackgroundColor = (teamName, winnerTeamNameUnformatted) => {
  const initialState = {
    normal: 'inherit',
    gradient: 'inherit',
  };

  if (!winnerTeamNameUnformatted) return initialState;

  const winnerTeamName = getCamelCaseTeamName(winnerTeamNameUnformatted);

  const greenResult = {
    normal: '#63d471',
    gradient: 'linear-gradient(315deg, #63d471 0%, #233329 74%)',
  };

  const redResult = {
    gradient:
      'linear-gradient(315deg, rgb(224, 69, 95) 0%, rgb(68, 0, 11) 74%)',
    normal: '#e0455f',
  };

  return teamName === winnerTeamName ? greenResult : redResult;
};
