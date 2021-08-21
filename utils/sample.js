/**
 * @method sample
 * @param {Array} array
 * @return {String} takes an array of strings and returns a random element, the random element being a string.
 */
const sample = (array) => array[Math.floor(Math.random() * array.length)];

module.exports = sample;
