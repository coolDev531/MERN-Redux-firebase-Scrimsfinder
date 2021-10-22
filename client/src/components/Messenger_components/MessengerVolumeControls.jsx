// hooks
import { useCallback, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';

// component
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import Slider from '@mui/material/Slider';
import VolumeUp from '@mui/icons-material/VolumeUp';
import Tooltip from '../shared/Tooltip';

export default function MessengerVolumeControls({ isShowing }) {
  const { msgNotificationVolume } = useSelector(({ messenger }) => messenger);
  const [volumeValue, setVolumeValue] = useState(() => {
    //  get the volume value from local storage
    const storedValue = JSON.parse(
      localStorage.getItem('scrimGymMessengerVolume'),
    );

    return storedValue ?? 25;
  });

  const dispatch = useDispatch();

  const saveVolumeValueToStore = useCallback(() => {
    if (volumeValue === msgNotificationVolume) return;
    dispatch({ type: 'messenger/setVolume', payload: volumeValue });
  }, [msgNotificationVolume, volumeValue, dispatch]);

  if (!isShowing) return null;

  return (
    <Box sx={{ width: 250, padding: '20px' }}>
      <Typography gutterBottom>Volume</Typography>
      <Grid container spacing={2} alignItems="center">
        <Grid item>
          <VolumeUp />
        </Grid>
        <Grid item xs>
          <Tooltip title={volumeValue}>
            <Slider
              min={0}
              max={100}
              onMouseUp={saveVolumeValueToStore}
              value={typeof volumeValue === 'number' ? volumeValue : 0}
              onBlur={saveVolumeValueToStore}
              onChange={(_e, newValue) => {
                setVolumeValue(newValue);
              }}
              aria-labelledby="volume-slider"
            />
          </Tooltip>
        </Grid>
      </Grid>
    </Box>
  );
}
