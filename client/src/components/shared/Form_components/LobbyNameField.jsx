import { useState, useEffect, useCallback } from 'react';
import useAlerts from '../../../hooks/useAlerts';

// components
import LoadingSpinner from '../LoadingSpinner';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tooltip from './../Tooltip';
import Grid from '@mui/material/Grid';

// icons
import DiceIcon from '@mui/icons-material/Casino';

// services
import { generateRandomLobbyName } from '../../../services/wordsApi';

export default function LobbyNameField({
  value,
  onInputChange,
  setScrimData,
  isGenerateOnMount = true,
}) {
  const [isFetchingLobbyName, setIsFetchingLobbyName] = useState(false);
  const [wordsCount, setWordsCount] = useState(2);
  const { setCurrentAlert } = useAlerts();

  const generateLobbyName = useCallback(async () => {
    setIsFetchingLobbyName(true);

    try {
      const randomLobbyName = await generateRandomLobbyName(wordsCount);
      setScrimData((prevState) => ({
        ...prevState,
        lobbyName: randomLobbyName,
      }));
      setIsFetchingLobbyName(false);
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message:
          error?.response.data?.error ?? 'Error generating random lobby name',
      });
      setIsFetchingLobbyName(false);
    }
  }, [setScrimData, setCurrentAlert, wordsCount]);

  useEffect(() => {
    if (isGenerateOnMount) {
      generateLobbyName();
    }

    return () => {
      if (isGenerateOnMount) {
        generateLobbyName();
      }
    };

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isGenerateOnMount]);

  return (
    <Grid
      container
      xs={12}
      md={8}
      spacing={{ xs: 2, sm: 2, md: 4 }}
      justifyContent="center">
      <Grid item container xs={6} sm={4} md={6}>
        <Grid
          item
          xs={10}
          sx={{
            marginLeft: 'auto',
          }}>
          <Tooltip title="Manually enter lobby name">
            <TextField
              sx={{ marginRight: 2 }}
              variant="standard"
              name="lobbyName"
              onChange={onInputChange}
              label="Lobby name"
              value={value}
              fullWidth
            />
          </Tooltip>
        </Grid>
      </Grid>

      <Grid item container xs={6} sm={6} md={6} spacing={2}>
        <Grid item xs={4} sm={6} md={6}>
          <TextField
            sx={{ marginRight: 2 }}
            variant="standard"
            name="wordsCount"
            type="number"
            onChange={(e) => setWordsCount(+e.target.value)}
            label="Word count"
            value={wordsCount}
            inputProps={{
              maxLength: 2,
              max: 4,
              min: 1,
            }}
            fullWidth
          />
        </Grid>

        <Grid item xs={6} sm={2} md={6}>
          <Tooltip title="Generate a random name for the custom lobby">
            <span onMouseOver={(e) => e.preventDefault()}>
              <Button
                variant="outlined"
                disabled={isFetchingLobbyName}
                sx={{
                  marginTop: '10px',
                  textTransform: 'none',
                }}
                onClick={generateLobbyName}>
                {isFetchingLobbyName ? <LoadingSpinner /> : <DiceIcon />}
              </Button>
            </span>
          </Tooltip>
        </Grid>
      </Grid>
    </Grid>
  );
}
