// https://stackoverflow.com/questions/105034/how-to-create-a-guid-uuid
// num | 0 is equal to Math.trunc.

// just download uuid v4 npm library, lol.

/**
 * @method makeUuid
 * makes a valid v4 uuid
 * @returns {String}
 */
const makeUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (char) => {
    let randomNumber = (Math.random() * 16) | 0;
    let result = char == 'x' ? randomNumber : (randomNumber & 0x3) | 0x8;
    return result.toString(16);
  });
};

module.exports = makeUuid;
