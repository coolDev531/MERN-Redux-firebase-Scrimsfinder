const capitalizeWord = ([first, ...rest]) => {
  return [first.toUpperCase(), ...rest.join('').toLowerCase()].join('');
};

module.exports = capitalizeWord;
