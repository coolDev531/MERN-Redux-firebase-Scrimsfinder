import { getMinutes } from './getMinutes';

// separate date, hours and minutes
export const getDateAndTimeSeparated = (dt) => {
  // convert it ISO date.
  let date = new Date(dt).toISOString();

  //  get hours
  let hours = new Date(date).getHours();

  // get minutes
  let minutes = getMinutes(new Date(date));

  // get only the date with the minutes and hours set to 0.

  let dateResult = new Date(date).setMinutes(0, 0, 0); // minutesValue, secondsValue, msValue

  dateResult = new Date(dateResult);

  return {
    date: dateResult,
    hours,
    minutes,
  };
};
