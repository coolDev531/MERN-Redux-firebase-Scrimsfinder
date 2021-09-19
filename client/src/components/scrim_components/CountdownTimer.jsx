import React, { Fragment, useState, useEffect, useMemo } from 'react';

// components
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';

// utils
import { makeStyles } from '@mui/styles';

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

const Text = ({ children }) => {
  const classes = useStyles();
  return (
    <Typography className={classes.timerText} variant="body2">
      {children}
    </Typography>
  );
};

function CountdownTimer({ scrim, setGameStarted, gameStarted }) {
  const classes = useStyles();

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
    if (!teamsFilled) return 'WAITING FOR PLAYERS.';

    if (scrim.teamWon) return `${scrim.teamWon} Won!`.toUpperCase();
    return `GAME IN PROGRESS`;
  }, [scrim.teamWon, teamsFilled]);

  let interval = null;

  const startTimer = () => {
    const countdownDate = new Date(scrim?.gameStartTime).getTime();

    interval = setInterval(() => {
      const now = new Date().getTime();
      const difference = countdownDate - now;
      setIsTimerStarted(true);
      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

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
        <Text>{gameStatusText}</Text>
      </div>
    );
  }

  return (
    <Fragment>
      <div className={classes.timer}>
        {timerDays != '00' && (
          <>
            <section aria-label="timer-days">
              <Text>{timerDays}</Text>
              <Text>
                <small>Days</small>
              </Text>
            </section>
            <Text>:</Text>
          </>
        )}
        {timerHours != '00' && (
          <>
            <section aria-label="timer-hours">
              <Text>{timerHours}</Text>
              <Text>
                <small>Hours</small>
              </Text>
            </section>
            <Text>:</Text>
          </>
        )}
        {timerMinutes != '00' && (
          <>
            <section aria-label="timer-minutes">
              <Text>{timerMinutes}</Text>
              <Text>
                <small>Minutes</small>
              </Text>
            </section>
            <Text>:</Text>
          </>
        )}
        <section aria-label="timer-seconds">
          <Text>{timerSeconds}</Text>
          <Text>
            <small>Seconds</small>
          </Text>
        </section>
      </div>
    </Fragment>
  );
}

export default CountdownTimer;
