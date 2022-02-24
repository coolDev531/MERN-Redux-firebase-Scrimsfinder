import { useState, useEffect, useCallback } from 'react';
import useAlerts from '../../../hooks/useAlerts';

// components
import LoadingSpinner from '../LoadingSpinner';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tooltip from './../Tooltip';
import Stack from '@mui/material/Stack';

// icons
import DiceIcon from '@mui/icons-material/Casino';

// services
import { generateRandomLobbyName } from './../../../services/wordsApi';

export default function LobbyNameFieldOld({
  value,
  onInputChange,
  setScrimData,
  direction = 'row',
  buttonText = 'Generate Lobby Name',
  isGenerateOnMount = true,
}) {
  const [isFetchingLobbyName, setIsFetchingLobbyName] = useState(false);
  const { setCurrentAlert } = useAlerts();

  const generateLobbyName = useCallback(async () => {
    setIsFetchingLobbyName(true);

    try {
      const randomLobbyName = await generateRandomLobbyName();
      setScrimData((prevState) => ({
        ...prevState,
        lobbyName: randomLobbyName,
      }));
      setIsFetchingLobbyName(false);
    } catch (error) {
      setCurrentAlert({
        type: 'Error',
        message: 'error generating random lobby name',
      });
      setIsFetchingLobbyName(false);
    }
  }, [setScrimData, setCurrentAlert]);

  useEffect(() => {
    if (isGenerateOnMount) {
      generateLobbyName();
    }
  }, [generateLobbyName, isGenerateOnMount]);

  return (
    <Stack alignItems="center" direction={direction}>
      <Tooltip title="Manually enter lobby name">
        <TextField
          sx={{ marginRight: 2 }}
          variant="standard"
          name="lobbyName"
          onChange={onInputChange}
          label="Lobby name"
          value={value}
        />
      </Tooltip>
      <Tooltip title="Generate a random name for the custom lobby">
        <span onMouseOver={(e) => e.preventDefault()}>
          <Button
            variant="outlined"
            disabled={isFetchingLobbyName}
            sx={{
              marginTop: '10px',
              textTransform: 'none',
              minWidth: 50,
              maxWidth: 300,
            }}
            startIcon={isFetchingLobbyName ? <LoadingSpinner /> : <DiceIcon />}
            onClick={generateLobbyName}>
            {buttonText}
          </Button>
        </span>
      </Tooltip>
    </Stack>
  );
}
