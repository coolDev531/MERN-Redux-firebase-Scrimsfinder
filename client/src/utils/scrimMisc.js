/**
 * @method getTeamBackgroundColor
 * for ScrimTeamList to render background color for winner/loser
 * @param {String} teamName
 * @param {String} winnerTeamName ex: teamOne, teamTwo
 * @returns {{normal: string, gradient: string}}
 */
export const getTeamBackgroundColor = (teamName, winnerTeamName) => {
  const initialState = {
    normal: 'inherit',
    gradient: 'inherit',
  };

  if (!winnerTeamName) return initialState;

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
