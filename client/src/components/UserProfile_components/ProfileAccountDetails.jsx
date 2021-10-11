import { useCallback, useState, useEffect, useMemo } from 'react';

// components
import Grid from '@mui/material/Grid';
import Moment from 'react-moment';

const ProfileAccountDetails = ({ user, userParticipatedScrims }) => {
  const [userExp, setUserExp] = useState(0);

  const calcExp = useCallback(() => {
    if (!userParticipatedScrims.length) return;

    let exp = 0;

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
        exp += 1;
        continue;
        // skip other operations if the player is a caster, we don't need to loop through the teams
      }

      const playerTeamName = foundPlayer?.team?.name; // TeamOne, TeamTwo.
      const playerTeamNumber = playerTeamName === 'teamOne' ? '1' : '2';

      const winnerTeam = scrim?.teamWon;
      const playerWon = winnerTeam?.includes(playerTeamNumber);

      if (playerWon) {
        exp += 3;
      } else {
        exp += 0.5;
      }
    }

    return exp;
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
    const expResult = calcExp();
    setUserExp(expResult);

    return () => {
      setUserExp(0);
    };
  }, [user._id, calcExp]);

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
