import { useState, useCallback } from 'react';
import RefreshIcon from '@mui/icons-material/Refresh';
import Tooltip from '../shared/Tooltip';
import FormControlLabel from '@mui/material/FormControlLabel';
import IconButton from '@mui/material/IconButton';
import useTimeout from './../../hooks/useTimeout';
import { useScrimsActions } from '../../hooks/useScrims';

// this button is used in the navbar to re-fetch the scrims
export default function RefreshScrimsButton() {
  const { fetchScrims } = useScrimsActions();

  const [disabled, setDisabled] = useState(false);
  const [refreshCounter, setRefreshCounter] = useState(1);
  const [disableMS, setDisableMS] = useState(3000);

  const handleRefresh = useCallback(async () => {
    setRefreshCounter((prevState) => (prevState += 1));

    // fetch all existing scrims on the back-end.
    fetchScrims();

    // if refresh counter num is even, disable the button
    if (refreshCounter % 2 === 0) {
      setDisableMS(10000);
    } else {
      setDisableMS(5000);
    }

    setDisabled(true);
  }, [refreshCounter, fetchScrims]);

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
