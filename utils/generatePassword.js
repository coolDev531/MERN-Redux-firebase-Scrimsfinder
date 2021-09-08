/**
 * @method generatePassword
  generates a random password 
  is asyncrhonus because of being used in the creation of a scrim, wait for pass to be generated before continuing.
 * @return {String} returns the result password.
 */
const generatePassword = async () => {
  const CHARACTERS_LENGTH = 8;

  let pass = '';

  let str =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz0123456789@#$';

  for (i = 1; i <= CHARACTERS_LENGTH; i++) {
    let randomIndex = Math.floor(Math.random() * str.length + 1);

    pass += str.charAt(randomIndex);
  }

  return pass;
};

module.exports = generatePassword;
