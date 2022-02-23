import React, { Fragment, useMemo, useCallback } from 'react';

// components
import Typography from '@mui/material/Typography';
import LinearProgress from '@mui/material/LinearProgress';
import Grid from '@mui/material/Grid';
import Sparkles from '../shared/effects/Sparkles';

// utils
import { makeStyles } from '@mui/styles';
import useCountdown from '../../hooks/useCountdown';
import { twoDigitsFormat as formatNum } from '../../utils/twoDigitsFormat';

export default function CountdownTimer({ scrim, setGameStarted, gameStarted }) {
  const onTimerComplete = useCallback(() => {
    setGameStarted(scrim?._id);
  }, [scrim?._id, setGameStarted]);

  const { timerDays, timerHours, timerMinutes, timerSeconds, isTimerStarted } =
    useCountdown(scrim?.gameStartTime, onTimerComplete);

  const classes = useStyles(); // useStyles defined below component

  const teamsFilled = useMemo(
    () => scrim.teamOne.length === 5 && scrim.teamTwo.length === 5,
    [scrim.teamOne, scrim.teamTwo]
  );

  const gameStatusText = useMemo(() => {
    if (!teamsFilled) return 'WAITING FOR PLAYERS';

    const winnerAliases = {
      teamOne: 'Team One (Blue Side)',
      teamTwo: 'Team Two (Red Side)',
    };

    if (scrim.teamWon)
      return (
        <Sparkles>
          {`${winnerAliases[scrim.teamWon]} Won!`.toUpperCase()}
        </Sparkles>
      );

    return 'GAME IN PROGRESS';
  }, [scrim.teamWon, teamsFilled]);

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
        {timerDays !== 0 && (
          <>
            <section aria-label="timer-days">
              <TimerText>{formatNum(timerDays)}</TimerText>
              <TimerText>
                <small>Days</small>
              </TimerText>
            </section>
            <TimerText>:</TimerText>
          </>
        )}
        {timerHours !== 0 && (
          <>
            <section aria-label="timer-hours">
              <TimerText>{formatNum(timerHours)}</TimerText>
              <TimerText>
                <small>Hours</small>
              </TimerText>
            </section>
            <TimerText>:</TimerText>
          </>
        )}
        {timerMinutes !== 0 && (
          <>
            <section aria-label="timer-minutes">
              <TimerText>{formatNum(timerMinutes)}</TimerText>
              <TimerText>
                <small>Minutes</small>
              </TimerText>
            </section>
            <TimerText>:</TimerText>
          </>
        )}
        <section aria-label="timer-seconds">
          <TimerText>{formatNum(timerSeconds)}</TimerText>
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
