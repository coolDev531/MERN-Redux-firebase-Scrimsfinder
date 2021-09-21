import React, { Fragment, useState, useEffect, useMemo } from 'react';

// components
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';

// utils
import { makeStyles } from '@mui/styles';

/* The total number of seconds in a day is 60 * 60 * 24 and if we want to get the milliseconds, 
  we need to multiply it by 1000 so the number 1000 * 60 * 60 * 24 is the total number of milliseconds in a day. */
const SECONDS_IN_DAY = 60 * 60 * 24; // not in MS

// time variables in milliseconds for CountdownTimer calculations.
const ONE_DAY_IN_MS = 1000 * SECONDS_IN_DAY; // one day in milliseconds
const ONE_HOUR_IN_MS = 1000 * 60 * 60; // one hour in milliseconds
const ONE_MINUTE_IN_MS = 1000 * 60; // one minute in milliseconds
const ONE_SECOND_IN_MS = 1000; // one second in milliseconds

export default function CountdownTimer({ scrim, setGameStarted, gameStarted }) {
  const classes = useStyles(); // useStyles defined below component

  const [isTimerStarted, setIsTimerStarted] = useState(false);
  const [timerDays, setTimerDays] = useState('00');
  const [timerHours, setTimerHours] = useState('00');
  const [timerMinutes, setTimerMinutes] = useState('00');
  const [timerSeconds, setTimerSeconds] = useState('00');

  const teamsFilled = useMemo(
    () => scrim.teamOne.length === 5 && scrim.teamTwo.length === 5,
    [scrim.teamOne, scrim.teamTwo]
  );

  const gameStatusText = useMemo(() => {
    if (!teamsFilled) return 'WAITING FOR PLAYERS';

    if (scrim.teamWon) return `${scrim.teamWon} Won!`.toUpperCase();
    return 'GAME IN PROGRESS';
  }, [scrim.teamWon, teamsFilled]);

  let interval = null;

  const startTimer = () => {
    const countdownDate = new Date(scrim?.gameStartTime).getTime(); // milliseconds

    interval = setInterval(() => {
      setIsTimerStarted(true);

      const now = new Date().getTime(); // now in milliseconds.
      const difference = countdownDate - now; // difference in milliseconds

      // Dividing the difference (difference) by ONE_DAY_IN_MS and discarding the values after the decimal, we get the number of days.
      const days = Math.floor(difference / ONE_DAY_IN_MS);

      /* The first operation (%) is used to basically discard the part of the difference representing days 
      (% returns the remainder of the division so the days portion of the difference is taken out. In the next step (division), 
      ONE_HOUR_IN_MS is the total number of milliseconds in an hour. 
      So dividing the remainder of the difference by this number will give us the number of hours.
      */
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

        clearInterval(interval);
      } else {
        setTimerDays(days);
        setTimerHours(hours);
        setTimerMinutes(minutes);
        setTimerSeconds(seconds);
      }
    }, 1000);
  };

  useEffect(() => {
    startTimer();
    return () => {
      clearInterval(interval);
    };
  });

  /* eslint eqeqeq: 0 */
  // disable == warning in react.
  useEffect(() => {
    if (
      isTimerStarted &&
      timerDays == '00' &&
      timerHours == '00' &&
      timerMinutes == '00' &&
      timerSeconds == '00'
    ) {
      // when timer reaches 0 (game starts), run the following code.
      clearInterval(interval);
      setGameStarted(scrim._id);
      setIsTimerStarted(false);
      console.log(
        `%cScrim starting for scrim: ${scrim?._id}`,
        'color: lightgreen'
      );
    }
    //disabling dependency array warning, can't add the other dependencies it's yelling at me to add without breaking the functionality.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [timerSeconds]);

  if (!isTimerStarted) {
    return (
      <Fragment>
        <Grid container direction="column">
          <Grid item component="section">
            <Typography gutterBottom variant="body2">
              Loading...
            </Typography>
            <LinearProgress className="linear-progress" />
          </Grid>
        </Grid>
      </Fragment>
    );
  }

  if (gameStarted) {
    return (
      <div className={classes.timer}>
        <TimerText>{gameStatusText}</TimerText>
      </div>
    );
  }

  return (
    <Fragment>
      <div className={classes.timer}>
        {timerDays != '00' && (
          <>
            <section aria-label="timer-days">
              <TimerText>{timerDays}</TimerText>
              <TimerText>
                <small>Days</small>
              </TimerText>
            </section>
            <TimerText>:</TimerText>
          </>
        )}
        {timerHours != '00' && (
          <>
            <section aria-label="timer-hours">
              <TimerText>{timerHours}</TimerText>
              <TimerText>
                <small>Hours</small>
              </TimerText>
            </section>
            <TimerText>:</TimerText>
          </>
        )}
        {timerMinutes != '00' && (
          <>
            <section aria-label="timer-minutes">
              <TimerText>{timerMinutes}</TimerText>
              <TimerText>
                <small>Minutes</small>
              </TimerText>
            </section>
            <TimerText>:</TimerText>
          </>
        )}
        <section aria-label="timer-seconds">
          <TimerText>{timerSeconds}</TimerText>
          <TimerText>
            <small>Seconds</small>
          </TimerText>
        </section>
      </div>
    </Fragment>
  );
}

const useStyles = makeStyles({
  timer: {
    background: 'white',
    color: '#000',
    fontSize: '22px',
    display: 'flex',
    textAlign: 'center',
    borderRadius: '3px',
    justifyContent: 'center',
    padding: '20px',
    '@supports (gap: 10px)': {
      gap: '10px',
    },
  },

  timerLoading: {
    display: 'flex',
    justifyContent: 'center',
    width: '25%',
    height: '20px',
  },

  timerText: {
    fontWeight: 600,
    color: 'green',
    fontSize: '22px !important',
  },
});

const TimerText = ({ children }) => {
  const classes = useStyles();
  return (
    <Typography className={classes.timerText} variant="body2">
      {children}
    </Typography>
  );
};
