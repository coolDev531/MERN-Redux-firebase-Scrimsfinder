/**
 * @method sample
 * @param {Array} array of users
 * @return {Object} takes an array of objects and returns a random element, the random element being a object.
 */
export const sample = (array) =>
  array[Math.floor(Math.random() * array.length)];
