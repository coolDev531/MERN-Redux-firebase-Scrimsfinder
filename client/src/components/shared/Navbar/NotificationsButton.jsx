import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { makeStyles } from '@mui/styles';
import useAuth from '../../../hooks/useAuth';

// components
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from './../Tooltip';

// icons
import NotificationsIcon from '@mui/icons-material/Notifications';

export default function NotificationsButton() {
  const { currentUser } = useAuth();

  const dispatch = useDispatch();

  const notifications = currentUser?.notifications ?? [];

  const openNotifications = useCallback(() => {
    dispatch({ type: 'general/openNotifications' });
  }, [dispatch]);

  const classes = useStyles();

  return (
    <Grid item style={{ position: 'relative' }}>
      <Tooltip title="Notifications">
        <IconButton onClick={openNotifications}>
          {notifications.length > 0 ? (
            <div className={classes.notificationsCount}>
              {notifications.length}
            </div>
          ) : null}
          <NotificationsIcon fontSize="large" />
        </IconButton>
      </Tooltip>
    </Grid>
  );
}

const useStyles = makeStyles({
  notificationsCount: {
    backgroundColor: 'red',
    borderRadius: '50%',
    width: '24px',
    height: '24px',
    position: 'absolute',
    top: '0px',
    right: '-5px',
    fontSize: '1rem',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
});
