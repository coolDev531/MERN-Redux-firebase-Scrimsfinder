function setHours(dt, h) {
  var s = /(\d+):(\d+)(.+)/.exec(h);
  dt.setHours(s[3] === 'pm' ? 12 + parseInt(s[1], 10) : parseInt(s[1], 10));
  dt.setMinutes(parseInt(s[2], 10));
}

// let d = new Date(); => Sat Aug 21 2021 09:59:45 GMT-0400 (Eastern Daylight Time)
// setHours(d, '3:30pm') => Sat Aug 21 2021 15:30:45 GMT-0400 (Eastern Daylight Time)
