import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { makeStyles } from '@mui/styles';

// components
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import Tooltip from './../Tooltip';

// icons
import MessengerIcon from '@mui/icons-material/Chat';

export default function MessengerButton() {
  const { conversations } = useSelector(({ messenger }) => messenger);

  const dispatch = useDispatch();

  const openMessenger = useCallback(() => {
    dispatch({ type: 'general/openMessenger' });
  }, [dispatch]);

  const classes = useStyles();

  return (
    <Grid item style={{ position: 'relative' }}>
      <Tooltip title="Messenger">
        <IconButton onClick={openMessenger}>
          {/* {conversations.length > 0 ? (
            <div className={classes.newMessagesCount}>
              {conversations.length}
            </div>
          ) : null} */}
          <MessengerIcon fontSize="large" />
        </IconButton>
      </Tooltip>
    </Grid>
  );
}

const useStyles = makeStyles({
  newMessagesCount: {
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
