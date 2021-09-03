const capitalizeWord = ([first, ...rest]) => {
  return [first.toUpperCase(), ...rest].join('');
};

module.exports = capitalizeWord;
