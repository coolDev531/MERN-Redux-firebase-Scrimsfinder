import { useCallback, useState, useEffect, useMemo } from 'react';

// components
import Grid from '@mui/material/Grid';
import Moment from 'react-moment';

const ProfileAccountDetails = ({ user, userParticipatedScrims }) => {
  const [userExp, setUserExp] = useState(0);
  const [userWinrate, setUserWinrate] = useState(0);
  const [userGamesPlayedCount, setUserGamesPlayedCount] = useState(0);

  // calculates the EXP and winrate, also gives us games played count
  const calcExpAndWinrate = useCallback(() => {
    if (!userParticipatedScrims.length) return;

    let expResult = 0;

    let gamesPlayedCount = 0;
    let playerWinsCount = 0;
    let playerLossCount = 0;

    for (let i = 0; i < userParticipatedScrims.length; i++) {
      const scrim = userParticipatedScrims[i];

      // if scrim doesn't have a winning team, skip this and go to the next scrim
      if (!scrim.teamWon) continue;

      const scrimTeams = [...scrim.teamOne, ...scrim.teamTwo];

      const foundPlayer = scrimTeams.find(
        (player) => player._user === user._id
      );

      const foundCaster = scrim.casters.find(
        (player) => player._id === user._id
      );

      if (foundCaster) {
        expResult += 1;
        continue;
        // skip other operations if the player is a caster, we don't need to loop through the teams
      }

      if (foundPlayer) {
        gamesPlayedCount += 1;
      }

      const playerTeamName = foundPlayer?.team?.name; // TeamOne, TeamTwo.
      const playerTeamNumber = playerTeamName === 'teamOne' ? '1' : '2';

      const winnerTeam = scrim?.teamWon;
      const playerWon = winnerTeam?.includes(playerTeamNumber);

      if (playerWon) {
        expResult += 3;
        playerWinsCount += 1;
      } else {
        expResult += 0.5;
        playerLossCount += 1;
      }
    }

    // here the winrate is calculated
    const winRateResult = Math.floor(
      (playerWinsCount / (playerWinsCount + playerLossCount)) * 100
    );

    return [expResult, winRateResult, gamesPlayedCount];
  }, [userParticipatedScrims, user._id]);

  const userLevel = useMemo(() => {
    let level = 1;

    for (let i = 1; i < userExp; i++) {
      //if Number is divisible by 10, level up
      if (i % 10 === 0) level += 1;
    }

    return level;
  }, [userExp]);

  useEffect(() => {
    const [expResult, winRateResult, gamesPlayedCount] = calcExpAndWinrate();
    setUserExp(expResult);
    setUserWinrate(winRateResult);
    setUserGamesPlayedCount(gamesPlayedCount);

    return () => {
      setUserExp(0);
      setUserGamesPlayedCount(0);
      setUserWinrate(0);
    };
  }, [user._id, calcExpAndWinrate]);

  return user?._id ? (
    <Grid
      style={{ padding: 0, margin: 0 }}
      container
      direction="column"
      component="ul"
      spacing={1}>
      <Grid item spacing={1} container component="li" alignItems="center">
        <Grid item>
          <strong>Name:</strong>&nbsp;{user.name}
        </Grid>
        <Grid item>
          | <strong>Level:</strong>&nbsp;{userLevel}
        </Grid>

        <Grid item>
          | <strong>EXP:</strong>&nbsp;{userExp}
        </Grid>
      </Grid>

      <Grid item spacing={1} container component="li" alignItems="center">
        <Grid item>
          <strong>Games Played:</strong>&nbsp;{userGamesPlayedCount}
        </Grid>
        <Grid item>
          | <strong>Winrate:</strong>&nbsp;{userWinrate}%
        </Grid>
      </Grid>

      <Grid item container component="li" alignItems="center">
        <strong>Discord:</strong>&nbsp;{user.discord}
      </Grid>

      <Grid item container component="li" alignItems="center">
        <strong>Region:</strong>&nbsp;{user.region}
      </Grid>

      <Grid item container component="li" alignItems="center">
        <strong>Rank:</strong>&nbsp;{user.rank}
      </Grid>

      <Grid item container component="li" alignItems="center">
        <strong>Joined:</strong>&nbsp;
        <Moment format="MM/DD/yyyy">{user.createdAt}</Moment>
      </Grid>
    </Grid>
  ) : null;
};

export default ProfileAccountDetails;
