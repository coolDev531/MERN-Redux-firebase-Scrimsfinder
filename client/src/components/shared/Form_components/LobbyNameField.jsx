import { memo } from 'react';
import LoadingSpinner from '../LoadingSpinner';
import DiceIcon from '@mui/icons-material/Casino';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Tooltip from './../Tooltip';

function LobbyNameField({
  isFetchingLobbyName,
  value,
  onInputChange,
  onButtonClick,
}) {
  return (
    <>
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
        <span>
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
            onClick={onButtonClick}>
            Generate Lobby Name
          </Button>
        </span>
      </Tooltip>
    </>
  );
}

export default memo(LobbyNameField);
