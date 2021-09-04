const generatePassword = async () => {
  var pass = '';
  var str =
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ' + 'abcdefghijklmnopqrstuvwxyz0123456789@#$';

  for (i = 1; i <= 8; i++) {
    var char = Math.floor(Math.random() * str.length + 1);

    pass += str.charAt(char);
  }

  return pass;
};

module.exports = generatePassword;
