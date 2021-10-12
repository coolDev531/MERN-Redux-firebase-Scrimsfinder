import { useState, useCallback } from 'react';
import { useDispatch } from 'react-redux';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '../shared/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import useTimeout from './../../hooks/useTimeout';
import useScrims, { useScrimsActions } from '../../hooks/useScrims';

// button to re-fetch scrims that are visible in the page (see useScrims @ useScrimInterval)
export default function RefreshScrimsButton() {
  const { filteredScrims } = useScrims();
  const { fetchScrims } = useScrimsActions();

  const [disabled, setDisabled] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(1);
  const [disableMS, setDisableMS] = useState(3000);

  const dispatch = useDispatch();

  const handleRefresh = useCallback(async () => {
    setRefreshCounter((prevState) => (prevState += 1));

    if (filteredScrims.length) {
      // if there are visible scrims on the page, just change toggle fetch to refetch each scrim separately (useFetchScrimInterval)
      dispatch({ type: 'scrims/toggleFetch' });
    } else {
      // else if there aren't any visible scrims on the page, fetch all existing scrims on the back-end.
      fetchScrims();
    }

    // if refresh counter num is even, disable the button
    if (refreshCounter % 2 === 0) {
      setDisableMS(10000);
    } else {
      setDisableMS(5000);
    }

    setDisabled(true);
  }, [dispatch, refreshCounter, filteredScrims.length, fetchScrims]);

  useTimeout(
    () => {
      setDisabled(false);
    },
    disabled ? disableMS : null
  );

  return (
    <Tooltip title="Refresh scrims">
      <FormControlLabel
        control={
          <IconButton disabled={disabled} onClick={handleRefresh}>
            <RefreshIcon fontSize="large" />
          </IconButton>
        }
        label="Refresh scrims"
        labelPlacement="bottom"
      />
    </Tooltip>
  );
}
