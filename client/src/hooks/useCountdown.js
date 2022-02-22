import { useState, useEffect, useRef, useCallback } from 'react';

/* The total number of seconds in a day is 60 * 60 * 24 and if we want to get the milliseconds, 
  we need to multiply it by 1000 so the number 1000 * 60 * 60 * 24 is the total number of milliseconds in a day. */
const SECONDS_IN_DAY = 60 * 60 * 24; // not in MS

// time variables in milliseconds for CountdownTimer calculations.
const ONE_DAY_IN_MS = 1000 * SECONDS_IN_DAY; // one day in milliseconds
const ONE_HOUR_IN_MS = 1000 * 60 * 60; // one hour in milliseconds
const ONE_MINUTE_IN_MS = 1000 * 60; // one minute in milliseconds
const ONE_SECOND_IN_MS = 1000; // one second in milliseconds

export default function useCountdown(dateToCountdownFrom, onComplete) {
  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [timerDays, setTimerDays] = useState(0);
  const [timerHours, setTimerHours] = useState(0);
  const [timerMinutes, setTimerMinutes] = useState(0);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // preserve the interval id between renders
  let intervalRef = useRef(null);

  const startTimer = useCallback(() => {
    const countdownDate = new Date(dateToCountdownFrom).getTime(); // milliseconds

    intervalRef.current = setInterval(() => {
      setIsTimerStarted(true);

      const now = new Date().getTime(); // now in milliseconds.
      const difference = countdownDate - now; // difference in milliseconds

      // Dividing the difference (difference) by ONE_DAY_IN_MS and discarding the values after the decimal, we get the number of days.
      const days = Math.floor(difference / ONE_DAY_IN_MS);

      /* The first operation (%) is used to basically discard the part of the difference representing days 
      (% returns the remainder of the division so the days portion of the difference is taken out. 
        In the next step (division), ONE_HOUR_IN_MS is the total number of milliseconds in an hour. 
        So dividing the remainder of the difference by this number will give us the number of hours. */
      const hours = Math.floor((difference % ONE_DAY_IN_MS) / ONE_HOUR_IN_MS);

      /* The first operation (%) takes out the hours portion from difference 
        and the division (ONE_MINUTE_IN_MS) returns the minutes (as ONE_MINUTE_IN_MS is the number of milliseconds in a minute) */
      const minutes = Math.floor(
        (difference % ONE_HOUR_IN_MS) / ONE_MINUTE_IN_MS
      );

      /* Here the first operation (%) takes out the minutes part
       and the second operation (division) returns the number of seconds. */
      const seconds = Math.floor(
        (difference % ONE_MINUTE_IN_MS) / ONE_SECOND_IN_MS
      );

      if (difference < 0) {
        // stop timer
        clearInterval(intervalRef.current);
        onComplete();
      } else {
        setTimerDays(days);
        setTimerHours(hours);
        setTimerMinutes(minutes);
        setTimerSeconds(seconds);
      }
    }, 1000);
  }, [dateToCountdownFrom, onComplete]);

  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(intervalRef.current);
    };
  }, [startTimer]);

  return { timerDays, timerHours, timerMinutes, timerSeconds, isTimerStarted };
}
