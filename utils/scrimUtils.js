const toIsoString = require('./toIsoString');

const checkIfScrimIsToday = (scrim) => {
  let now = Date.now();
  let nowDate = new Date(now).setHours(0, 0, 0, 0);
  let today = toIsoString(nowDate);

  let scrimGameDay = new Date(scrim.gameStartTime).setHours(0, 0, 0, 0);
  let scrimIso = toIsoString(scrimGameDay);

  return today === scrimIso;
};

const checkIfScrimIsInACertainDate = (scrim, date) => {
  let certainDate = new Date(date).setHours(0, 0, 0, 0);
  certainDateIso = toIsoString(certainDate);

  let scrimGameDay = new Date(scrim.gameStartTime).setHours(0, 0, 0, 0);
  let scrimIso = toIsoString(scrimGameDay);

  return certainDateIso === scrimIso;
};

module.exports = {
  checkIfScrimIsInACertainDate,
  checkIfScrimIsToday,
};
