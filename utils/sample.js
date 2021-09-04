/**
 * @method sample
 * @param {Array} array
 * @return {Object} takes an array of elements and returns a random element, the random element being a object.
 */
const sample = (array) => array[Math.floor(Math.random() * array.length)];

module.exports = sample;
