/**
 * @method setHours
 * takes a date and moves it's current time to chosen time in 2nd param.
 * @param {Date} dt // the date value to convert.
 * @param {String} h // hours to move to, for example: 3:30am, 9:15pm, etc.
 * @return {Date}
 */
function setHours(dt, h) {
  var s = /(\d+):(\d+)(.+)/.exec(h);
  dt.setHours(s[3] === 'pm' ? 12 + parseInt(s[1], 10) : parseInt(s[1], 10));
  dt.setMinutes(parseInt(s[2], 10));
  return dt;
}

module.exports = setHours;
// let d = new Date(); => Sat Aug 21 2021 09:59:45 GMT-0400 (Eastern Daylight Time)
// setHours(d, '3:30pm') => Sat Aug 21 2021 15:30:45 GMT-0400 (Eastern Daylight Time)
