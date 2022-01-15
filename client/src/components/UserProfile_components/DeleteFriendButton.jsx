import { useCallback, useState } from 'react';
import useAlerts from './../../hooks/useAlerts';
import { useDispatch } from 'react-redux';
import useTheme from '@mui/material/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

// components
import Button from '@mui/material/Button';
import Tooltip from '../shared/Tooltip';

// services
import { unfriendUser } from './../../services/friends.services';

// icons
import CancelIcon from '@mui/icons-material/Cancel';

// utils
import { encode } from 'html-entities';

export default function DeleteFriendButton({
  currentUser,
  friendToDelete,
  setFriend,
}) {
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.up('sm'));

  const { setCurrentAlert } = useAlerts();
  const dispatch = useDispatch();

  const onDeleteFriend = useCallback(async () => {
    let yes = window.confirm(
      `Are you sure you want to unfriend ${encode(friendToDelete.name)}?`
    );

    if (!yes) return;

    try {
      setButtonsDisabled(true);
      const { userFriends } = await unfriendUser(friendToDelete._id);

      // change the state of friend's profile page as well on client side
      setFriend((prevState) => ({
        ...prevState,
        friends: prevState.friends.filter(
          ({ _id }) => String(_id) !== currentUser?._id
        ),
      }));

      dispatch({
        type: 'auth/updateCurrentUser',
        payload: {
          friends: userFriends,
        },
      });

      setCurrentAlert({
        type: 'Success',
        message: `Unfriended ${friendToDelete.name}`,
      });

      setButtonsDisabled(false);
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: `error unfriending ${friendToDelete.name}`,
      });

      setButtonsDisabled(false);
    }
  }, [dispatch, currentUser, setCurrentAlert, friendToDelete, setFriend]);

  return (
    <Tooltip title={`Unfriend ${friendToDelete?.name}`}>
      <Button
        style={{
          width: '100%',
          height: '50px',
          alignSelf: 'center',
          marginLeft: !matchesSm ? '0' : '20px',
          marginTop: '20px',
        }}
        startIcon={<CancelIcon />}
        variant="contained"
        disabled={buttonsDisabled}
        onClick={onDeleteFriend}>
        Unfriend
      </Button>
    </Tooltip>
  );
}
