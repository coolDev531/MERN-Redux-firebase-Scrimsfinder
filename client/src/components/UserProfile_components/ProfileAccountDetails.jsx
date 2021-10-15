import { useCallback, useState, useEffect, useMemo } from 'react';
import { useDispatch } from 'react-redux';

// components
import Grid from '@mui/material/Grid';
import Moment from 'react-moment';
import Tooltip from './../shared/Tooltip';

const ProfileAccountDetails = ({ user, userParticipatedScrims }) => {
  const [userExp, setUserExp] = useState(0);
  const [userWinrate, setUserWinrate] = useState(0);
  const [userGamesPlayedCount, setUserGamesPlayedCount] = useState(0);
  const [userGamesCastedCount, setUserGamesCastedCount] = useState(0);

  const dispatch = useDispatch();

  // calculates the EXP and winrate, also gives us games played count
  // this function also gets games played count and games casted count, so it's not all calculations
  const calcExpAndWinrate = useCallback(() => {
    if (!userParticipatedScrims.length) return [0, 0, 0, 0];

    // the user exp
    let expResult = 0;

    // gamesPlayedCount will be used to display how many games user played, but isn't used here for calculations
    let gamesPlayedCount = 0;

    // these vars will be used to calculate winrate
    let gamesCastedCount = 0;
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

      // without using populate the array of casters is just an array of ids
      const foundCaster = scrim.casters.find(
        (casterId) => casterId === user._id
      );

      if (foundCaster) {
        expResult += 1; // one point for casting

        gamesCastedCount += 1;

        continue; // skip other operations if the player is a caster, we don't need to loop through the teams
      }

      if (foundPlayer) {
        gamesPlayedCount += 1;
      }

      const playerTeamName = foundPlayer?.team?.name; // TeamOne, TeamTwo.
      const playerTeamNumber = playerTeamName === 'teamOne' ? '1' : '2';

      const winnerTeam = scrim?.teamWon;
      const playerWon = winnerTeam?.includes(playerTeamNumber);

      if (playerWon) {
        expResult += 3; // 3 points for winning
        playerWinsCount += 1; // var for calculating winrate
      } else {
        expResult += 0.5; // half points for losing
        playerLossCount += 1; // var for calculating winrate
      }
    }

    // here the winrate is calculated
    const winRateResult = Math.floor(
      (playerWinsCount / (playerWinsCount + playerLossCount)) * 100
    );

    return [expResult, winRateResult, gamesPlayedCount, gamesCastedCount];
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
    const [expResult, winRateResult, gamesPlayedCount, gamesCastedCount] =
      calcExpAndWinrate();

    setUserExp(expResult);
    setUserWinrate(winRateResult);
    setUserGamesPlayedCount(gamesPlayedCount);
    setUserGamesCastedCount(gamesCastedCount);

    return () => {
      setUserExp(0);
      setUserWinrate(0);
      setUserGamesPlayedCount(0);
      setUserGamesCastedCount(0);
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
          <strong>Friends:</strong>&nbsp;{user.friends.length}{' '}
          {user.friends.length > 0 ? (
            <>
              |&nbsp;
              <Tooltip title={`view ${user?.name}'s friends`}>
                <span
                  style={{ cursor: 'pointer' }}
                  onClick={() =>
                    dispatch({
                      type: 'general/openFriendsModal',
                      payload: { friends: user?.friends, user },
                    })
                  }>
                  <b>View all</b>
                </span>
              </Tooltip>
            </>
          ) : null}
        </Grid>
      </Grid>

      <Grid item spacing={1} container component="li" alignItems="center">
        <Grid item>
          <strong>Games Played:</strong>&nbsp;{userGamesPlayedCount}
        </Grid>

        <Grid item>
          | <strong>Win Ratio:</strong>&nbsp;{userWinrate}%
        </Grid>
      </Grid>

      {userGamesCastedCount > 0 ? (
        <Grid item container component="li" alignItems="center">
          <strong>Games Casted:</strong>&nbsp;{userGamesCastedCount}
        </Grid>
      ) : null}

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
