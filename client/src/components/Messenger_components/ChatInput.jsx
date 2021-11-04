import { memo } from 'react';

// components
import OutlinedInput from '@mui/material/OutlinedInput';
import InputAdornment from '@mui/material/InputAdornment';
import Tooltip from '../shared/Tooltip';
import IconButton from '@mui/material/IconButton';

// icons
import CreateIcon from '@mui/icons-material/Create';

const ChatInput = memo(({ value, onChange, onSubmit }) => {
  return (
    <OutlinedInput
      multiline
      className="_draggable__input"
      maxRows={4}
      sx={{ marginTop: 4, width: '98%' }} // this width also expands the width of the modal (as wanted tbh)
      placeholder="new message"
      value={value}
      onKeyPress={(e) => {
        const shiftKeyPressed = e.shiftKey;
        if (e.key !== 'Enter') return;

        // if key is enter but there is no value
        if (!value) {
          e.preventDefault();
          return;
        }

        // if key is enter and shift isn't pressed submit, else enter a new line
        if (!shiftKeyPressed) {
          onSubmit(value);
        }
      }}
      onChange={onChange}
      endAdornment={
        <InputAdornment position="end">
          <Tooltip title="Send message">
            <IconButton onClick={() => onSubmit(value)}>
              <CreateIcon />
            </IconButton>
          </Tooltip>
        </InputAdornment>
      }
    />
  );
});

export default ChatInput;
