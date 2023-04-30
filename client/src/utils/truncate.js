/**
 * @method truncate
 *  truncate string when it's length is greater than the n arguement
 * @param {String} str
 * @param {Number} n
 * @return {string}
 */
// this is made specifically for MenuItem text overflow in ScrimTeamList.jsx.
export const truncate = (str, n) => {
  if (!str) {
    return '';
  }

  if (typeof str === 'string') {
    return str?.length > n ? `${str?.substr(0, n - 1)} ...` : str ?? '';
  }
};
