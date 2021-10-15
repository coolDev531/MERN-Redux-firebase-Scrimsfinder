import { useState } from 'react';
import { useSelector } from 'react-redux';
import useAlerts from './../../hooks/useAlerts';
import useTheme from '@mui/styles/useTheme';
import useMediaQuery from '@mui/material/useMediaQuery';

// components
import FormGroup from '@mui/material/FormGroup';
import Button from '@mui/material/Button';

// services
// import { sendFriendRequest } from './../../services/users';

// utils
import devLog from './../../utils/devLog';

// icons
import SaveIcon from '@mui/icons-material/Create';
import AddFriendIcon from '@mui/icons-material/AddReaction';

export default function SendFriendRequest({ user }) {
  const [buttonsDisabled, setButtonsDisabled] = useState(false);
  const { currentUser } = useSelector(({ auth }) => auth);
  const { setCurrentAlert } = useAlerts();

  const theme = useTheme();
  const matchesSm = useMediaQuery(theme.breakpoints.up('sm'));

  const onSubmitFriendRequest = async () => {
    setButtonsDisabled(true);

    try {
      // devLog('updated user friend requests', updatedUser.friendRequests);

      setCurrentAlert({
        type: 'Success',
        message: `Friend request sent to ${user.name}!`,
      });

      setButtonsDisabled(false);
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: 'Error sending friend request',
      });

      setButtonsDisabled(false);
      throw error;
    }
  };

  return (
    <FormGroup row>
      <Button
        style={{
          height: '50px',
          alignSelf: 'center',
          marginLeft: !matchesSm ? '0' : '20px',
          marginTop: '20px',
        }}
        startIcon={<AddFriendIcon />}
        variant="contained"
        disabled={buttonsDisabled}
        onClick={onSubmitFriendRequest}>
        Send Friend Request
      </Button>
    </FormGroup>
  );
}
