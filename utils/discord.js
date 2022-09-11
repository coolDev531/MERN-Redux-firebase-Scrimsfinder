/**
 * @method removeSpacesBeforeHashTag
 * takes a discord name and trims the spaces.
 * @param {String} str
 * @returns {String}
 */
const removeSpacesBeforeHashTag = (str) => {
  // for discord name
  // I'm doing this because right now people are typing out their discord, so I want to trim the spaces before the # so it's easier to compare if it already exists.
  return str
    .trim()
    .replace(/\s([#])/g, function (_el1, el2) {
      return '' + el2;
    })
    .replace(/(«)\s/g, function (_el1, el2) {
      return el2 + '';
    });
};

module.exports = {
  removeSpacesBeforeHashTag,
};
