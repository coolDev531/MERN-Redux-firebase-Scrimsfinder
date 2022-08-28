import { useDispatch } from 'react-redux';
import useProfileAccountDetails from '../../hooks/useProfileAccountDetails';

// components
import Grid from '@mui/material/Grid';
import Moment from 'react-moment';
import Tooltip from './../shared/Tooltip';

export default function ProfileAccountDetails({
  user,
  userParticipatedScrims,
}) {
  const {
    userExp,
    userLevel,
    userWinrate,
    userGamesPlayedCount,
    userGamesCastedCount,
  } = useProfileAccountDetails(userParticipatedScrims, user);

  const dispatch = useDispatch();

  const onViewMoreClick = () => {
    dispatch({
      type: 'general/openFriendsModal',
      payload: { user },
    });
  };

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
              <Tooltip title={`View ${user?.name}'s friends`}>
                <span style={{ cursor: 'pointer' }} onClick={onViewMoreClick}>
                  <b>View more</b>
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
}
